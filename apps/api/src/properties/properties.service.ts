// apps/api/src/properties/properties.service.ts
/* eslint-disable */
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service'; // <-- 1. IMPORT AUDIT SERVICE

@Injectable()
export class PropertiesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService // <-- 2. INJECT AUDIT SERVICE
  ) {}

  async createProperty(userId: string, data: { name: string; address: string; type?: string }) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { user_id: userId },
    });

    if (!landlord) throw new NotFoundException('Landlord profile not found.');

    const status = landlord.subscription_status || 'FREE';

    // ==========================================
    // SUBSCRIPTION LIMIT ENFORCEMENT
    // ==========================================
    if (status === 'FREE' || status === 'STARTER') {
      const threeMonthsInMillis = 90 * 24 * 60 * 60 * 1000; // 90 days
      const timeSinceRegistration = new Date().getTime() - new Date(landlord.created_at).getTime();
      
      if (timeSinceRegistration > threeMonthsInMillis) {
        throw new ForbiddenException('Your 3-month Starter plan has expired. Please upgrade to Basic or Professional to continue managing your portfolio.');
      }
    }

    const currentPropertiesCount = await this.prisma.property.count({
      where: { landlord_id: landlord.id }
    });

    if ((status === 'FREE' || status === 'STARTER') && currentPropertiesCount >= 1) {
      throw new ForbiddenException('Starter plan allows a maximum of 1 property. Please upgrade to Basic or Professional to add more.');
    }

    if (status === 'BASIC' && currentPropertiesCount >= 3) {
      throw new ForbiddenException('Basic plan allows a maximum of 3 properties. Please upgrade to Professional for unlimited properties.');
    }

    const property = await this.prisma.property.create({
      data: {
        landlord_id: landlord.id,
        name: data.name,
        address: data.address,
        type: data.type || 'RESIDENTIAL',
      },
    });

    // --- AUDIT LOG ---
    await this.auditService.logActivity(userId, 'CREATED_PROPERTY', `Added a new ${property.type} property: ${property.name}`);

    return property;
  }

  // --- REVISED: RBAC DATA ISOLATION ---
  async getProperties(userId: string) {
    // 1. Try resolving as a Landlord (Owner)
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (landlord) {
      return this.prisma.property.findMany({
        where: { landlord_id: landlord.id },
        include: { 
          units: { include: { tenants: true } },
          announcements: true 
        }, 
        orderBy: { created_at: 'desc' }
      });
    }

    // 2. Try resolving as Staff (Caretaker, Manager, etc.)
    const staff = await this.prisma.staff.findUnique({
      where: { user_id: userId },
      include: { assignments: true }
    });

    if (staff) {
      // Isolate view to ONLY the properties they are assigned to
      const assignedPropertyIds = staff.assignments.map((a: any) => a.property_id);
      
      return this.prisma.property.findMany({
        where: { 
          landlord_id: staff.landlord_id,
          id: { in: assignedPropertyIds } 
        },
        include: { 
          units: { include: { tenants: true } },
          announcements: true 
        }, 
        orderBy: { created_at: 'desc' }
      });
    }

    throw new UnauthorizedException('Access denied. No landlord or staff profile found.');
  }

  // --- REVISED: RBAC DATA ISOLATION ---
  async getPropertyById(userId: string, propertyId: string) {
    // FIXED: Explicitly declare type as string | null
    let validLandlordId: string | null = null; 

    // Check Landlord
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (landlord) {
      validLandlordId = landlord.id;
    } else {
      // Check Staff
      const staff = await this.prisma.staff.findUnique({
        where: { user_id: userId },
        include: { assignments: true }
      });

      if (staff) {
        // Verify this staff member is explicitly assigned to this property
        const isAssigned = staff.assignments.some((a: any) => a.property_id === propertyId);
        if (!isAssigned) {
          throw new ForbiddenException('You are not authorized to access this property.');
        }
        validLandlordId = staff.landlord_id;
      }
    }

    if (!validLandlordId) throw new UnauthorizedException('Access denied.');

    const property = await this.prisma.property.findFirst({
      where: { 
        id: propertyId,
        landlord_id: validLandlordId
      },
      include: {
        units: {
          include: {
            tenants: {
              where: { is_active: true }
            }
          },
          orderBy: { unit_number: 'asc' } 
        }
      }
    });

    if (!property) throw new NotFoundException('Property not found.');
    return property;
  }

  async updateProperty(userId: string, propertyId: string, data: { name?: string; address?: string; type?: string }) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new UnauthorizedException('Only landlords can modify property details.');
    
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, landlord_id: landlord.id }
    });
    if (!property) throw new UnauthorizedException('Access denied or property not found.');

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.address && { address: data.address }),
        ...(data.type && { type: data.type }),
      }
    });

    // --- AUDIT LOG ---
    await this.auditService.logActivity(userId, 'UPDATED_PROPERTY', `Modified details for property: ${updated.name}`);

    return updated;
  }

  async deleteProperty(userId: string, propertyId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new UnauthorizedException('Only landlords can delete properties.');
    
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, landlord_id: landlord.id },
      include: { units: true }
    });

    if (!property) throw new UnauthorizedException('Access denied or property not found.');

    if (property.units.length > 0) {
      throw new BadRequestException('Cannot delete a property that contains units. Please delete the units first.');
    }

    const deleted = await this.prisma.property.delete({
      where: { id: propertyId }
    });

    // --- AUDIT LOG ---
    await this.auditService.logActivity(userId, 'DELETED_PROPERTY', `Permanently deleted property: ${deleted.name}`);

    return deleted;
  }

  // --- REVISED: RBAC DATA ISOLATION ---
  async postAnnouncement(userId: string, propertyId: string, data: { title: string; message: string; type: string }) {
    let validLandlordId: string | null = null; 

    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (landlord) {
      validLandlordId = landlord.id;
    } else {
      const staff = await this.prisma.staff.findUnique({
        where: { user_id: userId },
        include: { assignments: true }
      });

      if (staff) {
        const isAssigned = staff.assignments.some((a: any) => a.property_id === propertyId);
        if (!isAssigned) throw new ForbiddenException('You are not authorized to post announcements to this property.');
        validLandlordId = staff.landlord_id;
      }
    }

    if (!validLandlordId) throw new UnauthorizedException('Access denied.');
    
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, landlord_id: validLandlordId }
    });
    
    if (!property) throw new NotFoundException('Property not found.');

    const announcement = await this.prisma.announcement.create({
      data: { 
        property_id: property.id, 
        title: data.title, 
        message: data.message, 
        type: data.type 
      }
    });

    // --- AUDIT LOG ---
    await this.auditService.logActivity(userId, 'POSTED_PROPERTY_ANNOUNCEMENT', `Posted a ${data.type} announcement titled "${data.title}" to ${property.name}`);

    return {
      status: 'success',
      message: 'Announcement broadcasted successfully to all tenants in ' + property.name,
      announcement
    };
  }
}