// apps/api/src/units/units.service.ts
/* eslint-disable */
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // <-- Add import at top
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class UnitsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) { }

  async createUnit(userId: string, propertyId: string, data: { unit_number: string; rent_amount: number }) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord profile not found.');

    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, landlord_id: landlord.id }
    });

    if (!property) throw new UnauthorizedException('You do not have permission to modify this property.');

    const status = landlord.subscription_status || 'FREE';

    // ==========================================
    // SUBSCRIPTION LIMIT ENFORCEMENT
    // ==========================================

    // 1. Enforce 3-Month Expiration for Starter Plan
    if (status === 'FREE' || status === 'STARTER') {
      const threeMonthsInMillis = 90 * 24 * 60 * 60 * 1000; // 90 days
      const timeSinceRegistration = new Date().getTime() - new Date(landlord.created_at).getTime();

      if (timeSinceRegistration > threeMonthsInMillis) {
        throw new ForbiddenException('Your 3-month Starter plan has expired. Please upgrade to Basic or Professional to add more units.');
      }
    }

    // 2. Count all existing units across ALL properties owned by this landlord
    const currentUnitsCount = await this.prisma.unit.count({
      where: { property: { landlord_id: landlord.id } }
    });

    // 3. Enforce Starter Plan Limit (Max 3 Units)
    if ((status === 'FREE' || status === 'STARTER') && currentUnitsCount >= 3) {
      throw new ForbiddenException('Starter plan limit reached (max 3 units). Please upgrade your plan to add more units.');
    }

    // 4. Enforce Basic Plan Limit (Max 30 Units)
    if (status === 'BASIC' && currentUnitsCount >= 30) {
      throw new ForbiddenException('Basic plan limit reached (max 30 units). Please upgrade to Professional for unlimited units.');
    }

    // ==========================================

    // If checks pass (or they are on PRO/PREMIUM), create the unit!
    return this.prisma.unit.create({
      data: {
        property_id: propertyId,
        unit_number: data.unit_number,
        rent_amount: Number(data.rent_amount),
        status: 'VACANT',
      },
    });
  }

  async getUnits(userId: string, propertyId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });

    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, landlord_id: landlord?.id },
      include: {
        units: {
          orderBy: { unit_number: 'asc' },
          include: {
            tenants: {
              where: { is_active: true },
              include: { invoices: true }
            }
          }
        }
      }
    });

    if (!property) throw new UnauthorizedException('Access denied.');
    return property;
  }

  // --- NEW: EDIT UNIT ---
  async updateUnit(userId: string, unitId: string, data: { unit_number: string; rent_amount: number }) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId }, include: { property: true } });

    if (!unit || unit.property.landlord_id !== landlord?.id) {
      throw new UnauthorizedException('Access denied.');
    }

    return this.prisma.unit.update({
      where: { id: unitId },
      data: {
        unit_number: data.unit_number,
        rent_amount: Number(data.rent_amount)
      }
    });
  }

  // --- NEW: DELETE UNIT ---
  async deleteUnit(userId: string, unitId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId }, include: { property: true } });

    if (!unit || unit.property.landlord_id !== landlord?.id) {
      throw new UnauthorizedException('Access denied.');
    }

    // Prevent deletion if a tenant is currently occupying it
    const activeTenant = await this.prisma.tenant.findFirst({ where: { unit_id: unitId, is_active: true } });
    if (activeTenant) {
      throw new BadRequestException('Cannot delete a unit with an active tenant. Move them out first.');
    }

    return this.prisma.unit.delete({ where: { id: unitId } });
  }

  // --- NEW: CREATE TENANT (Move In) ---
  async createTenant(userId: string, unitId: string, data: any) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId }, include: { property: true } });

    if (!unit || unit.property.landlord_id !== landlord?.id) {
      throw new UnauthorizedException('Access denied.');
    }

    if (unit.status === 'OCCUPIED') {
      throw new BadRequestException('This unit is already occupied.');
    }

    // Transaction: Create tenant AND mark unit as OCCUPIED safely
    return this.prisma.$transaction([
      this.prisma.tenant.create({
        data: {
          unit_id: unitId,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          lease_start: new Date(data.lease_start),
          lease_end: new Date(data.lease_end),
          is_active: true
        }
      }),
      this.prisma.unit.update({
        where: { id: unitId },
        data: { status: 'OCCUPIED' }
      })
    ]);
  }

  // --- NEW: MOVE OUT TENANT ---
  async moveOutTenant(userId: string, tenantId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { unit: { include: { property: true } } }
    });

    if (!tenant || tenant.unit.property.landlord_id !== landlord?.id) {
      throw new UnauthorizedException('Access denied.');
    }

    // Transaction: Deactivate tenant AND mark unit as VACANT
    return this.prisma.$transaction([
      this.prisma.tenant.update({
        where: { id: tenantId },
        data: { is_active: false }
      }),
      this.prisma.unit.update({
        where: { id: tenant.unit_id },
        data: { status: 'VACANT' }
      })
    ]);
  }

  // --- RECORD UTILITIES & INVOICING ---
  async recordMeterReading(userId: string, unitId: string, data: { utilityType: string; reading: number; unitPrice: number }) {
    // 1. Verify landlord owns the unit and get the active tenant
    const unit = await this.prisma.unit.findFirst({
      where: { id: unitId, property: { landlord: { user_id: userId } } },
      include: { tenants: { where: { is_active: true } } }
    });

    if (!unit) throw new UnauthorizedException('Unit not found or access denied.');

    const activeTenant = unit.tenants[0];
    if (!activeTenant) throw new BadRequestException('Cannot record utilities for a vacant unit.');

    // 2. Fetch the previous reading from the database to calculate consumption
    const previousReading = await this.prisma.meterReading.findFirst({
      where: { unit_id: unit.id, utilityType: data.utilityType },
      orderBy: { created_at: 'desc' }
    });

    const prevValue = previousReading ? previousReading.reading : 0;
    const consumption = Math.max(0, data.reading - prevValue); // Ensure it's not negative
    const amountDue = consumption * data.unitPrice;

    // 3. Database Transaction: Save reading AND generate the Tenant's Bill
    await this.prisma.$transaction(async (tx) => {
      // Save the raw reading
      await tx.meterReading.create({
        data: {
          unit_id: unit.id,
          utilityType: data.utilityType,
          reading: data.reading
        }
      });

      // Only generate an invoice if they actually consumed units
      if (amountDue > 0) {
        const utilityName = data.utilityType.charAt(0).toUpperCase() + data.utilityType.slice(1);
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

        await tx.invoice.create({
          data: {
            tenant_id: activeTenant.id,
            amount: amountDue,
            description: `${utilityName} Bill - ${currentMonth} (${consumption} units)`,
            // Set due date to the 5th of the upcoming month
            due_date: new Date(new Date().setDate(5)),
          }
        });
      }
    });

    return {
      status: 'success',
      message: `Recorded ${data.utilityType} reading of ${data.reading} for Unit ${unit.unit_number}. Invoice generated for KSH ${amountDue.toLocaleString()}.`
    };
  }

  // --- MARKETPLACE LISTING LOGIC ---
  async updateListingDetails(unitId: string, userId: string, data: { 
    is_listed?: boolean; 
    public_description?: string; 
    amenities?: string[]; 
    virtual_tour_url?: string; 
    property_category?: any;
    unit_type?: any;
    furnishing_status?: any;
    bedrooms?: number | null;
    bathrooms?: number | null;
    size_sqm?: number | null;
  }) {
    // Find the landlord profile using the userId from the JWT
    const landlord = await this.prisma.landlord.findUnique({ 
      where: { user_id: userId } 
    });

    const unit = await this.prisma.unit.findFirst({
      where: { 
        id: unitId,
        property: { landlord_id: landlord?.id }
      }
    });

    if (!unit) {
      throw new BadRequestException('Unit not found or unauthorized');
    }

    // PREVENT LISTING OCCUPIED UNITS
    if (data.is_listed && unit.status === 'OCCUPIED') {
      throw new BadRequestException('Cannot list an occupied unit on the public marketplace.');
    }

    return this.prisma.unit.update({
      where: { id: unitId },
      data: {
        is_listed: data.is_listed,
        public_description: data.public_description,
        amenities: data.amenities,
        virtual_tour_url: data.virtual_tour_url,
        // SAVE NEW FIELDS TO DATABASE:
        property_category: data.property_category,
        unit_type: data.unit_type,
        furnishing_status: data.furnishing_status,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        size_sqm: data.size_sqm,
      }
    });
  }

  // --- GET SINGLE UNIT ---
  async getUnitById(userId: string, unitId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    
    const unit = await this.prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        property: true, // Pull in property info
        tenants: {      // Pull in the active tenant info
          where: { is_active: true },
          include: { invoices: true }
        }
      }
    });

    if (!unit || unit.property.landlord_id !== landlord?.id) {
      throw new NotFoundException('Unit not found or access denied.');
    }

    return unit;
  }

  // --- NEW: UPLOAD IMAGES ---
  async uploadUnitImages(userId: string, unitId: string, files: Express.Multer.File[]) {
    // 1. Verify landlord owns this unit
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    const unit = await this.prisma.unit.findFirst({
      where: { id: unitId, property: { landlord_id: landlord?.id } }
    });

    if (!unit) throw new UnauthorizedException('Access denied or unit not found.');

    const uploadedImages: any[] = [];

    // 2. Loop through the files and upload to Cloudinary
    for (const [index, file] of files.entries()) {
      // Upload to a clean folder structure in Cloudinary
      const result = await this.cloudinary.uploadImage(file, `mogirentos/units/${unitId}`);
      
      // 3. Save the secure Cloudinary URL to your Neon Database
      const unitImage = await this.prisma.unitImage.create({
        data: {
          unit_id: unitId,
          url: result.secure_url,
          is_primary: index === 0, // Make the first uploaded image the "cover" photo
        }
      });
      uploadedImages.push(unitImage);
    }

    return {
      message: `Successfully uploaded ${uploadedImages.length} images.`,
      images: uploadedImages
    };
  }
}