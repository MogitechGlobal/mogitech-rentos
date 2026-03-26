// apps/api/src/landlords/landlords.service.ts
/* eslint-disable */
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
          select: {
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true, // <-- FIX #1: Tell Prisma to return the avatar string!
          }
        }
      }
    });

    if (!profile) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User profile not found.');

      return {
        user,
        company_name: 'My Portfolio',
        subscription_status: 'FREE'
      };
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
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

      // Fetch the user to get their current password hash
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.password_hash) {
        throw new BadRequestException('Invalid user account.');
      }

      // Verify the current password matches what is in the DB
      const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password_hash);
      if (!isPasswordValid) {
        throw new BadRequestException('The current password provided is incorrect.');
      }

      // Hash the new password securely
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

      // 2. Update the Landlord table (Company details)
      if (dto.companyName || dto.phone || dto.companyAddress || dto.currency) {
        await tx.landlord.update({
          where: { id: landlord.id },
          data: {
            ...(dto.companyName && { company_name: dto.companyName }),
            ...(dto.phone && { contact_phone: dto.phone }),
            ...(dto.companyAddress && { business_address: dto.companyAddress }), // <-- FIX #2: Uncommented!
            ...(dto.currency && { default_currency: dto.currency }),             // <-- FIX #3: Uncommented!
          },
        });
      }
    });

    // Return the fresh data so the frontend updates instantly
    return this.getProfile(userId);
  }
}