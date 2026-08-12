import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HunterService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(userId: string, email: string) {
    // 1. Get the user profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, first_name: true, last_name: true, email: true }
    });

    // 2. Fetch all viewing requests (Leads) made by this email
    const inquiries = await this.prisma.listingLead.findMany({
      where: { prospect_email: email },
      include: {
        unit: {
          include: {
            property: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // 3. Find unique phone numbers the user has used for inquiries
    const userPhones = Array.from(new Set(inquiries.map(i => i.prospect_phone)));

    // 4. Fetch unlocked properties matching those phone numbers
    // FIX: Added the explicit : any[] type annotation here
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

      // Format to match what the frontend expects
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
      favorites: [] // Favorites are currently managed via localStorage on the frontend
    };
  }
}