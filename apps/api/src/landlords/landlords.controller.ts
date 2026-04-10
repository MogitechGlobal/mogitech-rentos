// apps/api/src/landlords/landlords.controller.ts
/* eslint-disable */
import { Controller, Post, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { LandlordsService } from './landlords.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto'; 

@Controller('api/v1/landlords')
@UseGuards(JwtAuthGuard, RolesGuard) // Cleaned up: Only define this once
@Roles('LANDLORD', 'ADMIN')
export class LandlordsController {
  constructor(private readonly landlordsService: LandlordsService) {}

  @Post('profile')
  async createProfile(
    @Request() req: any, 
    @Body() body: { companyName: string; contactPhone: string }
  ) {
    return this.landlordsService.createProfile(req.user.sub, body.companyName, body.contactPhone);
  }

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.landlordsService.getProfile(req.user.sub);
  }
  // --- NEW: Endpoint for Landlords to see available banks ---
  @Get('active-banks')
  async getActiveBanks() {
    return this.landlordsService.getActiveBanks();
  }

  // --- Put endpoint for the Settings Page ---
  @Put('profile')
  async updateProfile(
    @Request() req: any,
    @Body() updateDto: any // <-- Change this to 'any'
  ) {
    return this.landlordsService.updateProfile(req.user.sub, updateDto);
  }

  // --- NEW: SYSTEM ANNOUNCEMENTS ---
    @Get('system-announcements')
    async getSystemAnnouncements() {
        return this.landlordsService.getSystemAnnouncements();
    }

  // --- NEW: SUPPORT HELPDESK ENDPOINTS ---
    @Get('support-tickets')
    async getMySupportTickets(@Request() req: any) {
        return this.landlordsService.getMySupportTickets(req.user.sub);
    }

    @Post('support-tickets')
    async createSupportTicket(
        @Request() req: any,
        @Body() body: { subject: string; message: string; priority: string }
    ) {
        return this.landlordsService.createSupportTicket(req.user.sub, body);
    }

    // --- NEW: RATE SUPPORT TICKET ENDPOINT ---
    @Post('support-tickets/:id/rate')
    async rateSupportTicket(
        @Request() req: any,
        @Param('id') ticketId: string,
        @Body() body: { rating: number; feedback?: string }
    ) {
        return this.landlordsService.rateSupportTicket(req.user.sub, ticketId, body);
    }
}