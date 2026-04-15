import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/communications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('LANDLORD', 'ADMIN')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Post('broadcast')
  async broadcastMessage(@Request() req: any, @Body() body: any) {
    return this.communicationsService.broadcastMessage(req.user.sub, body);
  }
}