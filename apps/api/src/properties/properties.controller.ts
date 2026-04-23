// apps/api/src/properties/properties.controller.ts
/* eslint-disable */
import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/properties')
@UseGuards(JwtAuthGuard, RolesGuard)
// UPDATE: Added STAFF and MANAGER roles to access this endpoint
@Roles('LANDLORD', 'ADMIN', 'MANAGER', 'STAFF') 
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @Roles('LANDLORD', 'ADMIN') // Only owners can CREATE properties
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

  @Put(':id')
  @Roles('LANDLORD', 'ADMIN') // Only owners can EDIT properties
  async updateProperty(
    @Request() req: any,
    @Param('id') propertyId: string,
    @Body() body: { name: string; address: string; type?: string }
  ) {
    return this.propertiesService.updateProperty(req.user.sub, propertyId, body);
  }

  @Delete(':id')
  @Roles('LANDLORD', 'ADMIN') // Only owners can DELETE properties
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