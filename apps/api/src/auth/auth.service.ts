// apps/api/src/auth/auth.service.ts
/* eslint-disable */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service'; 
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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

    return this.generateToken(user);
  }

  // Add this new method inside AuthService
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
}