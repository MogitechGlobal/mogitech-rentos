// apps/api/src/landlords/landlords.service.ts
/* eslint-disable */
import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LandlordsService {
  constructor(private prisma: PrismaService) { }

  // --- NEW: RBAC DATA ISOLATION HELPER FOR SUPPORT TICKETS ---
  private async resolveAccess(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (landlord) return { landlordId: landlord.id, isStaff: false };

    const staff = await this.prisma.staff.findUnique({ where: { user_id: userId } });
    if (staff) return { landlordId: staff.landlord_id, isStaff: true };

    throw new UnauthorizedException('Access denied. No profile found.');
  }

  async createProfile(userId: string, companyName: string, contactPhone: string) {
    const existing = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (existing) {
      throw new ConflictException('Landlord profile already exists for this user.');
    }

    return this.prisma.landlord.create({
      data: {
        user_id: userId,
        company_name: companyName,
        contact_phone: contactPhone,
      },
    });
  }

  async getProfile(userId: string) {
    // 1. Try to load as a Landlord
    const landlordProfile = await this.prisma.landlord.findUnique({
      where: { user_id: userId },
      include: { user: { select: { first_name: true, last_name: true, email: true, avatar_url: true, tenant: { select: { id: true } } } } }
    });

    if (landlordProfile) return landlordProfile;

    // 2. MULTI-WORKSPACE FIX: Try to load as Staff
    const staffProfile = await this.prisma.staff.findUnique({
        where: { user_id: userId },
        include: { 
            landlord: true, // Get the employer's company details
            user: { select: { first_name: true, last_name: true, email: true, avatar_url: true, tenant: { select: { id: true } } } }
        }
    });

    if (staffProfile) {
        // Return the employer's company shell, but inject the staff's personal user data!
        return {
            ...staffProfile.landlord,
            user: staffProfile.user,
            staff: { role_type: staffProfile.role_type }
        };
    }

    throw new NotFoundException('Profile not found.');
  }

  async updateProfile(userId: string, dto: any) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) {
      throw new NotFoundException('Landlord profile not found.');
    }

    let newPasswordHash: string | undefined;
    if (dto.newPassword) {
      newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Update User Table
      if (dto.firstName || dto.lastName || newPasswordHash || dto.avatarBase64) {
        await tx.user.update({
          where: { id: userId },
          data: {
            ...(dto.firstName && { first_name: dto.firstName }),
            ...(dto.lastName && { last_name: dto.lastName }),
            ...(newPasswordHash && { password_hash: newPasswordHash }),
            ...(dto.avatarBase64 && { avatar_url: dto.avatarBase64 }),
          },
        });
      }

      // 2. Update Landlord Table (Company details & Gateway Config)
      await tx.landlord.update({
        where: { id: landlord.id },
        data: {
          // Standard Profile Info
          ...(dto.companyName !== undefined && { company_name: dto.companyName }),
          ...(dto.phone !== undefined && { contact_phone: dto.phone }),
          ...(dto.companyAddress !== undefined && { business_address: dto.companyAddress }), 
          ...(dto.currency !== undefined && { default_currency: dto.currency }), 
          ...(dto.companyLogoBase64 !== undefined && { company_logo: dto.companyLogoBase64 }),
          
          // --- FIXED: Gateway Configuration Mapping ---
          ...(dto.gatewayType !== undefined && { gateway_type: dto.gatewayType }),
          ...(dto.bankName !== undefined && { bank_name: dto.bankName }),
          ...(dto.bankAccountNumber !== undefined && { bank_account_number: dto.bankAccountNumber }),
          ...(dto.mpesaShortcode !== undefined && { mpesa_shortcode: dto.mpesaShortcode }),
          
          // --- FIX: Map API Credentials to the Database ---
          ...(dto.consumerKey !== undefined && { kcb_consumer_key: dto.consumerKey }),
          ...(dto.consumerSecret !== undefined && { kcb_consumer_secret: dto.consumerSecret }),
          ...(dto.passkey !== undefined && { mpesa_passkey: dto.passkey }),
        },
      });
    });

    // Return the fresh data so the frontend updates instantly
    return this.getProfile(userId);
  }

  // --- Fetch Active Banks from Platform Integrations ---
  async getActiveBanks() {
    try {
      const integrations = await this.prisma.platformIntegration.findMany({
        where: {
          is_active: true,
          provider: { not: 'MPESA' } // Everything else is considered a bank
        },
        select: { provider: true }
      });
      return integrations.map(int => int.provider);
    } catch (error) {
      // Fallback if the integration table doesn't exist yet
      return [];
    }
  }

  // --- NEW: SYSTEM ANNOUNCEMENTS ---
  async getSystemAnnouncements() {
      return this.prisma.globalAnnouncement.findMany({
          where: {
              target_audience: { in: ['ALL', 'LANDLORDS'] }
          },
          orderBy: { created_at: 'desc' }
      });
  }

  // --- REVISED: SUPPORT HELPDESK ---
  async getMySupportTickets(userId: string) {
      const access = await this.resolveAccess(userId);

      return this.prisma.supportTicket.findMany({
          where: { landlord_id: access.landlordId },
          orderBy: { created_at: 'desc' }
      });
  }

  async createSupportTicket(userId: string, data: { subject: string; message: string; priority: string }) {
      const access = await this.resolveAccess(userId);

      return this.prisma.supportTicket.create({
          data: {
              landlord_id: access.landlordId,
              subject: data.subject,
              message: data.message,
              priority: data.priority
          }
      });
  }

  // --- REVISED: RATE SUPPORT TICKET ---
  async rateSupportTicket(userId: string, ticketId: string, data: { rating: number; feedback?: string }) {
      const access = await this.resolveAccess(userId);

      const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
      
      if (!ticket || ticket.landlord_id !== access.landlordId) {
          throw new NotFoundException('Support ticket not found.');
      }

      if (ticket.status !== 'RESOLVED') {
          throw new BadRequestException('You can only rate tickets that have been resolved.');
      }

      if (ticket.rating) {
          throw new BadRequestException('This ticket has already been rated.');
      }

      return this.prisma.supportTicket.update({
          where: { id: ticketId },
          data: {
              rating: data.rating,
              feedback: data.feedback || null
          }
      });
  }
}