// apps/api/src/properties/properties.service.ts
/* eslint-disable */
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async createProperty(userId: string, data: { name: string; address: string; type?: string }) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { user_id: userId },
    });

    if (!landlord) throw new NotFoundException('Landlord profile not found.');

    const status = landlord.subscription_status || 'FREE';

    // ==========================================
    // SUBSCRIPTION LIMIT ENFORCEMENT
    // ==========================================

    // 1. Enforce 3-Month Expiration for Starter Plan
    if (status === 'FREE' || status === 'STARTER') {
      const threeMonthsInMillis = 90 * 24 * 60 * 60 * 1000; // 90 days
      const timeSinceRegistration = new Date().getTime() - new Date(landlord.created_at).getTime();
      
      if (timeSinceRegistration > threeMonthsInMillis) {
        throw new ForbiddenException('Your 3-month Starter plan has expired. Please upgrade to Basic or Professional to continue managing your portfolio.');
      }
    }

    // 2. Count existing properties
    const currentPropertiesCount = await this.prisma.property.count({
      where: { landlord_id: landlord.id }
    });

    // 3. Enforce Starter Plan Limit (Max 1 Property)
    if ((status === 'FREE' || status === 'STARTER') && currentPropertiesCount >= 1) {
      throw new ForbiddenException('Starter plan allows a maximum of 1 property. Please upgrade to Basic or Professional to add more.');
    }

    // 4. Enforce Basic Plan Limit (Max 3 Properties)
    if (status === 'BASIC' && currentPropertiesCount >= 3) {
      throw new ForbiddenException('Basic plan allows a maximum of 3 properties. Please upgrade to Professional for unlimited properties.');
    }
    // ==========================================

    return this.prisma.property.create({
      data: {
        landlord_id: landlord.id,
        name: data.name,
        address: data.address,
        type: data.type || 'RESIDENTIAL',
      },
    });
  }

  async getProperties(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord profile not found.');

    return this.prisma.property.findMany({
      where: { landlord_id: landlord.id },
      include: { 
        units: {
          include: {
            tenants: true 
          }
        },
        // ---> CRITICAL FIX: Include Announcements <---
        announcements: true 
      }, 
      orderBy: { created_at: 'desc' }
    });
  }

  async getPropertyById(userId: string, propertyId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord profile not found.');

    const property = await this.prisma.property.findFirst({
      where: { 
        id: propertyId,
        landlord_id: landlord.id
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

    if (!property) throw new NotFoundException('Property not found or access denied.');
    return property;
  }

  async updateProperty(userId: string, propertyId: string, data: { name?: string; address?: string; type?: string }) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, landlord_id: landlord?.id }
    });
    if (!property) throw new UnauthorizedException('Access denied or property not found.');

    return this.prisma.property.update({
      where: { id: propertyId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.address && { address: data.address }),
        ...(data.type && { type: data.type }),
      }
    });
  }

  async deleteProperty(userId: string, propertyId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, landlord_id: landlord?.id },
      include: { units: true }
    });

    if (!property) throw new UnauthorizedException('Access denied or property not found.');

    if (property.units.length > 0) {
      throw new BadRequestException('Cannot delete a property that contains units. Please delete the units first.');
    }

    return this.prisma.property.delete({
      where: { id: propertyId }
    });
  }

  async postAnnouncement(userId: string, propertyId: string, data: { title: string; message: string; type: string }) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, landlord_id: landlord?.id }
    });
    
    if (!property) throw new UnauthorizedException('Access denied or property not found.');

    const announcement = await this.prisma.announcement.create({
      data: { 
        property_id: property.id, 
        title: data.title, 
        message: data.message, 
        type: data.type 
      }
    });

    return {
      status: 'success',
      message: 'Announcement broadcasted successfully to all tenants in ' + property.name,
      announcement
    };
  }
}