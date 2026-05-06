// apps/api/src/marketplace/marketplace.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service'; // <-- 1. IMPORT AUDIT SERVICE

@Injectable()
export class MarketplaceService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService // <-- 2. INJECT AUDIT SERVICE
  ) {}

  async getPublicListings() {
    return this.prisma.unit.findMany({
      where: {
        is_listed: true,
        status: 'VACANT',
      },
      select: {
        id: true,
        unit_number: true,
        rent_amount: true,
        public_description: true,
        amenities: true,
        virtual_tour_url: true,
        updated_at: true,
        
        // --- NEW: Fetching the newly added schema fields! ---
        property_category: true,
        unit_type: true,
        furnishing_status: true,
        bedrooms: true,
        bathrooms: true,
        size_sqm: true,
        
        images: true, 
        
        property: {
          select: {
            name: true,
            address: true,
            type: true,
            landlord: {
              select: {
                id: true,
                company_name: true,
                contact_phone: true,
              }
            }
          }
        },
      },
      orderBy: { updated_at: 'desc' }
    });
  }

  // --- SUBMIT A NEW LEAD ---
  async createLead(data: { 
    unit_id: string; 
    landlord_id: string; 
    prospect_name: string; 
    prospect_email: string; 
    prospect_phone: string; 
    message: string; 
  }) {
    // 1. Verify the unit is actually listed and vacant
    const unit = await this.prisma.unit.findFirst({
      where: { id: data.unit_id, is_listed: true, status: 'VACANT' },
      include: { property: true }
    });

    if (!unit) {
      throw new BadRequestException('This unit is no longer available.');
    }

    // 2. Save the lead directly to the Landlord's CRM pipeline [cite: 151]
    const lead = await this.prisma.listingLead.create({
      data: {
        unit_id: data.unit_id,
        landlord_id: data.landlord_id,
        prospect_name: data.prospect_name,
        prospect_email: data.prospect_email,
        prospect_phone: data.prospect_phone,
        message: data.message,
        status: 'NEW' 
      }
    });

    // 3. --- AUDIT LOG ---
    // Note: Since marketplace leads are public (unauthenticated), 
    // we log this as a "SYSTEM" action so the landlord sees the incoming lead in their trail.
    await this.auditService.logActivity(
      data.landlord_id, // We use the landlord's ID as the workspace context
      'NEW_MARKETPLACE_LEAD', 
      `System generated a new inquiry from ${data.prospect_name} for Unit ${unit.unit_number} at ${unit.property.name}`
    );

    return lead;
  }
}