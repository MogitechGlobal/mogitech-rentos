// apps/api/src/properties/properties.service.ts
/* eslint-disable */
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async createProperty(userId: string, data: { name: string; address: string; type?: string }) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { user_id: userId },
    });

    if (!landlord) throw new NotFoundException('Landlord profile not found.');

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
        } 
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

  // --- NEW: UPDATE PROPERTY ---
  async updateProperty(userId: string, propertyId: string, data: { name?: string; address?: string; type?: string }) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    
    // Verify ownership
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

  // --- NEW: DELETE PROPERTY ---
  async deleteProperty(userId: string, propertyId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    
    // Verify ownership and pull units to check dependencies
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, landlord_id: landlord?.id },
      include: { units: true }
    });

    if (!property) throw new UnauthorizedException('Access denied or property not found.');

    // Safety constraint: Prevent deletion if it has units
    if (property.units.length > 0) {
      throw new BadRequestException('Cannot delete a property that contains units. Please delete the units first.');
    }

    return this.prisma.property.delete({
      where: { id: propertyId }
    });
  }

  // --- PROPERTIES.SERVICE.TS ---

  async postAnnouncement(userId: string, propertyId: string, data: { title: string; message: string; type: string }) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, landlord_id: landlord?.id }
    });
    
    if (!property) throw new UnauthorizedException('Access denied or property not found.');

    // Save the broadcast directly to the database
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