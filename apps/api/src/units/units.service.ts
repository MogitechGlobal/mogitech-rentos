// apps/api/src/units/units.service.ts
/* eslint-disable */
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; 
import { AuditService } from '../audit/audit.service'; // <-- 1. IMPORT AUDIT SERVICE

@Injectable()
export class UnitsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private auditService: AuditService // <-- 2. INJECT AUDIT SERVICE
  ) { }

  // --- RBAC DATA ISOLATION HELPER ---
  private async resolveAccess(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (landlord) {
        return { 
            landlordId: landlord.id, 
            propertyIds: null, 
            subscriptionStatus: landlord.subscription_status, 
            createdAt: landlord.created_at 
        };
    }

    const staff = await this.prisma.staff.findUnique({
        where: { user_id: userId },
        include: { assignments: true, landlord: true }
    });

    if (staff) {
        return {
            landlordId: staff.landlord_id,
            propertyIds: staff.assignments.map(a => a.property_id), 
            subscriptionStatus: staff.landlord.subscription_status,
            createdAt: staff.landlord.created_at
        };
    }

    throw new UnauthorizedException('Access denied. No landlord or staff profile found.');
  }

  async createUnit(userId: string, propertyId: string, data: { unit_number: string; rent_amount: number }) {
    const access = await this.resolveAccess(userId);

    const property = await this.prisma.property.findFirst({
      where: { 
          id: propertyId, 
          landlord_id: access.landlordId,
          ...(access.propertyIds ? { id: { in: access.propertyIds } } : {}) 
      }
    });

    if (!property) throw new UnauthorizedException('You do not have permission to modify this property.');

    const status = access.subscriptionStatus || 'FREE';

    // ==========================================
    // SUBSCRIPTION LIMIT ENFORCEMENT
    // ==========================================

    // 1. Enforce 3-Month Expiration for Starter Plan
    if (status === 'FREE' || status === 'STARTER') {
      const threeMonthsInMillis = 90 * 24 * 60 * 60 * 1000; // 90 days
      const timeSinceRegistration = new Date().getTime() - new Date(access.createdAt).getTime();

      if (timeSinceRegistration > threeMonthsInMillis) {
        throw new ForbiddenException('Your 3-month Starter plan has expired. Please upgrade to Basic or Professional to add more units.');
      }
    }

    // 2. Count all existing units across ALL properties owned by this landlord
    const currentUnitsCount = await this.prisma.unit.count({
      where: { property: { landlord_id: access.landlordId } }
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

    const unit = await this.prisma.unit.create({
      data: {
        property_id: propertyId,
        unit_number: data.unit_number,
        rent_amount: Number(data.rent_amount),
        status: 'VACANT',
      },
    });

    // --- AUDIT LOG ---
    await this.auditService.logActivity(userId, 'CREATED_UNIT', `Added Unit ${unit.unit_number} to ${property.name}`);

    return unit;
  }

  async getUnits(userId: string, propertyId: string) {
    const access = await this.resolveAccess(userId);

    // Verify staff explicitly has access to this property
    if (access.propertyIds && !access.propertyIds.includes(propertyId)) {
        throw new UnauthorizedException('Access denied to this property.');
    }

    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, landlord_id: access.landlordId },
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

    if (!property) throw new UnauthorizedException('Property not found or access denied.');
    return property;
  }

  async updateUnit(userId: string, unitId: string, data: { unit_number: string; rent_amount: number }) {
    const access = await this.resolveAccess(userId);
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId }, include: { property: true } });

    if (!unit || unit.property.landlord_id !== access.landlordId) throw new UnauthorizedException('Access denied.');
    if (access.propertyIds && !access.propertyIds.includes(unit.property_id)) throw new UnauthorizedException('Access denied to this property.');

    const updatedUnit = await this.prisma.unit.update({
      where: { id: unitId },
      data: {
        unit_number: data.unit_number,
        rent_amount: Number(data.rent_amount)
      }
    });

    // --- AUDIT LOG ---
    await this.auditService.logActivity(userId, 'UPDATED_UNIT', `Updated details for Unit ${updatedUnit.unit_number} at ${unit.property.name}`);

    return updatedUnit;
  }

  async deleteUnit(userId: string, unitId: string) {
    const access = await this.resolveAccess(userId);
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId }, include: { property: true } });

    if (!unit || unit.property.landlord_id !== access.landlordId) throw new UnauthorizedException('Access denied.');
    if (access.propertyIds && !access.propertyIds.includes(unit.property_id)) throw new UnauthorizedException('Access denied to this property.');

    // Prevent deletion if a tenant is currently occupying it
    const activeTenant = await this.prisma.tenant.findFirst({ where: { unit_id: unitId, is_active: true } });
    if (activeTenant) {
      throw new BadRequestException('Cannot delete a unit with an active tenant. Move them out first.');
    }

    const deletedUnit = await this.prisma.unit.delete({ where: { id: unitId } });

    // --- AUDIT LOG ---
    await this.auditService.logActivity(userId, 'DELETED_UNIT', `Deleted Unit ${deletedUnit.unit_number} from ${unit.property.name}`);

    return deletedUnit;
  }

  async createTenant(userId: string, unitId: string, data: any) {
    const access = await this.resolveAccess(userId);
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId }, include: { property: true } });

    if (!unit || unit.property.landlord_id !== access.landlordId) throw new UnauthorizedException('Access denied.');
    if (access.propertyIds && !access.propertyIds.includes(unit.property_id)) throw new UnauthorizedException('Access denied to this property.');

    if (unit.status === 'OCCUPIED') {
      throw new BadRequestException('This unit is already occupied.');
    }

    const result = await this.prisma.$transaction([
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

    // --- AUDIT LOG ---
    await this.auditService.logActivity(userId, 'CREATED_TENANT_LEASE', `Manually added tenant ${data.first_name} ${data.last_name} to Unit ${unit.unit_number}`);

    return result;
  }

  async moveOutTenant(userId: string, tenantId: string) {
    const access = await this.resolveAccess(userId);
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { unit: { include: { property: true } } }
    });

    if (!tenant || tenant.unit.property.landlord_id !== access.landlordId) throw new UnauthorizedException('Access denied.');
    if (access.propertyIds && !access.propertyIds.includes(tenant.unit.property_id)) throw new UnauthorizedException('Access denied to this property.');

    const result = await this.prisma.$transaction([
      this.prisma.tenant.update({
        where: { id: tenantId },
        data: { is_active: false }
      }),
      this.prisma.unit.update({
        where: { id: tenant.unit_id },
        data: { status: 'VACANT' }
      })
    ]);

    // --- AUDIT LOG ---
    await this.auditService.logActivity(userId, 'MOVED_OUT_TENANT', `Moved out tenant ${tenant.first_name} ${tenant.last_name} and vacated Unit ${tenant.unit.unit_number}`);

    return result;
  }

  // --- RECORD UTILITIES & INVOICING ---
  async recordMeterReading(userId: string, unitId: string, data: { utilityType: string; reading: number; unitPrice: number }) {
    const access = await this.resolveAccess(userId);

    const unit = await this.prisma.unit.findFirst({
      where: { 
          id: unitId, 
          property: { 
              landlord_id: access.landlordId,
              ...(access.propertyIds ? { id: { in: access.propertyIds } } : {})
          } 
      },
      include: { tenants: { where: { is_active: true } }, property: true }
    });

    if (!unit) throw new UnauthorizedException('Unit not found or access denied.');

    const activeTenant = unit.tenants[0];
    if (!activeTenant) throw new BadRequestException('Cannot record utilities for a vacant unit.');

    const previousReading = await this.prisma.meterReading.findFirst({
      where: { unit_id: unit.id, utilityType: data.utilityType },
      orderBy: { created_at: 'desc' }
    });

    const prevValue = previousReading ? previousReading.reading : 0;
    const consumption = Math.max(0, data.reading - prevValue); // Ensure it's not negative
    const amountDue = consumption * data.unitPrice;

    await this.prisma.$transaction(async (tx) => {
      await tx.meterReading.create({
        data: {
          unit_id: unit.id,
          utilityType: data.utilityType,
          reading: data.reading
        }
      });

      if (amountDue > 0) {
        const utilityName = data.utilityType.charAt(0).toUpperCase() + data.utilityType.slice(1);
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

        await tx.invoice.create({
          data: {
            tenant_id: activeTenant.id,
            amount: amountDue,
            description: `${utilityName} Bill - ${currentMonth} (${consumption} units)`,
            due_date: new Date(new Date().setDate(5)),
          }
        });
      }
    });

    // --- AUDIT LOG ---
    await this.auditService.logActivity(userId, 'RECORDED_METER_READING', `Recorded ${data.utilityType} reading of ${data.reading} for Unit ${unit.unit_number} at ${unit.property.name}`);

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
    const access = await this.resolveAccess(userId);

    const unit = await this.prisma.unit.findFirst({
      where: { 
        id: unitId,
        property: { 
            landlord_id: access.landlordId,
            ...(access.propertyIds ? { id: { in: access.propertyIds } } : {})
        }
      }
    });

    if (!unit) {
      throw new BadRequestException('Unit not found or unauthorized');
    }

    if (data.is_listed && unit.status === 'OCCUPIED') {
      throw new BadRequestException('Cannot list an occupied unit on the public marketplace.');
    }

    const updatedUnit = await this.prisma.unit.update({
      where: { id: unitId },
      data: {
        is_listed: data.is_listed,
        public_description: data.public_description,
        amenities: data.amenities,
        virtual_tour_url: data.virtual_tour_url,
        property_category: data.property_category,
        unit_type: data.unit_type,
        furnishing_status: data.furnishing_status,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        size_sqm: data.size_sqm,
      }
    });

    // --- AUDIT LOG ---
    await this.auditService.logActivity(userId, 'UPDATED_MARKETPLACE_LISTING', `Updated marketplace listing settings for Unit ${unit.unit_number}`);

    return updatedUnit;
  }

  // --- GET SINGLE UNIT ---
  async getUnitById(userId: string, unitId: string) {
    const access = await this.resolveAccess(userId);
    
    const unit = await this.prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        property: true, 
        tenants: {      
          where: { is_active: true },
          include: { invoices: true }
        }
      }
    });

    if (!unit || unit.property.landlord_id !== access.landlordId) throw new NotFoundException('Unit not found or access denied.');
    if (access.propertyIds && !access.propertyIds.includes(unit.property_id)) throw new UnauthorizedException('Access denied to this property.');

    return unit;
  }

  // --- NEW: UPLOAD IMAGES ---
  async uploadUnitImages(userId: string, unitId: string, files: Express.Multer.File[]) {
    const access = await this.resolveAccess(userId);
    const unit = await this.prisma.unit.findFirst({
      where: { 
          id: unitId, 
          property: { 
              landlord_id: access.landlordId,
              ...(access.propertyIds ? { id: { in: access.propertyIds } } : {}) 
          } 
      },
      include: { property: true }
    });

    if (!unit) throw new UnauthorizedException('Access denied or unit not found.');

    const uploadedImages: any[] = [];

    for (const [index, file] of files.entries()) {
      const result = await this.cloudinary.uploadImage(file, `mogirentos/units/${unitId}`);
      
      const unitImage = await this.prisma.unitImage.create({
        data: {
          unit_id: unitId,
          url: result.secure_url,
          is_primary: index === 0, 
        }
      });
      uploadedImages.push(unitImage);
    }

    // --- AUDIT LOG ---
    await this.auditService.logActivity(userId, 'UPLOADED_UNIT_IMAGES', `Uploaded ${files.length} images to the gallery for Unit ${unit.unit_number}`);

    return {
      message: `Successfully uploaded ${uploadedImages.length} images.`,
      images: uploadedImages
    };
  }
}