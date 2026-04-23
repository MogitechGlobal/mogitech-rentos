import { Controller, Get, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('profile')
  async getGlobalProfile(@Request() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        is_active: true,
        created_at: true,
        role: { select: { name: true } },
        // --- MULTI-WORKSPACE FIX: Expose all profiles to the frontend ---
        landlord: { select: { id: true, company_name: true } },
        tenant: { select: { id: true } },
        staff: { select: { id: true, role_type: true } }
      }
    });

    if (!user) throw new NotFoundException('User profile not found');
    
    return user;
  }
}