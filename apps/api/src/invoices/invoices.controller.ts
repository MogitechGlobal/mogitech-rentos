// apps/api/src/invoices/invoices.controller.ts
/* eslint-disable */
import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('LANDLORD', 'ADMIN', 'STAFF')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async getInvoices(@Request() req: any) {
    return this.invoicesService.getLandlordInvoices(req.user.sub);
  }

  @Post('generate-batch')
  async generateBatch(@Request() req: any) {
    return this.invoicesService.generateInvoicesOnDemand(req.user.sub);
  }

  // --- NEW: BULK REMINDER ENDPOINT ---
  @Post('remind-all')
  async sendBulkReminders(@Request() req: any, @Body() body: any) {
    const channels = body?.channels || ['PORTAL'];
    return this.invoicesService.sendBulkPaymentReminders(req.user.sub, channels);
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

  @Post(':id/remind')
  async sendReminder(
    @Request() req: any, 
    @Param('id') invoiceId: string,
    @Body() body: any 
  ) {
    const channels = body?.channels || ['PORTAL'];
    return this.invoicesService.sendPaymentReminder(req.user.sub, invoiceId, channels);
  }
}