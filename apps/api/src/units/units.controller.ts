// apps/api/src/units/units.controller.ts
/* eslint-disable */
import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UnitsService } from './units.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// We use the global v1 prefix and map specific nested routes below
@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('LANDLORD', 'ADMIN')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  // --- UNIT CREATION & FETCHING ---
  @Post('properties/:propertyId/units')
  async createUnit(
    @Request() req: any,
    @Param('propertyId') propertyId: string,
    @Body() body: { unit_number: string; rent_amount: number }
  ) {
    return this.unitsService.createUnit(req.user.sub, propertyId, body);
  }

  @Get('properties/:propertyId/units')
  async getUnits(@Request() req: any, @Param('propertyId') propertyId: string) {
    return this.unitsService.getUnits(req.user.sub, propertyId);
  }

  // --- NEW: UNIT MANAGEMENT ---
  @Put('units/:id')
  async updateUnit(
    @Request() req: any, 
    @Param('id') unitId: string, 
    @Body() body: { unit_number: string; rent_amount: number }
  ) {
    return this.unitsService.updateUnit(req.user.sub, unitId, body);
  }

  @Delete('units/:id')
  async deleteUnit(@Request() req: any, @Param('id') unitId: string) {
    return this.unitsService.deleteUnit(req.user.sub, unitId);
  }

  // --- NEW: TENANT LEASE MANAGEMENT ---
  @Post('units/:id/tenants')
  async createTenant(
    @Request() req: any, 
    @Param('id') unitId: string, 
    @Body() body: any
  ) {
    return this.unitsService.createTenant(req.user.sub, unitId, body);
  }

  @Post('tenants/:id/move-out')
  async moveOutTenant(@Request() req: any, @Param('id') tenantId: string) {
    return this.unitsService.moveOutTenant(req.user.sub, tenantId);
  }

  @Post('units/:id/utilities')
  async recordMeterReading(
    @Request() req: any,
    @Param('id') unitId: string,
    @Body() body: { utilityType: string; reading: number; unitPrice: number }
  ) {
    return this.unitsService.recordMeterReading(req.user.sub, unitId, body);
  }
}