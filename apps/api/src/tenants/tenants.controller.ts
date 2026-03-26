// apps/api/src/tenants/tenants.controller.ts
/* eslint-disable */
import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/tenants') // <-- FIX 1: Clean, dedicated route prefix
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('LANDLORD', 'ADMIN')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // --- FIX 2: Unique Onboarding Route ---
  @Post('onboard/:unitId')
  async registerTenant(@Request() req: any, @Param('unitId') unitId: string, @Body() body: any) {
    return this.tenantsService.registerTenant(req.user.sub, unitId, body);
  }

  @Get()
  async getAllTenants(@Request() req: any) {
    return this.tenantsService.getAllTenants(req.user.sub);
  }

  @Put(':id')
  async updateTenant(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.tenantsService.updateTenant(req.user.sub, id, body);
  }

  @Delete(':id')
  async moveOut(@Request() req: any, @Param('id') id: string) {
    return this.tenantsService.moveOutTenant(req.user.sub, id);
  }
}