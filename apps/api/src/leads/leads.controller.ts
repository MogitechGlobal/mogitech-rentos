import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('LANDLORD', 'ADMIN', 'STAFF')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async getLeads(@Request() req: any) {
    return this.leadsService.getLandlordLeads(req.user.sub);
  }

  @Patch(':id/status')
  async updateStatus(@Request() req: any, @Param('id') leadId: string, @Body('status') status: string) {
    return this.leadsService.updateLeadStatus(req.user.sub, leadId, status);
  }
}