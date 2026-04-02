// apps/api/src/landlords/landlords.service.ts
/* eslint-disable */
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LandlordsService {
  constructor(private prisma: PrismaService) { }

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
    const profile = await this.prisma.landlord.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: { first_name: true, last_name: true, email: true, avatar_url: true }
        }
      }
    });

    if (!profile) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User profile not found.');

      return {
        user,
        company_name: 'My Portfolio',
        subscription_plan: 'FREE' 
      };
    }

    return {
      ...profile,
      // Translate the DB's status into the Plan Tier the frontend expects
      subscription_plan: profile.subscription_status === 'PREMIUM' ? 'PREMIUM' : 'FREE'
    };
  }

  // Changed dto type to 'any' to ensure new gateway fields aren't blocked by strict DTOs
  async updateProfile(userId: string, dto: any) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });

    if (!landlord) {
      throw new NotFoundException('Landlord profile not found. Cannot update.');
    }

    // --- HANDLE PASSWORD CHANGE ---
    let newPasswordHash: string | undefined = undefined;
    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('You must provide your current password to set a new one.');
      }

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.password_hash) {
        throw new BadRequestException('Invalid user account.');
      }

      const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password_hash);
      if (!isPasswordValid) {
        throw new BadRequestException('The current password provided is incorrect.');
      }

      newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    }

    // Use a Prisma Transaction to safely update both tables simultaneously
    await this.prisma.$transaction(async (tx) => {

      // 1. Update the User table (Names, Global Settings, Passwords, Avatar)
      if (
        dto.firstName ||
        dto.lastName ||
        dto.notifications !== undefined ||
        dto.twoFactorAuth !== undefined ||
        newPasswordHash ||
        dto.avatarBase64
      ) {
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

      // 2. Update the Landlord table (Company details & Gateway Config)
      await tx.landlord.update({
        where: { id: landlord.id },
        data: {
          // Standard Profile Info
          ...(dto.companyName && { company_name: dto.companyName }),
          ...(dto.phone && { contact_phone: dto.phone }),
          ...(dto.companyAddress && { business_address: dto.companyAddress }), 
          ...(dto.currency && { default_currency: dto.currency }), 
          ...(dto.companyLogoBase64 && { company_logo: dto.companyLogoBase64 }),
          
          // --- NEW: DIRECT SETTLEMENT GATEWAY CONFIGURATION ---
          ...(dto.gatewayType !== undefined && { gateway_type: dto.gatewayType }),
          ...(dto.bankName !== undefined && { bank_name: dto.bankName }),
          ...(dto.mpesaShortcode !== undefined && { mpesa_shortcode: dto.mpesaShortcode }),
          ...(dto.kcbConsumerKey !== undefined && { kcb_consumer_key: dto.kcbConsumerKey }),
          ...(dto.kcbConsumerSecret !== undefined && { kcb_consumer_secret: dto.kcbConsumerSecret }),
          ...(dto.mpesaPasskey !== undefined && { mpesa_passkey: dto.mpesaPasskey }),
        },
      });
    });

    // Return the fresh data so the frontend updates instantly
    return this.getProfile(userId);
  }
}