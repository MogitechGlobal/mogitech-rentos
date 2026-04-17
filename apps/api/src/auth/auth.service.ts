// apps/api/src/auth/auth.service.ts
/* eslint-disable */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service'; 
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';
import * as nodemailer from 'nodemailer';

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
      const newLandlord = await this.prisma.landlord.create({
        data: {
          user_id: user.id,
          // Safely grab the company name and phone from the frontend form
          company_name: dto.company_name || `${dto.first_name}'s Portfolio`,
          contact_phone: dto.contact_phone || 'N/A',
        }
      });

      // Send the Welcome Email automatically with the T&C links attached
      await this.sendWelcomeEmail(user.email, user.first_name || 'Landlord', newLandlord.company_name);
    }

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    // --- FIX: Check if password_hash exists before comparing ---
    if (!user || !user.password_hash || !(await bcrypt.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials or account is linked to Google.');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is disabled');
    }

    // --- NEW: STRICT MAINTENANCE MODE CHECK ---
    const systemSettings = await this.prisma.systemSetting.findUnique({ 
      where: { id: 'global_settings' } 
    });

    // --- FIX: Use optional chaining for the role ---
    // If maintenance is ON, block everyone EXCEPT the Super Admin
    if (systemSettings?.maintenance_mode && user.role?.name !== 'ADMIN') {
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
    const payload = { sub: user.id, email: user.email, role: user.role?.name || 'USER' };
    return {
      access_token: this.jwtService.sign(payload),
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role?.name || 'USER',
        requires_password_change: user.requires_password_change // <-- Add this
      },
    };
  }

  private async sendWelcomeEmail(email: string, firstName: string, companyName: string) {
    const loginUrl = process.env.NEXT_PUBLIC_FRONTEND_URL 
        ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/login` 
        : 'https://rentos.mogitechglobal.com/login';
        
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'mogitechglobal.com',
            port: Number(process.env.SMTP_PORT) || 465,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: { rejectUnauthorized: false }
        });

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #1f8898; margin: 0;">MogiRentOS</h1>
                </div>
                <h2 style="color: #111827;">Welcome aboard, ${firstName}!</h2>
                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for registering <strong>${companyName}</strong> on MogiRentOS. Your account has been successfully created and you are currently on the <strong>Starter (Free Trial)</strong> plan.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginUrl}" style="background-color: #1f8898; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Access Your Dashboard</a>
                </div>
                <p style="color: #4b5563; line-height: 1.6;">
                    <strong>Next Steps to get started:</strong>
                    <ul style="color: #4b5563;">
                        <li>Add your first Property and Units.</li>
                        <li>Onboard your active Tenants.</li>
                        <li>Configure your M-Pesa Paybill / Till Number in Settings.</li>
                    </ul>
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                
                <div style="color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
                    <p style="margin-bottom: 10px;">
                        This is an automated message sent by the MogiRentOS platform. Please do not reply directly to this email. For support or inquiries, please contact us via the Helpdesk in your dashboard.
                    </p>
                    <p style="margin-bottom: 10px;">
                        <strong>Security Tip:</strong> MogiRentOS staff will <em>never</em> ask you for your password via email or phone.
                    </p>
                    <p style="margin: 0;">
                        By logging in and using MogiRentOS, you agree to our 
                        <a href="https://rentos.mogitechglobal.com/terms" target="_blank" style="color: #1f8898; text-decoration: underline;">Terms of Service</a> and 
                        <a href="https://rentos.mogitechglobal.com/privacy" target="_blank" style="color: #1f8898; text-decoration: underline;">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"MogiRentOS Team" <rentos@mogitechglobal.com>',
            to: email,
            subject: 'Welcome to MogiRentOS! Your account is ready.',
            html,
        });
        
    } catch (error) {
        console.error(`Failed to send welcome email to ${email}.`, error);
    }
  }

  // --- NEW: PUBLIC SYSTEM SETTINGS ---
  async getPublicSystemSettings() {
    const settings = await this.prisma.systemSetting.findUnique({ where: { id: 'global_settings' } });
    return {
        maintenance_mode: settings?.maintenance_mode || false,
        support_email: settings?.support_email || 'support@mogitechglobal.com',
        support_phone: settings?.support_phone || '+254 768 569 357',
        terms_conditions: settings?.terms_conditions || ''
    };
  }
}