// apps/api/src/mpesa/mpesa.controller.ts
/* eslint-disable */
import { Controller, Post, Get, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/mpesa')
export class MpesaController {
  constructor(private readonly mpesaService: MpesaService) {}

  // Triggered by the Tenant in the Tenant Portal
  @Post('stk-push')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TENANT')
  async initiatePayment(
    @Request() req: any,
    @Body() body: { amount: number; phone: string }
  ) {
    // req.user.sub is the User ID. The service would look up the Tenant ID.
    return this.mpesaService.initiateStkPush(req.user.sub, body.amount, body.phone);
  }

  // PUBLIC ROUTE: Called by Safaricom Daraja API Servers
  @Post('webhook')
  @HttpCode(200) // Safaricom requires a fast 200 OK response
  async mpesaWebhook(@Body() body: any) {
    return this.mpesaService.handleCallback(body);
  }

  // --- NEW: SECURE LOGS ENDPOINT FOR DASHBOARD ---
  @Get('logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LANDLORD', 'ADMIN', 'STAFF')
  async getMpesaLogs(@Request() req: any) {
    return this.mpesaService.getLandlordMpesaLogs(req.user.sub);
  }
}