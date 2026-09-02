// apps/api/src/marketplace/marketplace.service.ts
import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MarketplaceService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // --- 1. DATA MASKING LOGIC ---
  async getMaskedListings(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.unit.findMany({
        where: {
          is_listed: true,
          status: 'VACANT',
        },
        take: limit,
        skip: skip,
        select: {
          id: true,
          unit_number: true,
          rent_amount: true,
          public_description: true,
          amenities: true,
          virtual_tour_url: true,
          updated_at: true,
          property_category: true,
          unit_type: true,
          furnishing_status: true,
          bedrooms: true,
          bathrooms: true,
          size_sqm: true,
          images: true,
          // Fetch property details
          property: {
            select: {
              name: true,
              address: true,
              latitude: true,
              longitude: true,
              landlord: {
                select: {
                  id: true,
                  company_name: true,
                  contact_phone: true,
                },
              },
            },
          },
        },
        orderBy: { updated_at: 'desc' },
      }),
      this.prisma.unit.count({
        where: { is_listed: true, status: 'VACANT' },
      }),
    ]);

    // MASKING PATTERN: Scrub sensitive fields before sending to client
    const maskedItems = items.map(item => ({
      ...item,
      property: {
        ...item.property,
        // No obfuscation of property name: actual name remains fully visible
        
        // Omit exact map coordinates
        latitude: null, 
        longitude: null,
        landlord: {
          ...item.property.landlord,
          // Omit phone number
          contact_phone: null, 
        }
      }
    }));

    return {
      data: maskedItems,
      meta: { total, page, last_page: Math.ceil(total / limit) },
    };
  }

  // --- 2. CHECKOUT LOGIC ---
  // CRITICAL FIX: Ensure userId is passed here so the payment links to the account
  async initiateUnlockPayment(unit_id: string, phone: string, userId: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unit_id } });
    if (!unit) throw new NotFoundException('Unit not found');

    // Check if this specific user has already unlocked this unit (regardless of phone number)
    const existingUnlock = await this.prisma.marketplaceUnlock.findFirst({
      where: { unit_id, user_id: userId, status: 'SUCCESS' }
    });

    if (existingUnlock) {
      return { message: 'Already unlocked', status: 'SUCCESS' };
    }

    // Upsert a PENDING record, securely attaching the user_id
    const unlockRecord = await this.prisma.marketplaceUnlock.upsert({
      where: {
        phone_number_unit_id: { phone_number: phone, unit_id }
      },
      update: { status: 'PENDING', amount_paid: 300, updated_at: new Date(), user_id: userId },
      create: {
        phone_number: phone,
        unit_id,
        user_id: userId, // Link payment to the logged-in user
        amount_paid: 300,
        status: 'PENDING',
      }
    });

    try {
      // TODO: Integrate actual Safaricom Daraja STK Push API here.
      // const darajaResponse = await this.mpesaService.sendStkPush(phone, 300, unlockRecord.id);
      
      return { 
        message: 'STK Push initiated successfully', 
        status: 'PENDING',
        unlock_id: unlockRecord.id
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to communicate with M-Pesa');
    }
  }

  // --- 3. REVEAL LOGIC ---
  async getUnlockStatusAndReveal(unit_id: string, phone: string) {
    const unlockRecord = await this.prisma.marketplaceUnlock.findUnique({
      where: {
        phone_number_unit_id: { phone_number: phone, unit_id }
      }
    });

    if (!unlockRecord) {
      throw new NotFoundException('No payment record found');
    }

    if (unlockRecord.status !== 'SUCCESS') {
      return { status: unlockRecord.status };
    }

    // If SUCCESS, fetch the exact unmasked data
    const unit = await this.prisma.unit.findUnique({
      where: { id: unit_id },
      include: {
        property: {
          include: { landlord: true }
        }
      }
    });

    if (!unit) {
      throw new NotFoundException('Unit details could not be found');
    }

    return {
      status: 'SUCCESS',
      exact_name: unit.property.name,
      revealed_phone: unit.property.landlord.contact_phone,
      latitude: unit.property.latitude,
      longitude: unit.property.longitude,
    };
  }

  // --- 4. WEBHOOK LOGIC ---
  async processMpesaCallback(payload: any) {
    try {
      const callbackData = payload.Body.stkCallback;
      const resultCode = callbackData.ResultCode;
      
      // In a real scenario, you pass the `unlockRecord.id` in the STK push AccountReference 
      // or map it using the CheckoutRequestID from Safaricom.
      const checkoutRequestId = callbackData.CheckoutRequestID; 
      
      // We will look up the transaction by CheckoutRequestID (assuming you saved it during STK push)
      // For this example, we assume you have a way to match the callback to the unlock record.
      // Let's assume you added `checkout_request_id` to `MarketplaceUnlock` model.

      const status = resultCode === 0 ? 'SUCCESS' : 'FAILED';
      let receipt = null;

      if (resultCode === 0) {
        const metadata = callbackData.CallbackMetadata.Item;
        receipt = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      }

      // Find and update the corresponding unlock record
      // NOTE: Ensure your schema has `checkout_request_id` if you use Daraja
      await this.prisma.marketplaceUnlock.updateMany({
        where: { checkout_request_id: checkoutRequestId },
        data: {
          status: status,
          mpesa_receipt: receipt,
          unlocked_at: status === 'SUCCESS' ? new Date() : null,
          updated_at: new Date()
        }
      });

    } catch (error) {
      console.error('Error processing M-Pesa callback:', error);
    }
  }

  // --- RESTORED: CRM LEAD LOGIC ---
  async createLead(data: any) {
    // 1. Verify unit availability and get the landlord ID securely
    const unit = await this.prisma.unit.findFirst({
      where: { id: data.unit_id, is_listed: true, status: 'VACANT' },
      select: {
        id: true,
        unit_number: true,
        property: {
          select: {
            name: true,
            landlord_id: true,
          },
        },
      },
    });

    if (!unit) {
      throw new BadRequestException('This unit is no longer available.');
    }

    const landlordId = unit.property.landlord_id;

    // 2. Save lead directly to the Landlord's CRM pipeline
    const lead = await this.prisma.listingLead.create({
      data: {
        unit_id: data.unit_id,
        landlord_id: landlordId,
        prospect_name: data.prospect_name,
        prospect_email: data.prospect_email,
        prospect_phone: data.prospect_phone,
        message: data.message,
        status: 'NEW',
      },
    });

    // 3. Log audit activity securely
    try {
        await this.auditService.logActivity(
          landlordId,
          'NEW_MARKETPLACE_LEAD',
          `System generated a new inquiry from ${data.prospect_name} for Unit ${unit.unit_number} at ${unit.property.name}`,
        );
    } catch (e) {
        console.error("Audit log failed, but lead was created", e);
    }

    return lead;
  }
}