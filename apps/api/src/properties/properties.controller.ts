// apps/api/src/properties/properties.controller.ts
/* eslint-disable */
import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/properties')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('LANDLORD', 'ADMIN')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  async createProperty(
    @Request() req: any,
    @Body() body: { name: string; address: string; type?: string }
  ) {
    return this.propertiesService.createProperty(req.user.sub, body);
  }

  @Get()
  async getProperties(@Request() req: any) {
    return this.propertiesService.getProperties(req.user.sub);
  }

  // --- NEW: EDIT PROPERTY ---
  @Put(':id')
  async updateProperty(
    @Request() req: any,
    @Param('id') propertyId: string,
    @Body() body: { name: string; address: string; type?: string }
  ) {
    return this.propertiesService.updateProperty(req.user.sub, propertyId, body);
  }

  // --- NEW: DELETE PROPERTY ---
  @Delete(':id')
  async deleteProperty(
    @Request() req: any,
    @Param('id') propertyId: string
  ) {
    return this.propertiesService.deleteProperty(req.user.sub, propertyId);
  }

  @Post(':id/announcements')
  async postAnnouncement(
    @Request() req: any,
    @Param('id') propertyId: string,
    @Body() body: { title: string; message: string; type: string }
  ) {
    return this.propertiesService.postAnnouncement(req.user.sub, propertyId, body);
  }
}