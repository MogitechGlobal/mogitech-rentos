// apps/api/src/invoices/invoices.controller.ts
/* eslint-disable */
import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; // <-- Import the new guard
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/invoices')
@UseGuards(JwtAuthGuard, RolesGuard) // <-- Add RolesGuard here!
@Roles('LANDLORD', 'ADMIN')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async getInvoices(@Request() req: any) {
    return this.invoicesService.getLandlordInvoices(req.user.sub);
  }

  // --- NEW ROUTE: The Magic Batch Button ---
  @Post('generate-batch')
  async generateBatch(@Request() req: any) {
    return this.invoicesService.generateInvoicesOnDemand(req.user.sub);
  }

  @Post('tenant/:tenantId')
  async createInvoice(
    @Param('tenantId') tenantId: string,
    @Body() body: { amount: number; description: string; due_date: string }
  ) {
    return this.invoicesService.createInvoice(tenantId, body);
  }

  @Post(':invoiceId/pay')
  async recordPayment(
    @Param('invoiceId') invoiceId: string,
    @Body() body: { amount_paid: number; payment_method: string; reference_number?: string }
  ) {
    return this.invoicesService.recordPayment(invoiceId, body);
  }
}