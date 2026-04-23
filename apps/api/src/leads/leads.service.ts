// apps/api/src/leads/leads.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  // --- NEW: RBAC DATA ISOLATION HELPER ---
  private async resolveAccess(userId: string) {
    // 1. Check if user is the Master Landlord
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (landlord) return { landlordId: landlord.id, propertyIds: null }; // Full access

    // 2. Check if user is a Staff Member (Caretaker/Finance/Vendor)
    const staff = await this.prisma.staff.findUnique({
        where: { user_id: userId },
        include: { assignments: true }
    });

    if (staff) {
        return {
            landlordId: staff.landlord_id,
            propertyIds: staff.assignments.map(a => a.property_id) // Restricted access
        };
    }

    throw new UnauthorizedException('Access denied. No landlord or staff profile found.');
  }

  async getLandlordLeads(userId: string) {
    const access = await this.resolveAccess(userId);

    return this.prisma.listingLead.findMany({
      where: { 
        landlord_id: access.landlordId,
        // If staff, filter leads to only show inquiries for their assigned buildings
        ...(access.propertyIds ? { unit: { property_id: { in: access.propertyIds } } } : {}) 
      },
      include: {
        unit: {
          include: { property: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async updateLeadStatus(userId: string, leadId: string, status: string) {
    const access = await this.resolveAccess(userId);
    
    // Verify ownership and access boundaries before allowing the update
    const lead = await this.prisma.listingLead.findFirst({
      where: { 
        id: leadId, 
        landlord_id: access.landlordId,
        // Ensure staff can't update a lead belonging to a building they don't manage
        ...(access.propertyIds ? { unit: { property_id: { in: access.propertyIds } } } : {})
      }
    });

    if (!lead) throw new UnauthorizedException('Lead not found or you are not authorized to edit it.');

    return this.prisma.listingLead.update({
      where: { id: leadId },
      data: { status }
    });
  }
}