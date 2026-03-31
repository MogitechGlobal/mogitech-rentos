// apps/api/src/payments/payments.controller.ts
/* eslint-disable */
import { Controller, Post, Body, UseGuards, Request, HttpCode, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // --- PAYSTACK ROUTES ---
  @Post('paystack/initialize')
  @UseGuards(JwtAuthGuard)
  async initializeCheckout(@Request() req: any) {
    return this.paymentsService.initializePaystackCheckout(req.user.sub);
  }

  @Post('paystack/webhook')
  @HttpCode(200) 
  async paystackWebhook(@Body() body: any) {
    return this.paymentsService.handlePaystackWebhook(body);
  }

  // --- KCB M-PESA EXPRESS ROUTES ---
  @Post('kcb/stk-push')
  @UseGuards(JwtAuthGuard)
  async initializeMpesaPush(@Request() req: any, @Body() body: { phone: string }) {
    return this.paymentsService.initializeKcbMpesaPush(req.user.sub, body.phone);
  }

  // We pass the userId in the URL so we know exactly who paid when KCB calls back!
  @Post('kcb/webhook/:userId')
  @HttpCode(200)
  async kcbWebhook(@Param('userId') userId: string, @Body() body: any) {
    return this.paymentsService.handleKcbWebhook(userId, body);
  }
}