// apps/api/src/hunter/hunter.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HunterService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(userId: string, email: string) {
    // 1. Fetch user including the phone field
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, first_name: true, last_name: true, email: true, phone: true }
    });

    const inquiries = await this.prisma.listingLead.findMany({
      where: { prospect_email: email },
      include: {
        unit: {
          include: { property: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const userPhones = Array.from(new Set(inquiries.map(i => i.prospect_phone)));

    let unlocked_properties: any[] = [];
    
    if (userPhones.length > 0) {
      const unlocks = await this.prisma.marketplaceUnlock.findMany({
        where: {
          phone_number: { in: userPhones },
          status: 'SUCCESS'
        },
        include: {
          unit: {
            include: {
              property: {
                include: { landlord: true }
              }
            }
          }
        },
        orderBy: { updated_at: 'desc' }
      });

      unlocked_properties = unlocks.map(u => ({
        id: u.id,
        unit: u.unit,
        property: u.unit.property
      }));
    }

    return {
      user,
      inquiries,
      unlocked_properties,
      favorites: [] 
    };
  }

  async updateProfile(userId: string, data: { first_name?: string, last_name?: string, phone?: string }) {
    if (!data.first_name || !data.last_name) {
      throw new BadRequestException('First Name and Last Name are required.');
    }

    // 2. Save the phone number to the database
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone, 
      }
    });

    return { message: 'Profile updated successfully', user };
  }

  // --- SAVED SEARCHES ---

  async getSavedSearches(email: string) {
    return this.prisma.hunterSavedSearch.findMany({
      where: { hunter_email: email },
      orderBy: { created_at: 'desc' }
    });
  }

  async createSavedSearch(email: string, data: any) {
    if (!data.name) throw new BadRequestException('Search name is required.');

    return this.prisma.hunterSavedSearch.create({
      data: {
        hunter_email: email,
        name: data.name,
        location: data.location,
        min_price: data.min_price,
        max_price: data.max_price,
        property_type: data.property_type,
        bedrooms: data.bedrooms,
        amenities: data.amenities || [],
        alert_frequency: data.alert_frequency || 'INSTANT',
      }
    });
  }

  async deleteSavedSearch(email: string, searchId: string) {
    // DeleteMany ensures a user can only delete their own searches
    const result = await this.prisma.hunterSavedSearch.deleteMany({
      where: {
        id: searchId,
        hunter_email: email
      }
    });
    
    if (result.count === 0) throw new BadRequestException('Saved search not found or unauthorized.');
    return { message: 'Saved search removed.' };
  }

  // --- SHORTLIST ---

  async getShortlist(email: string) {
    return this.prisma.hunterShortlist.findMany({
      where: { hunter_email: email },
      include: {
        unit: {
          include: {
            property: true,
            images: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async addToShortlist(email: string, unitId: string, notes?: string) {
    if (!unitId) throw new BadRequestException('Unit ID is required.');

    // Using upsert prevents duplicate entries crashing the database 
    // due to the @@unique([hunter_email, unit_id]) constraint
    return this.prisma.hunterShortlist.upsert({
      where: {
        hunter_email_unit_id: {
          hunter_email: email,
          unit_id: unitId
        }
      },
      update: {
        notes: notes // Update notes if modifying an existing shortlist entry
      },
      create: {
        hunter_email: email,
        unit_id: unitId,
        notes: notes
      }
    });
  }

  async removeFromShortlist(email: string, shortlistId: string) {
    const result = await this.prisma.hunterShortlist.deleteMany({
      where: {
        id: shortlistId,
        hunter_email: email
      }
    });

    if (result.count === 0) throw new BadRequestException('Shortlist item not found or unauthorized.');
    return { message: 'Property removed from shortlist.' };
  }
}