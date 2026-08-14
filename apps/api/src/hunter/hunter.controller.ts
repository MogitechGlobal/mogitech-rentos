// apps/api/src/hunter/hunter.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { HunterService } from './hunter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/hunter')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HunterController {
  constructor(private readonly hunterService: HunterService) {}

  @Get('dashboard')
  @Roles('TENANT') 
  async getDashboard(@Request() req: any) {
    return this.hunterService.getDashboardData(req.user.sub, req.user.email);
  }

  @Patch('profile')
  @Roles('TENANT')
  async updateProfile(@Request() req: any, @Body() body: any) {
    return this.hunterService.updateProfile(req.user.sub, body);
  }

  // --- SAVED SEARCHES ---

  @Get('searches')
  @Roles('TENANT')
  async getSavedSearches(@Request() req: any) {
    return this.hunterService.getSavedSearches(req.user.email);
  }

  @Post('searches')
  @Roles('TENANT')
  async createSavedSearch(@Request() req: any, @Body() body: any) {
    return this.hunterService.createSavedSearch(req.user.email, body);
  }

  @Delete('searches/:id')
  @Roles('TENANT')
  async deleteSavedSearch(@Request() req: any, @Param('id') id: string) {
    return this.hunterService.deleteSavedSearch(req.user.email, id);
  }

  // --- SHORTLIST ---

  @Get('shortlist')
  @Roles('TENANT')
  async getShortlist(@Request() req: any) {
    return this.hunterService.getShortlist(req.user.email);
  }

  @Post('shortlist')
  @Roles('TENANT')
  async addToShortlist(@Request() req: any, @Body() body: { unit_id: string, notes?: string }) {
    return this.hunterService.addToShortlist(req.user.email, body.unit_id, body.notes);
  }

  @Delete('shortlist/:id')
  @Roles('TENANT')
  async removeFromShortlist(@Request() req: any, @Param('id') id: string) {
    return this.hunterService.removeFromShortlist(req.user.email, id);
  }
}