// apps/api/src/tickets/tickets.controller.ts
/* eslint-disable */
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; // <-- Import the new guard
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/tickets')
@UseGuards(JwtAuthGuard, RolesGuard) // <-- Add RolesGuard here!
@Roles('LANDLORD', 'ADMIN')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  getTickets(@Request() req: any) {
    return this.ticketsService.getTickets(req.user.sub);
  }

  @Post()
  createTicket(@Request() req: any, @Body() body: any) {
    return this.ticketsService.createTicket(req.user.sub, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ticketsService.updateTicketStatus(id, status);
  }
}