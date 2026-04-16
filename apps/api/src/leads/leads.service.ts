import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async getLandlordLeads(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new UnauthorizedException('Access denied.');

    return this.prisma.listingLead.findMany({
      where: { landlord_id: landlord.id },
      include: {
        unit: {
          include: { property: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async updateLeadStatus(userId: string, leadId: string, status: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    
    // Verify ownership before updating
    const lead = await this.prisma.listingLead.findFirst({
      where: { id: leadId, landlord_id: landlord?.id }
    });

    if (!lead) throw new UnauthorizedException('Lead not found or unauthorized.');

    return this.prisma.listingLead.update({
      where: { id: leadId },
      data: { status }
    });
  }
}