import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { HunterService } from './hunter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/hunter')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HunterController {
  constructor(private readonly hunterService: HunterService) {}

  @Get('dashboard')
  @Roles('TENANT') // House Hunters are registered with the TENANT role base
  async getDashboard(@Request() req: any) {
    // req.user is populated by the JwtAuthGuard
    return this.hunterService.getDashboardData(req.user.sub, req.user.email);
  }
}