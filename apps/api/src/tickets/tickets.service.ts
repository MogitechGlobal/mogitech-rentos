// apps/api/src/tickets/tickets.service.ts
/* eslint-disable */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service'; 

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async getTickets(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord profile not found');

    return this.prisma.maintenanceRequest.findMany({
      where: { unit: { property: { landlord_id: landlord.id } } },
      include: {
        unit: { include: { property: true } },
        tenant: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async createTicket(userId: string, data: { issue_type: string; urgency: string; description: string; unit_id: string }) {
    // Attempt to find the active tenant, but DO NOT throw an error if one isn't found
    const activeTenant = await this.prisma.tenant.findFirst({
      where: { unit_id: data.unit_id, is_active: true }
    });

    return this.prisma.maintenanceRequest.create({
      data: {
        issue_type: data.issue_type,
        urgency: data.urgency,
        description: data.description,
        unit_id: data.unit_id,
        // Use undefined instead of null to safely satisfy Prisma's strict TypeScript rules for optional relations
        tenant_id: activeTenant ? activeTenant.id : undefined, 
        status: 'PENDING' 
      }
    });
  }

  async updateTicketStatus(ticketId: string, status: string) {
    const updatedTicket = await this.prisma.maintenanceRequest.update({
      where: { id: ticketId },
      data: { status },
      include: { tenant: true } 
    });

    // Only fire the email if a tenant actually exists!
    if (updatedTicket.tenant && updatedTicket.tenant.email) {
      this.mailService.sendTicketStatusUpdate(
        updatedTicket.tenant.email,
        updatedTicket.tenant.first_name,
        updatedTicket.issue_type,
        updatedTicket.status
      ).catch(console.error); 
    }

    return updatedTicket;
  }
}