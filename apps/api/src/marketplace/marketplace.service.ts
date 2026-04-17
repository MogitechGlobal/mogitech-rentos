// apps/api/src/marketplace/marketplace.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

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
        
        images: true, // <-- FIX: Placed at the root of the Unit!
        
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
                // 'images' removed from here!
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
      where: { id: data.unit_id, is_listed: true, status: 'VACANT' }
    });

    if (!unit) {
      throw new Error('This unit is no longer available.');
    }

    // 2. Save the lead directly to the Landlord's CRM pipeline
    return this.prisma.listingLead.create({
      data: {
        unit_id: data.unit_id,
        landlord_id: data.landlord_id,
        prospect_name: data.prospect_name,
        prospect_email: data.prospect_email,
        prospect_phone: data.prospect_phone,
        message: data.message,
        status: 'NEW' // Starts as a fresh lead
      }
    });
  }
}