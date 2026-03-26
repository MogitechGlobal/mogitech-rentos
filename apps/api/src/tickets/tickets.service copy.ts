// apps/api/src/tickets/tickets.service.ts
/* eslint-disable */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service'; // <-- Import Mail Service

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async getTickets(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord profile not found');

    // Fetch from the exact same table the tenants submit to!
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
    // Find the active tenant to attach to the request
    const activeTenant = await this.prisma.tenant.findFirst({
      where: { unit_id: data.unit_id, is_active: true }
    });

    if (!activeTenant) {
      throw new BadRequestException('Cannot create a ticket for a vacant unit. Maintenance requests must be linked to an active tenant.');
    }

    return this.prisma.maintenanceRequest.create({
      data: {
        issue_type: data.issue_type,
        urgency: data.urgency,
        description: data.description,
        unit_id: data.unit_id,
        tenant_id: activeTenant.id,
        status: 'PENDING' // Start all new tickets as PENDING
      }
    });
  }

  async updateTicketStatus(ticketId: string, status: string) {
    // 1. Update the ticket and ask Prisma to "include" the connected tenant
    const updatedTicket = await this.prisma.maintenanceRequest.update({
      where: { id: ticketId },
      data: { status },
      include: { tenant: true } // We need this to get their email!
    });

    // 2. If the unit isn't vacant, fire off the email!
    if (updatedTicket.tenant && updatedTicket.tenant.email) {
      // Notice we do NOT use 'await' here. This is called "Fire and Forget".
      // It allows the frontend Kanban board to update instantly without waiting for the email server!
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