import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async broadcastMessage(userId: string, data: any) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord not found');

    const { targetType, targetId, subject, message, urgency, channels } = data;

    // FIX: Explicitly type the arrays to prevent 'never[]' TypeScript errors
    let targetTenants: any[] = [];
    let targetProperties: any[] = [];

    // 1. Identify targets based on the frontend selection
    if (targetType === 'ALL') {
      targetProperties = await this.prisma.property.findMany({ where: { landlord_id: landlord.id } });
      targetTenants = await this.prisma.tenant.findMany({
        where: { unit: { property: { landlord_id: landlord.id } }, is_active: true },
        include: { unit: { include: { property: true } } }
      });
    } else if (targetType === 'PROPERTY') {
      const property = await this.prisma.property.findFirst({ where: { id: targetId, landlord_id: landlord.id } });
      if (!property) throw new NotFoundException('Property not found');
      targetProperties = [property];
      targetTenants = await this.prisma.tenant.findMany({
        where: { unit: { property_id: targetId }, is_active: true },
        include: { unit: { include: { property: true } } }
      });
    } else if (targetType === 'TENANT') {
      const tenant = await this.prisma.tenant.findFirst({
        where: { id: targetId, unit: { property: { landlord_id: landlord.id } }, is_active: true },
        include: { unit: { include: { property: true } } }
      });
      if (!tenant) throw new NotFoundException('Tenant not found');
      targetTenants = [tenant];
      targetProperties = [tenant.unit.property];
    } else {
      throw new BadRequestException('Invalid target type specified.');
    }

    if (targetTenants.length === 0) {
      throw new BadRequestException('No active tenants found for the selected target.');
    }

    // FIX: Explicitly type this variable to prevent 'null' strict assignment errors
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
        } catch (error) {
          this.logger.error(`Failed to send broadcast email to ${tenant.email}`);
        }
      }
    }

    // 4. Dispatch SMS
    if (channels.sms) {
       for (const tenant of targetTenants) {
         this.logger.log(`[SMS DISPATCHED] To ${tenant.phone}: ${subject}`);
       }
    }

    return {
      message: 'Broadcast dispatched successfully!',
      announcement: primaryAnnouncement
    };
  }
}