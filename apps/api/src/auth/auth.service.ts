// apps/api/src/auth/auth.service.ts
/* eslint-disable */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service'; 
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto & { company_name?: string; contact_phone?: string }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const role = await this.prisma.role.findUnique({ where: { name: dto.roleName } });
    if (!role) throw new ConflictException('Invalid role specified');

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(dto.password, salt);

    // 1. Create the User Record
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash,
        role_id: role.id,
        first_name: dto.first_name, 
        last_name: dto.last_name,   
      },
      include: { role: true },
    });

    // 2. IMPORTANT FIX: Create the linked Landlord Profile!
    if (role.name === 'LANDLORD') {
      await this.prisma.landlord.create({
        data: {
          user_id: user.id,
          // Safely grab the company name and phone from the frontend form
          company_name: dto.company_name || `${dto.first_name}'s Portfolio`,
          contact_phone: dto.contact_phone || 'N/A',
        }
      });
    }

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is disabled');
    }

    // --- NEW: STRICT MAINTENANCE MODE CHECK ---
    const systemSettings = await this.prisma.systemSetting.findUnique({ 
      where: { id: 'global_settings' } 
    });

    // If maintenance is ON, block everyone EXCEPT the Super Admin
    if (systemSettings?.maintenance_mode && user.role.name !== 'ADMIN') {
        throw new UnauthorizedException(
            systemSettings.maintenance_message || 'The platform is currently undergoing scheduled maintenance. Please check back shortly.'
        );
    }

    return this.generateToken(user);
  }

  async changePassword(userId: string, newPassword: string) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash,
        requires_password_change: false, // Turn off the flag!
      }
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // SECURITY BEST PRACTICE: Silently return success to prevent email enumeration
    if (!user) {
      return { message: 'If that email exists in our system, a reset link has been sent.' };
    }

    // 1. Generate a secure, temporary token (expires in 15 minutes)
    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: 'password_reset' },
      { expiresIn: '15m' } 
    );

    // 2. Generate the dynamic frontend link (Make sure your frontend port is correct)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password/${resetToken}`;

    // 3. Fire off the email asynchronously (don't await it so the frontend UI responds instantly)
    this.mailService.sendPasswordResetEmail(email, resetLink);

    return { message: 'If that email exists in our system, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // 1. Verify the token is valid and hasn't expired
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'super-secret-development-key',
      });

      // 2. Ensure this token was actually meant for password resets
      if (payload.purpose !== 'password_reset') {
        throw new UnauthorizedException('Invalid token purpose');
      }

      // 3. Hash the new password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      // 4. Update the user in the database
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: {
          password_hash,
          requires_password_change: false, // Ensure they aren't forced to change it again
        },
      });

      return { message: 'Password has been successfully reset' };
      
    } catch (error) {
      // If the token is expired or tampered with, this catches it securely
      throw new UnauthorizedException('Invalid or expired reset token. Please request a new one.');
    }
  }

// Also, update your generateToken payload in the same file to include the flag:
  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role.name,
        requires_password_change: user.requires_password_change // <-- Add this
      },
    };
  }

  // --- NEW: PUBLIC SYSTEM SETTINGS ---
  async getPublicSystemSettings() {
    const settings = await this.prisma.systemSetting.findUnique({ where: { id: 'global_settings' } });
    return {
        maintenance_mode: settings?.maintenance_mode || false,
        support_email: settings?.support_email || 'support@mogitechglobal.com',
        support_phone: settings?.support_phone || '+254 700 000 000',
        terms_conditions: settings?.terms_conditions || ''
    };
  }
}