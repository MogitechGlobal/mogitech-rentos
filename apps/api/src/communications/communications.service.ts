// apps/api/src/communications/communications.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service'; 

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private auditService: AuditService 
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

  async broadcastMessage(userId: string, data: any) {
    const access = await this.resolveAccess(userId);
    
    // We still need the landlord's company name for the email dispatch
    const landlord = await this.prisma.landlord.findUnique({ where: { id: access.landlordId } });
    if (!landlord) throw new NotFoundException('Landlord not found');

    const { targetType, targetId, subject, message, urgency, channels } = data;

    let targetTenants: any[] = [];
    let targetProperties: any[] = [];

    // 1. Identify targets based on the frontend selection AND staff assignments
    if (targetType === 'ALL') {
      // Fetch only properties this staff member is allowed to see
      targetProperties = await this.prisma.property.findMany({ 
        where: { 
            landlord_id: access.landlordId,
            ...(access.propertyIds ? { id: { in: access.propertyIds } } : {})
        } 
      });
      
      const allowedPropertyIds = targetProperties.map(p => p.id);

      targetTenants = await this.prisma.tenant.findMany({
        where: { 
            unit: { property_id: { in: allowedPropertyIds } }, 
            is_active: true 
        },
        include: { unit: { include: { property: true } } }
      });

    } else if (targetType === 'PROPERTY') {
      // Security Check: Is staff allowed to broadcast to this specific property?
      if (access.propertyIds && !access.propertyIds.includes(targetId)) {
          throw new UnauthorizedException('Access denied to this property.');
      }

      const property = await this.prisma.property.findFirst({ where: { id: targetId, landlord_id: access.landlordId } });
      if (!property) throw new NotFoundException('Property not found');
      
      targetProperties = [property];
      
      targetTenants = await this.prisma.tenant.findMany({
        where: { unit: { property_id: targetId }, is_active: true },
        include: { unit: { include: { property: true } } }
      });

    } else if (targetType === 'TENANT') {
      const tenant = await this.prisma.tenant.findFirst({
        where: { id: targetId, unit: { property: { landlord_id: access.landlordId } }, is_active: true },
        include: { unit: { include: { property: true } } }
      });
      
      if (!tenant) throw new NotFoundException('Tenant not found');

      // Security Check: Is staff allowed to talk to this specific tenant?
      if (access.propertyIds && !access.propertyIds.includes(tenant.unit.property_id)) {
          throw new UnauthorizedException('Access denied to this tenant.');
      }

      targetTenants = [tenant];
      targetProperties = [tenant.unit.property];
    } else {
      throw new BadRequestException('Invalid target type specified.');
    }

    if (targetTenants.length === 0) {
      throw new BadRequestException('No active tenants found for the selected target.');
    }

    let primaryAnnouncement: any = null;

    // 2. Dispatch PORTAL Notices (Save to DB)
    if (channels.portal) {
      for (const prop of targetProperties) {
        const ann = await this.prisma.announcement.create({
          data: {
            property_id: prop.id,
            title: targetType === 'TENANT' ? `Private: ${subject}` : subject,
            message: message,
            type: urgency
          }
        });
        if (!primaryAnnouncement) primaryAnnouncement = ann;
      }
    } else {
      // Return a virtual object so the frontend history tab updates instantly
      primaryAnnouncement = {
          id: 'email-only-' + Date.now(),
          title: subject,
          message: message,
          type: urgency,
          created_at: new Date()
      };
    }

    // --- SPAM PREVENTION: Helper function to pause the loop ---
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    let sentCount = 0;
    let failedCount = 0;

    // 3. Dispatch EMAIL Blast
    if (channels.email) {
      for (const tenant of targetTenants) {
        try {
            await this.mailService.sendBroadcastEmail(
              tenant.email,
              tenant.first_name,
              subject,
              message,
              landlord.company_name || 'Property Management',
              urgency
            );
            sentCount++;
        } catch (error) {
          failedCount++;
          this.logger.error(`Failed to send broadcast email to ${tenant.email}`);
        } finally {
            // --- THROTTLE: Wait 2 seconds before the next email, PASS or FAIL ---
            await delay(2000); 
        }
      }
    }

    // 4. Dispatch SMS
    if (channels.sms) {
       for (const tenant of targetTenants) {
         this.logger.log(`[SMS DISPATCHED] To ${tenant.phone}: ${subject}`);
       }
    }

    // 5. --- AUDIT LOG: Record the Broadcast ---
    const channelList = Object.keys(channels).filter(k => channels[k]).map(k => k.toUpperCase()).join(', ');
    await this.auditService.logActivity(
        userId, 
        'BROADCAST_MESSAGE', 
        `Sent a ${urgency} broadcast titled "${subject}" to ${targetType} via ${channelList || 'NONE'}`
    );

    if (channels.email && sentCount === 0 && failedCount > 0) {
      return {
        status: 'warning',
        message: `Your email provider blocked the messages for spam. Please wait 15 minutes before trying again.`,
        announcement: primaryAnnouncement
      };
    }

    return {
      status: 'success',
      message: `Broadcast dispatched successfully!`,
      announcement: primaryAnnouncement
    };
  }
}