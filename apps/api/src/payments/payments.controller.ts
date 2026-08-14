// apps/api/src/payments/payments.controller.ts
/* eslint-disable */
import { Controller, Post, Body, UseGuards, Request, HttpCode, Param, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // --- PAYSTACK ROUTES ---
  @Post('paystack/initialize')
  @UseGuards(JwtAuthGuard)
  async initializeCheckout(@Request() req: any, @Body() body: { plan: string, cycle: string }) {
    return this.paymentsService.initializePaystackCheckout(req.user.sub, body.plan, body.cycle);
  }

  @Post('paystack/webhook')
  @HttpCode(200) 
  async paystackWebhook(@Body() body: any) {
    return this.paymentsService.handlePaystackWebhook(body);
  }

  // --- KCB M-PESA EXPRESS ROUTES (SAAS PLATFORM) ---
  @Post('kcb/stk-push')
  @UseGuards(JwtAuthGuard)
  async initializeMpesaPush(@Request() req: any, @Body() body: { phone: string, plan: string, cycle: string }) {
    return this.paymentsService.initializeKcbMpesaPush(req.user.sub, body.phone, body.plan, body.cycle);
  }

  @Post('kcb/webhook/:userId')
  @HttpCode(200)
  async kcbWebhook(@Param('userId') userId: string, @Body() body: any) {
    return this.paymentsService.handleKcbWebhook(userId, body);
  }

  // --- NEW: HOUSE HUNTER UNLOCK ROUTES ---
  @Post('hunter/stk-push')
  @UseGuards(JwtAuthGuard)
  async initializeHunterPush(@Request() req: any, @Body() body: { unit_id: string, phone: string }) {
    // req.user.sub is the Hunter's user ID
    return this.paymentsService.initializeHunterUnlockPush(req.user.sub, body.unit_id, body.phone);
  }

  @Post('kcb/hunter-webhook/:unlockId')
  @HttpCode(200)
  async kcbHunterWebhook(@Param('unlockId') unlockId: string, @Body() body: any) {
    return this.paymentsService.handleHunterUnlockWebhook(unlockId, body);
  }

  // --- RECONCILE LEDGER ---
  @Post('reconcile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LANDLORD', 'ADMIN')
  async reconcileLedger(@Request() req: any) {
    return this.paymentsService.reconcileLedger(req.user.sub);
  }

  @Post('kcb/rent-webhook/:invoiceId')
  @HttpCode(200)
  async kcbRentWebhook(@Param('invoiceId') invoiceId: string, @Body() body: any) {
    return this.paymentsService.handleTenantRentWebhook(invoiceId, body);
  }

  // --- BULK RECEIPTS EXPORT ---
  @Post('bulk-receipts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LANDLORD', 'ADMIN')
  async downloadBulkReceipts(
    @Request() req: any, 
    @Body() body: { paymentIds: string[] }, 
    @Res() res: any
  ) {
    const zipStream = await this.paymentsService.generateBulkReceiptsZip(req.user.sub, body.paymentIds);
    
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=Bulk_Receipts_${Date.now()}.zip`,
    });
    
    zipStream.pipe(res);
  }

  // --- KCB INSTANT PAYMENT NOTIFICATIONS (IPN) ---
  @Post('kcb/ipn/till')
  @HttpCode(200)
  async kcbTillNotification(@Body() body: any) {
    return this.paymentsService.handleTillNotification(body);
  }

  @Post('kcb/ipn/account')
  @HttpCode(200)
  async kcbAccountNotification(@Body() body: any) {
    return this.paymentsService.handleAccountNotification(body);
  }
}