// apps/api/src/landlords/landlords.controller.ts
/* eslint-disable */
import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
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

  // --- Put endpoint for the Settings Page ---
  @Put('profile')
  async updateProfile(
    @Request() req: any,
    @Body() updateDto: UpdateProfileDto
  ) {
    return this.landlordsService.updateProfile(req.user.sub, updateDto);
  }
}