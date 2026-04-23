// apps/api/src/staff/staff.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('LANDLORD', 'ADMIN') // Default roles for this controller. Specific methods can override this.
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // 🟢 READ-ONLY: Falls back to the Controller roles (Staff allowed to view coworkers)
  @Get()
  async getStaffMembers(@Request() req: any) {
    return this.staffService.getStaffMembers(req.user.sub);
  }

  // 🔴 STRICT LOCK: Overrides the controller. STAFF gets a 403 if they try to invite!
  @Post()
  @Roles('LANDLORD', 'ADMIN') 
  async inviteStaff(@Request() req: any, @Body() body: any) {
    return this.staffService.inviteStaff(req.user.sub, body);
  }

  // 🔴 STRICT LOCK: Overrides the controller. STAFF gets a 403 if they try to edit!
  @Put(':id')
  @Roles('LANDLORD', 'ADMIN') 
  async updateStaff(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.staffService.updateStaff(req.user.sub, id, body);
  }

  // 🔴 STRICT LOCK: Overrides the controller. STAFF gets a 403 if they try to delete!
  @Delete(':id')
  @Roles('LANDLORD', 'ADMIN') 
  async removeStaff(@Request() req: any, @Param('id') id: string) {
    return this.staffService.removeStaff(req.user.sub, id);
  }
}