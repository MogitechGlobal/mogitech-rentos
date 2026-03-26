// apps/api/src/payments/payments.controller.ts
/* eslint-disable */
import { Controller, Post, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Triggered by the frontend button
  @Post('paystack/initialize')
  @UseGuards(JwtAuthGuard)
  async initializeCheckout(@Request() req: any) {
    return this.paymentsService.initializePaystackCheckout(req.user.sub);
  }

  // Triggered silently by Paystack servers
  @Post('paystack/webhook')
  @HttpCode(200) // Paystack requires a 200 OK immediately
  async paystackWebhook(@Body() body: any) {
    return this.paymentsService.handlePaystackWebhook(body);
  }
}