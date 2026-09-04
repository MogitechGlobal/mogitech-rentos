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

    // 2. Aggregate and strictly NORMALIZE all possible phone numbers
    // This solves the M-Pesa (254...) vs Profile (07...) format mismatch bug
    const phoneSet = new Set<string>();
    if (user?.phone) phoneSet.add(user.phone);
    inquiries.forEach(i => {
      if (i.prospect_phone) phoneSet.add(i.prospect_phone);
    });
    
    const normalizedPhones = new Set<string>();
    phoneSet.forEach(phone => {
      const digits = phone.replace(/\D/g, ''); // Strip any spaces or symbols
      
      if (digits.startsWith('0')) {
        normalizedPhones.add(digits);
        normalizedPhones.add('254' + digits.substring(1)); // Convert 07.. to 2547..
      } else if (digits.startsWith('254')) {
        normalizedPhones.add(digits);
        normalizedPhones.add('0' + digits.substring(3)); // Convert 2547.. to 07..
      } else if (digits.length === 9) { 
        normalizedPhones.add('0' + digits);
        normalizedPhones.add('254' + digits);
      } else {
        normalizedPhones.add(digits);
      }
    });
    
    const userPhones = Array.from(normalizedPhones);

    // 3. ROBUST FETCH: Match by user_id OR any normalized phone variations
    // This securely pulls in all historical or cross-formatted unlocks
    const unlocks = await this.prisma.marketplaceUnlock.findMany({
      where: {
        status: 'SUCCESS',
        OR: [
          { user_id: userId },
          ...(userPhones.length > 0 ? [{ phone_number: { in: userPhones } }] : [])
        ]
      },
      include: {
        unit: {
          include: {
            images: true, 
            property: {
              include: { landlord: true }
            }
          }
        }
      },
      orderBy: { updated_at: 'desc' }
    });

    // 4. Safely map data, ignoring any malformed records where unit/property was deleted
    const unlocked_properties = unlocks
      .filter(u => u.unit && u.unit.property) 
      .map(u => ({
        id: u.id,
        created_at: u.created_at,
        unit: u.unit,
        property: u.unit.property
      }));

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

    return this.prisma.hunterShortlist.upsert({
      where: {
        hunter_email_unit_id: {
          hunter_email: email,
          unit_id: unitId
        }
      },
      update: {
        notes: notes 
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