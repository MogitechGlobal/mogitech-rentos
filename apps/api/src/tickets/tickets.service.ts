// apps/api/src/tickets/tickets.service.ts
/* eslint-disable */
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service'; 
import { AuditService } from '../audit/audit.service'; // <-- 1. IMPORT AUDIT SERVICE

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private auditService: AuditService // <-- 2. INJECT AUDIT SERVICE
  ) {}

  // --- RBAC DATA ISOLATION HELPER ---
  private async resolveAccess(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (landlord) return { landlordId: landlord.id, propertyIds: null }; // Full access

    const staff = await this.prisma.staff.findUnique({
        where: { user_id: userId },
        include: { assignments: true }
    });

    if (staff) {
        return {
            landlordId: staff.landlord_id,
            propertyIds: staff.assignments.map(a => a.property_id) // Caretaker/Staff Restrictions
        };
    }

    throw new UnauthorizedException('Access denied. No landlord or staff profile found.');
  }

  async getTickets(userId: string) {
    const access = await this.resolveAccess(userId);

    return this.prisma.maintenanceRequest.findMany({
      where: {
        unit: {
          property: {
            landlord_id: access.landlordId,
            ...(access.propertyIds ? { id: { in: access.propertyIds } } : {}) // Filter to assigned properties!
          }
        }
      },
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

    const ticket = await this.prisma.maintenanceRequest.create({
      data: {
        issue_type: data.issue_type,
        urgency: data.urgency,
        description: data.description,
        unit_id: data.unit_id,
        // Use undefined instead of null to safely satisfy Prisma's strict TypeScript rules for optional relations
        tenant_id: activeTenant ? activeTenant.id : undefined, 
        status: 'PENDING' 
      },
      include: { unit: { include: { property: true } } } // Needed to get the property name for the audit log
    });

    // --- AUDIT LOG ---
    await this.auditService.logActivity(
        userId, 
        'CREATED_TICKET', 
        `Opened a ${data.urgency} priority ticket for ${data.issue_type} at ${ticket.unit.property.name}, Unit ${ticket.unit.unit_number}`
    );

    return ticket;
  }

  // NOTE: Added userId as the first parameter
  async updateTicketStatus(userId: string, ticketId: string, status: string) {
    const updatedTicket = await this.prisma.maintenanceRequest.update({
      where: { id: ticketId },
      data: { status },
      include: { tenant: true, unit: { include: { property: true } } } // Needed for audit log context
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

    // --- AUDIT LOG ---
    await this.auditService.logActivity(
        userId, 
        'UPDATED_TICKET', 
        `Changed maintenance ticket status to ${status.replace('_', ' ')} for ${updatedTicket.unit.property.name}, Unit ${updatedTicket.unit.unit_number}`
    );

    return updatedTicket;
  }
}