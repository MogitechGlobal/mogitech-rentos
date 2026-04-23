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

  @Post('remind-all')
  async sendBulkReminders(@Request() req: any, @Body() body: any) {
    const channels = body?.channels || ['PORTAL'];
    return this.invoicesService.sendBulkPaymentReminders(req.user.sub, channels);
  }

  @Post('tenant/:tenantId')
  async createInvoice(
    @Request() req: any, // <-- ADDED: Capture the request to get the user ID
    @Param('tenantId') tenantId: string,
    @Body() body: { amount: number; description: string; due_date: string }
  ) {
    // FIX: Pass req.user.sub as the first argument
    return this.invoicesService.createInvoice(req.user.sub, tenantId, body);
  }

  @Post(':invoiceId/pay')
  async recordPayment(
    @Request() req: any, // <-- ADDED: Capture the request to get the user ID
    @Param('invoiceId') invoiceId: string,
    @Body() body: { amount_paid: number; payment_method: string; reference_number?: string }
  ) {
    // FIX: Pass req.user.sub as the first argument
    return this.invoicesService.recordPayment(req.user.sub, invoiceId, body);
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