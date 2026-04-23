// apps/api/src/audit/audit.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logActivity(userId: string, action: string, description: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { landlord: true, staff: true }
      });
      
      if (!user) return;

      let landlordId = '';
      let role = '';

      if (user.landlord) {
        landlordId = user.landlord.id;
        role = 'OWNER';
      } else if (user.staff) {
        landlordId = user.staff.landlord_id;
        role = user.staff.role_type;
      } else {
        return; 
      }

      await this.prisma.workspaceActivity.create({
        data: {
          landlord_id: landlordId,
          actor_id: user.id,
          actor_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
          actor_role: role,
          action,
          description
        }
      });
    } catch (error) {
      console.error('Failed to log workspace activity:', error);
    }
  }

  async getWorkspaceLogs(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new UnauthorizedException('Strictly Confidential: Only the account owner can view audit logs.');

    return this.prisma.workspaceActivity.findMany({
      where: { landlord_id: landlord.id },
      orderBy: { created_at: 'desc' },
      take: 200 
    });
  }
}