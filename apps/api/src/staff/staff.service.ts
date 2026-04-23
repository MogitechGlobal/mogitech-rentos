// apps/api/src/staff/staff.service.ts
import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service'; 
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class StaffService {
  constructor(
      private prisma: PrismaService,
      private mailService: MailService 
  ) {}

  // --- FIX: ALLOW STAFF TO SEE COWORKERS ---
  async getStaffMembers(userId: string) {
    let targetLandlordId: string;

    // 1. Check if user is the Landlord
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (landlord) {
        targetLandlordId = landlord.id;
    } else {
        // 2. Check if user is Staff, and get their employer's ID
        const staff = await this.prisma.staff.findUnique({ where: { user_id: userId } });
        if (!staff) throw new UnauthorizedException('Access denied.');
        targetLandlordId = staff.landlord_id;
    }

    return this.prisma.staff.findMany({
      where: { landlord_id: targetLandlordId },
      include: {
        user: { select: { first_name: true, last_name: true, email: true, is_active: true, avatar_url: true } },
        assignments: { include: { property: { select: { id: true, name: true } } } }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  // NOTE: The mutation methods below still safely enforce the landlord lookup,
  // providing a double-layer of security alongside the Controller's @Roles guard!

  async inviteStaff(userId: string, data: { email: string; firstName: string; lastName: string; roleType: string; propertyIds: string[] }) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new UnauthorizedException('Access denied. Only landlords can invite.');

    let user = await this.prisma.user.findUnique({ where: { email: data.email } });
    let tempPasswordStr: string | undefined = undefined;
    
    // 1. Check if user exists, if not, create them
    if (!user) {
      tempPasswordStr = crypto.randomBytes(4).toString('hex');
      const password_hash = await bcrypt.hash(tempPasswordStr, 10);
      
      const staffRole = await this.prisma.role.findUnique({ where: { name: 'MANAGER' } });

      user = await this.prisma.user.create({
        data: {
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          password_hash,
          role_id: staffRole?.id,
          requires_password_change: true
        }
      });
    }

    // 2. Check if they are already staff for this landlord
    const existingStaff = await this.prisma.staff.findUnique({ where: { user_id: user.id, landlord_id: landlord.id } });
    if (existingStaff) throw new ConflictException('This user is already on your team.');

    // 3. Create the Staff Profile and Assign Properties
    const newStaff = await this.prisma.$transaction(async (tx) => {
      const staffRecord = await tx.staff.create({
        data: {
          user_id: user.id, 
          landlord_id: landlord.id,
          role_type: data.roleType,
        }
      });

      if (data.propertyIds && data.propertyIds.length > 0) {
        const assignments = data.propertyIds.map(propId => ({
          staff_id: staffRecord.id,
          property_id: propId
        }));
        await tx.propertyStaff.createMany({ data: assignments });
      }

      return staffRecord;
    });

    // 4. Send the Email
    const roleFormatted = data.roleType.replace(/_/g, ' ');
    await this.mailService.sendStaffInviteEmail(
        data.email, 
        data.firstName, 
        landlord.company_name, 
        roleFormatted, 
        tempPasswordStr
    );

    return newStaff;
  }

  async updateStaff(userId: string, staffId: string, data: { roleType: string; propertyIds: string[], isActive: boolean }) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    
    const staff = await this.prisma.staff.findFirst({
      where: { id: staffId, landlord_id: landlord?.id }
    });
    if (!staff) throw new NotFoundException('Staff member not found.');

    return this.prisma.$transaction(async (tx) => {
      await tx.staff.update({
        where: { id: staffId },
        data: { role_type: data.roleType, is_active: data.isActive }
      });

      await tx.propertyStaff.deleteMany({ where: { staff_id: staffId } });
      
      if (data.propertyIds && data.propertyIds.length > 0) {
        const assignments = data.propertyIds.map(propId => ({
          staff_id: staffId,
          property_id: propId
        }));
        await tx.propertyStaff.createMany({ data: assignments });
      }

      return { success: true };
    });
  }

  async removeStaff(userId: string, staffId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    const staff = await this.prisma.staff.findFirst({ where: { id: staffId, landlord_id: landlord?.id } });
    if (!staff) throw new NotFoundException('Staff member not found.');

    return this.prisma.staff.delete({ where: { id: staffId } });
  }
}