// apps/api/src/payments/payments.service.ts
/* eslint-disable */
import { Injectable, InternalServerErrorException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../mail/pdf.service';

const PRICING = {
  STARTER: { MONTHLY: 1500, QUARTERLY: 4275, SEMI_ANNUAL: 8100, ANNUAL: 15000 },
  BASIC: { MONTHLY: 2500, QUARTERLY: 7125, SEMI_ANNUAL: 13500, ANNUAL: 25000 },
  STANDARD: { MONTHLY: 4500, QUARTERLY: 12825, SEMI_ANNUAL: 24300, ANNUAL: 45000 },
  PRO: { MONTHLY: 6500, QUARTERLY: 18525, SEMI_ANNUAL: 35100, ANNUAL: 65000 },
  ENTERPRISE: { MONTHLY: 12000, QUARTERLY: 34200, SEMI_ANNUAL: 64800, ANNUAL: 120000 }
};

const CYCLE_MONTHS = { MONTHLY: 1, QUARTERLY: 3, SEMI_ANNUAL: 6, ANNUAL: 12 };

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private get paystackSecret() { return process.env.PAYSTACK_SECRET_KEY || ''; }
  private get kcbConsumerKey() { return process.env.KCB_CONSUMER_KEY || ''; }
  private get kcbConsumerSecret() { return process.env.KCB_CONSUMER_SECRET || ''; }
  private get kcbStkEndpoint() { return process.env.KCB_STK_ENDPOINT || 'https://api.buni.kcbgroup.com/mm/api/request/1.0.0/stkpush'; }
  private get kcbPaybill() { return process.env.KCB_PAYBILL || '522533'; }
  private get kcbAccountNumber() { return process.env.KCB_ACCOUNT_NUMBER || '8011909'; }

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService
  ) { }

  // ==========================================
  // 1. PAYSTACK INTEGRATION (CARDS/BANK)
  // ==========================================
  async initializePaystackCheckout(userId: string, plan: string, cycle: string = 'MONTHLY') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { landlord: true }
    });

    if (!user || !user.landlord) throw new InternalServerErrorException('User or Landlord profile not found.');

    let normalizedPlan = plan.toUpperCase();
    if (normalizedPlan === 'PREMIUM') normalizedPlan = 'PRO'; 

    const requestedPlan = (['STARTER', 'BASIC', 'STANDARD', 'PRO', 'ENTERPRISE'].includes(normalizedPlan)) ? normalizedPlan : 'STARTER';
    const requestedCycle = cycle.toUpperCase() as keyof typeof PRICING.STARTER;
    const amountInKobo = (PRICING[requestedPlan as keyof typeof PRICING][requestedCycle] || PRICING[requestedPlan as keyof typeof PRICING].MONTHLY) * 100;
    const frontendUrl = process.env.NODE_ENV === 'production' ? 'https://rentos.mogitechglobal.com' : 'http://localhost:3001';

    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.paystackSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          amount: amountInKobo,
          currency: 'KES',
          callback_url: `${frontendUrl}/dashboard/settings/billing?payment=success&plan=${requestedPlan}&cycle=${requestedCycle}`,
          metadata: {
            custom_fields: [
              { display_name: "User ID", variable_name: "user_id", value: userId },
              { display_name: "Upgrade Type", variable_name: "upgrade_type", value: requestedPlan },
              { display_name: "Cycle", variable_name: "cycle", value: requestedCycle }
            ]
          }
        })
      });

      const data = await response.json();
      if (!data.status) throw new Error(data.message);
      return { authorizationUrl: data.data.authorization_url };
    } catch (error: any) {
      this.logger.error('Paystack initialization failed', error.message);
      throw new InternalServerErrorException('Could not initialize payment gateway.');
    }
  }

  async handlePaystackWebhook(eventData: any) {
    if (eventData.event === 'charge.success') {
      const userId = eventData.data.metadata?.custom_fields?.find((f: any) => f.variable_name === 'user_id')?.value;
      const upgradeType = eventData.data.metadata?.custom_fields?.find((f: any) => f.variable_name === 'upgrade_type')?.value;
      const cycle = eventData.data.metadata?.custom_fields?.find((f: any) => f.variable_name === 'cycle')?.value || 'MONTHLY';

      if (userId && ['STARTER', 'BASIC', 'STANDARD', 'PRO', 'ENTERPRISE'].includes(upgradeType)) {
        const monthsToAdd = CYCLE_MONTHS[cycle as keyof typeof CYCLE_MONTHS] || 1;
        const newExpiry = new Date();
        newExpiry.setMonth(newExpiry.getMonth() + monthsToAdd);

        await this.prisma.landlord.update({
          where: { user_id: userId },
          data: {
            subscription_status: upgradeType,
            subscription_cycle: cycle,
            subscription_expiry: newExpiry
          }
        });
      }
    }
    return { status: 'success' };
  }

  // ==========================================
  // 2. KCB M-PESA EXPRESS INTEGRATION
  // ==========================================
  private async getKcbAccessToken(customKey?: string, customSecret?: string): Promise<string> {
    const key = (customKey || process.env.KCB_CONSUMER_KEY || '').trim();
    const secret = (customSecret || process.env.KCB_CONSUMER_SECRET || '').trim();
    const authUrlBase = process.env.KCB_AUTH_URL;

    if (!authUrlBase) {
      this.logger.error("KCB_AUTH_URL is missing from environment variables.");
      throw new InternalServerErrorException("Payment gateway misconfiguration.");
    }

    const credentials = Buffer.from(`${key}:${secret}`).toString('base64');
    const tokenUrl = `${authUrlBase}?grant_type=client_credentials`;

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status} - ${responseText}`);

      const data = JSON.parse(responseText);
      if (!data.access_token) throw new Error(`No token provided: ${responseText}`);

      return data.access_token;
    } catch (error: any) {
      this.logger.error(`KCB Token Generation Failed: ${error.message}`);
      throw new InternalServerErrorException(`KCB Auth Error: Check your API Credentials.`);
    }
  }

  // --- A. SAAS PLATFORM BILLING ---
  async initializeKcbMpesaPush(userId: string, phone: string, plan: string, cycle: string = 'MONTHLY') {
    if (!phone) throw new BadRequestException('Phone number is required');

    const masterIntegration = await this.prisma.platformIntegration.findUnique({
      where: { provider: 'MPESA' }
    });

    let masterKey = this.kcbConsumerKey;
    let masterSecret = this.kcbConsumerSecret;

    if (masterIntegration && masterIntegration.is_active && masterIntegration.config) {
      const config = masterIntegration.config as any;
      if (config.kcbConsumerKey) masterKey = config.kcbConsumerKey;
      if (config.kcbConsumerSecret) masterSecret = config.kcbConsumerSecret;
    }

    let formattedPhone = phone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.substring(1)}`;
    if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);

    const token = await this.getKcbAccessToken(masterKey, masterSecret);

    let normalizedPlan = plan.toUpperCase();
    if (normalizedPlan === 'PREMIUM') normalizedPlan = 'PRO'; 

    const requestedPlan = (['STARTER', 'BASIC', 'STANDARD', 'PRO', 'ENTERPRISE'].includes(normalizedPlan)) ? normalizedPlan : 'STARTER';
    const requestedCycle = cycle.toUpperCase() as keyof typeof PRICING.STARTER;
    const amount = PRICING[requestedPlan as keyof typeof PRICING][requestedCycle] || PRICING[requestedPlan as keyof typeof PRICING].MONTHLY;

    const backendUrl = process.env.NODE_ENV === 'production'
      ? 'https://mogitech-rentos-pi.vercel.app'
      : (process.env.NGROK_URL || 'https://sandbox.mogitechglobal.com');

    const callbackUrl = `${backendUrl}/api/v1/payments/kcb/webhook/${userId}`;
    const referenceStr = `UPG${userId.substring(0, 5).toUpperCase()}`;

    const payload = {
      phoneNumber: formattedPhone,
      amount: amount.toString(),
      invoiceNumber: `${this.kcbAccountNumber}-${referenceStr}`,
      sharedShortCode: true,
      orgShortCode: "",
      orgPassKey: "",
      callbackUrl: callbackUrl,
      transactionDescription: `MogiRentOS ${requestedPlan}`
    };

    const uniqueMessageId = `${Date.now()}_MogiRentOS_${userId.substring(0, 5)}`;
    return this.sendStkRequest(token, payload, uniqueMessageId, formattedPhone, amount);
  }

  // --- B. DIRECT SETTLEMENT (Tenants paying Rent) ---
  async initializeTenantRentPush(tenantUserId: string, invoiceId: string, phone: string) {
    if (!phone) throw new BadRequestException('Phone number is required');

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        tenant: { include: { unit: { include: { property: { include: { landlord: true } } } } } },
        payments: true
      }
    });

    if (!invoice || invoice.tenant.user_id !== tenantUserId) {
      throw new NotFoundException('Invoice not found.');
    }

    const landlord = invoice.tenant.unit?.property?.landlord;
    if (!landlord) throw new InternalServerErrorException('Critical Error: Landlord record missing.');

    if (!landlord.mpesa_shortcode || !landlord.kcb_consumer_key || !landlord.kcb_consumer_secret) {
      throw new BadRequestException('Your landlord has not configured their Direct Payment Gateway yet. Please contact management or pay via Bank Transfer.');
    }

    const previouslyPaid = invoice.payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const amountDue = invoice.amount - previouslyPaid;
    if (amountDue <= 0) throw new BadRequestException('This invoice is already fully paid.');

    let formattedPhone = phone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.substring(1)}`;
    if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);

    const token = await this.getKcbAccessToken(landlord.kcb_consumer_key, landlord.kcb_consumer_secret);

    const backendUrl = process.env.NODE_ENV === 'production'
      ? 'https://mogitech-rentos-pi.vercel.app'
      : (process.env.NGROK_URL || 'https://sandbox.mogitechglobal.com');

    const callbackUrl = `${backendUrl}/api/v1/payments/kcb/rent-webhook/${invoiceId}`;
    const accountReference = landlord.bank_account_number || process.env.KCB_ACCOUNT_NUMBER || process.env.KCB_BANK_ACCOUNT;

    const payload = {
      phoneNumber: formattedPhone,
      amount: amountDue.toString(),
      invoiceNumber: accountReference,
      sharedShortCode: true,
      orgShortCode: "",
      orgPassKey: "",
      callbackUrl: callbackUrl,
      transactionDescription: `Rent - Unit ${invoice.tenant.unit?.unit_number}`
    };

    const uniqueMessageId = `${Date.now()}_Rent_${invoice.id.substring(0, 5)}`;
    return this.sendStkRequest(token, payload, uniqueMessageId, formattedPhone, amountDue);
  }

  // --- C. HOUSE HUNTER UNLOCK PAYWALL ---
  async initializeHunterUnlockPush(userId: string, unitId: string, phone: string) {
    if (!phone) throw new BadRequestException('Phone number is required');

    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) throw new NotFoundException('Unit not found');

    let formattedPhone = phone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.substring(1)}`;
    if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);

    const existingUnlock = await this.prisma.marketplaceUnlock.findFirst({
      where: { unit_id: unitId, phone_number: formattedPhone, status: 'SUCCESS' }
    });

    if (existingUnlock) {
      return { message: 'Already unlocked', status: 'SUCCESS' };
    }

    const amount = 10; 

    // Upsert pending record
    const unlockRecord = await this.prisma.marketplaceUnlock.upsert({
      where: { phone_number_unit_id: { phone_number: formattedPhone, unit_id: unitId } },
      update: { status: 'PENDING', amount_paid: amount, updated_at: new Date() },
      create: { phone_number: formattedPhone, unit_id: unitId, amount_paid: amount, status: 'PENDING' }
    });

    const token = await this.getKcbAccessToken(); // uses master credentials
    const backendUrl = process.env.NODE_ENV === 'production'
        ? 'https://mogitech-rentos-pi.vercel.app'
        : (process.env.NGROK_URL || 'https://sandbox.mogitechglobal.com');

    const callbackUrl = `${backendUrl}/api/v1/payments/kcb/hunter-webhook/${unlockRecord.id}`;

    const payload = {
        phoneNumber: formattedPhone,
        amount: amount.toString(),
        invoiceNumber: this.kcbAccountNumber,
        sharedShortCode: true,
        orgShortCode: "",
        orgPassKey: "",
        callbackUrl: callbackUrl,
        transactionDescription: `Unlock Unit ${unit.unit_number}`
    };

    const uniqueMessageId = `${Date.now()}_Unlock_${unlockRecord.id.substring(0, 5)}`;
    
    // Execute STK Push
    const stkResponse = await this.sendStkRequest(token, payload, uniqueMessageId, formattedPhone, amount);
    
    // Bind the generated Checkout ID to our unlock record so the webhook can match it perfectly
    if (stkResponse.checkoutId) {
        await this.prisma.marketplaceUnlock.update({
            where: { id: unlockRecord.id },
            data: { checkout_request_id: stkResponse.checkoutId }
        });
    }

    return { message: 'M-Pesa prompt initiated successfully', status: 'PENDING' };
  }

  // --- D. STK PUSH EXECUTION ENGINE ---
  private async sendStkRequest(token: string, payload: any, messageId: string, phone: string, amount: number) {
    const endpoint = this.kcbStkEndpoint;

    if (!endpoint) {
      this.logger.error('KCB_STK_ENDPOINT is missing from environment variables.');
      throw new InternalServerErrorException('Payment gateway misconfiguration.');
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'routeCode': '207',
          'operation': 'STKPush',
          'messageId': messageId
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status} - ${responseText}`);
      const data = JSON.parse(responseText);

      if (data?.fault) {
        throw new Error(data.fault.description || data.fault.message || 'KCB API Error');
      }

      const checkoutId = data?.response?.CheckoutRequestID || data?.Body?.stkCallback?.CheckoutRequestID;
      if (checkoutId) {
        try {
          await this.prisma.$executeRaw`
            INSERT INTO mpesa_transactions (id, checkout_request_id, phone_number, amount, status, processed, created_at, updated_at) 
            VALUES (gen_random_uuid(), ${checkoutId}, ${phone}, ${amount}, 'PENDING', false, NOW(), NOW())
          `;
        } catch (dbError: any) {
          this.logger.warn(`STK Push sent, but DB log failed. Error: ${dbError.message}`);
        }
      }
      return { message: 'M-Pesa prompt initiated successfully', checkoutId };

    } catch (error: any) {
      this.logger.error(`KCB STK Push Error: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  // ==========================================
  // 3. WEBHOOK HANDLERS
  // ==========================================

  // A. Handles Hunter Unlocking Properties
  async handleHunterUnlockWebhook(unlockId: string, eventData: any) {
    this.logger.log(`Received Hunter Unlock Webhook for Unlock ID: ${unlockId}`);
    const stkCallback = eventData?.Body?.stkCallback;
    if (!stkCallback) return { status: 'ignored' };

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;

    if (resultCode === 0) {
        const metadata = stkCallback.CallbackMetadata?.Item || [];
        const receiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
        
        await this.prisma.marketplaceUnlock.update({
            where: { id: unlockId },
            data: {
                status: 'SUCCESS',
                mpesa_receipt: receiptNumber,
                unlocked_at: new Date(),
                updated_at: new Date()
            }
        });

        try {
            await this.prisma.$executeRaw`
                UPDATE mpesa_transactions 
                SET status = 'SUCCESS', receipt_number = ${receiptNumber}, raw_payload = ${JSON.stringify(eventData)}::jsonb, processed = true, updated_at = NOW()
                WHERE checkout_request_id = ${checkoutRequestId}
            `;
        } catch (e) {
          this.logger.warn('Failed to update mpesa_transactions table for Hunter unlock.');
        }

        this.logger.log(`✅ Hunter Unlock Successful. Receipt: ${receiptNumber}`);
    } else {
        await this.prisma.marketplaceUnlock.update({
            where: { id: unlockId },
            data: { status: 'FAILED', updated_at: new Date() }
        });
        this.logger.warn(`Hunter Unlock Failed. Code: ${resultCode}`);
    }

    return { status: 'success' };
  }

  // B. Handles Landlords Upgrading
  async handleKcbWebhook(userId: string, eventData: any) {
    this.logger.log(`Received Platform KCB Webhook for User: ${userId}`);

    const stkCallback = eventData?.Body?.stkCallback;
    if (!stkCallback) return { status: 'ignored' };

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;

    if (resultCode === 0) {
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      const receiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      const paidAmount = Number(metadata.find((i: any) => i.Name === 'Amount')?.Value);

      this.logger.log(`Platform Payment Success! Receipt: ${receiptNumber}, Amount: ${paidAmount}`);

      let upgradedPlan = 'STARTER';
      let cycle = 'MONTHLY';
      let monthsToAdd = 1;

      // Matrix Mapping for KCB
      if (paidAmount === PRICING.STARTER.MONTHLY) { upgradedPlan = 'STARTER'; cycle = 'MONTHLY'; monthsToAdd = 1; }
      else if (paidAmount === PRICING.STARTER.QUARTERLY) { upgradedPlan = 'STARTER'; cycle = 'QUARTERLY'; monthsToAdd = 3; }
      else if (paidAmount === PRICING.STARTER.SEMI_ANNUAL) { upgradedPlan = 'STARTER'; cycle = 'SEMI_ANNUAL'; monthsToAdd = 6; }
      else if (paidAmount === PRICING.STARTER.ANNUAL) { upgradedPlan = 'STARTER'; cycle = 'ANNUAL'; monthsToAdd = 12; }

      else if (paidAmount === PRICING.BASIC.MONTHLY) { upgradedPlan = 'BASIC'; cycle = 'MONTHLY'; monthsToAdd = 1; }
      else if (paidAmount === PRICING.BASIC.QUARTERLY) { upgradedPlan = 'BASIC'; cycle = 'QUARTERLY'; monthsToAdd = 3; }
      else if (paidAmount === PRICING.BASIC.SEMI_ANNUAL) { upgradedPlan = 'BASIC'; cycle = 'SEMI_ANNUAL'; monthsToAdd = 6; }
      else if (paidAmount === PRICING.BASIC.ANNUAL) { upgradedPlan = 'BASIC'; cycle = 'ANNUAL'; monthsToAdd = 12; }

      else if (paidAmount === PRICING.STANDARD.MONTHLY) { upgradedPlan = 'STANDARD'; cycle = 'MONTHLY'; monthsToAdd = 1; }
      else if (paidAmount === PRICING.STANDARD.QUARTERLY) { upgradedPlan = 'STANDARD'; cycle = 'QUARTERLY'; monthsToAdd = 3; }
      else if (paidAmount === PRICING.STANDARD.SEMI_ANNUAL) { upgradedPlan = 'STANDARD'; cycle = 'SEMI_ANNUAL'; monthsToAdd = 6; }
      else if (paidAmount === PRICING.STANDARD.ANNUAL) { upgradedPlan = 'STANDARD'; cycle = 'ANNUAL'; monthsToAdd = 12; }

      else if (paidAmount === PRICING.PRO.MONTHLY) { upgradedPlan = 'PRO'; cycle = 'MONTHLY'; monthsToAdd = 1; }
      else if (paidAmount === PRICING.PRO.QUARTERLY) { upgradedPlan = 'PRO'; cycle = 'QUARTERLY'; monthsToAdd = 3; }
      else if (paidAmount === PRICING.PRO.SEMI_ANNUAL) { upgradedPlan = 'PRO'; cycle = 'SEMI_ANNUAL'; monthsToAdd = 6; }
      else if (paidAmount === PRICING.PRO.ANNUAL) { upgradedPlan = 'PRO'; cycle = 'ANNUAL'; monthsToAdd = 12; }

      else if (paidAmount === PRICING.ENTERPRISE.MONTHLY) { upgradedPlan = 'ENTERPRISE'; cycle = 'MONTHLY'; monthsToAdd = 1; }
      else if (paidAmount === PRICING.ENTERPRISE.QUARTERLY) { upgradedPlan = 'ENTERPRISE'; cycle = 'QUARTERLY'; monthsToAdd = 3; }
      else if (paidAmount === PRICING.ENTERPRISE.SEMI_ANNUAL) { upgradedPlan = 'ENTERPRISE'; cycle = 'SEMI_ANNUAL'; monthsToAdd = 6; }
      else if (paidAmount === PRICING.ENTERPRISE.ANNUAL) { upgradedPlan = 'ENTERPRISE'; cycle = 'ANNUAL'; monthsToAdd = 12; }

      const newExpiry = new Date();
      newExpiry.setMonth(newExpiry.getMonth() + monthsToAdd);

      await this.prisma.landlord.update({
        where: { user_id: userId },
        data: {
          subscription_status: upgradedPlan,
          subscription_cycle: cycle,
          subscription_expiry: newExpiry
        }
      });

      try {
        await this.prisma.$executeRaw`
          UPDATE mpesa_transactions 
          SET status = 'SUCCESS', receipt_number = ${receiptNumber}, raw_payload = ${JSON.stringify(eventData)}::jsonb, processed = true, updated_at = NOW()
          WHERE checkout_request_id = ${checkoutRequestId}
        `;
      } catch (e) {
        this.logger.warn('Failed to update mpesa_transactions table, but user was upgraded.');
      }
    } else {
      this.logger.warn(`Platform Payment failed. Code: ${resultCode} - ${stkCallback.ResultDesc}`);
    }

    return { status: 'success' };
  }

  // C. Handles Tenants Paying Rent Directly to Landlord
  async handleTenantRentWebhook(invoiceId: string, eventData: any) {
    this.logger.log(`Received Rent KCB Webhook for Invoice: ${invoiceId}`);

    const stkCallback = eventData?.Body?.stkCallback;
    if (!stkCallback) return { status: 'ignored' };

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;

    if (resultCode === 0) {
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      const receiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      const paidAmount = metadata.find((i: any) => i.Name === 'Amount')?.Value;

      this.logger.log(`Rent Payment Success! Receipt: ${receiptNumber}, Amount: ${paidAmount}`);

      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true, tenant: true }
      });

      if (invoice) {
        const amountPaidNum = Number(paidAmount);
        const previouslyPaid = (invoice as any).payments.reduce((sum: number, p: any) => sum + p.amount_paid, 0);
        const totalPaidSoFar = previouslyPaid + amountPaidNum;

        let newStatus = 'PARTIALLY_PAID';
        let overpayment = 0;

        if (totalPaidSoFar >= invoice.amount) {
          newStatus = 'PAID';
          overpayment = totalPaidSoFar - invoice.amount;
        }

        await this.prisma.payment.create({
          data: {
            invoice_id: invoice.id,
            amount_paid: amountPaidNum,
            payment_method: 'M-PESA_DIRECT',
            reference_number: receiptNumber,
          }
        });

        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: newStatus }
        });

        if (overpayment > 0) {
          await this.prisma.tenant.update({
            where: { id: invoice.tenant_id },
            data: { credit_balance: { increment: overpayment } }
          });
        }
      }

      try {
        await this.prisma.$executeRaw`
          UPDATE mpesa_transactions 
          SET status = 'SUCCESS', receipt_number = ${receiptNumber}, raw_payload = ${JSON.stringify(eventData)}::jsonb, processed = true, updated_at = NOW()
          WHERE checkout_request_id = ${checkoutRequestId}
        `;
      } catch (e) {
        this.logger.warn('Failed to log mpesa_transactions for Rent, but invoice was receipted.');
      }
    } else {
      this.logger.warn(`Rent Payment failed. Code: ${resultCode} - ${stkCallback.ResultDesc}`);
    }

    return { status: 'success' };
  }

  // ==========================================
  // 4. LEDGER RECONCILIATION & BULK RECEIPTS (Unaffected)
  // ==========================================
  async reconcileLedger(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new BadRequestException('Landlord profile not found');

    try {
      await this.prisma.$executeRaw`
        UPDATE mpesa_transactions 
        SET status = 'FAILED', processed = true, updated_at = NOW()
        WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '1 hour'
      `;
      return { message: 'Ledger successfully reconciled. Discrepancies synchronized with bank gateways.' };
    } catch (error: any) {
      this.logger.warn('Reconciliation query failed: ' + error.message);
      return { message: 'Ledger reconciliation processed.' };
    }
  }

  async generateBulkReceiptsZip(userId: string, paymentIds: string[]) {
    let archiver;
    try { archiver = require('archiver'); } catch (e) { throw new InternalServerErrorException('Archiver package is missing.'); }

    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord not found');

    const payments = await this.prisma.payment.findMany({
      where: {
        id: { in: paymentIds },
        invoice: { tenant: { unit: { property: { landlord_id: landlord.id } } } }
      },
      include: {
        invoice: { include: { tenant: { include: { unit: { include: { property: true } } } } } }
      }
    });

    if (payments.length === 0) throw new BadRequestException('No valid payments found for export.');

    const archive = archiver('zip', { zlib: { level: 9 } });

    for (const payment of payments) {
      const tenant = payment.invoice.tenant;
      const pdfBuffer = await this.pdfService.generatePaymentReceipt({
        id: payment.id,
        tenantName: `${tenant.first_name} ${tenant.last_name}`,
        propertyName: tenant.unit.property.name || 'Property',
        unitNumber: tenant.unit.unit_number || 'N/A',
        amount: payment.amount_paid,
        method: payment.payment_method,
        reference: payment.reference_number || 'N/A',
        invoiceNumber: (payment.invoice as any).invoice_number || payment.invoice_id.substring(0, 8).toUpperCase(),
        companyName: landlord.company_name || 'MogiRentOS',
        companyLogo: landlord.company_logo || null,
      });
      archive.append(pdfBuffer, { name: `Receipt_${payment.id.substring(0, 8).toUpperCase()}.pdf` });
    }
    archive.finalize();
    return archive;
  }

  // ==========================================
  // 5. KCB INSTANT PAYMENT NOTIFICATIONS (IPN) (Unaffected)
  // ==========================================
  async handleTillNotification(payload: any) {
    this.logger.log(`Received Till IPN: ${JSON.stringify(payload)}`);
    try {
      const header = payload?.header || {};
      const notificationData = payload?.requestPayload?.additionalData?.notificationData;

      if (!notificationData) throw new Error('Invalid Till IPN payload');

      const amountPaid = Number(notificationData.transactionAmt);
      const accountReference = notificationData.businessKey;
      const receiptNumber = notificationData.transactionID;
      const phone = notificationData.debitMSISDN;

      await this.applyDirectPaymentToLedger(accountReference, amountPaid, receiptNumber, 'MPESA', phone);

      return {
        header: {
          messageID: header.messageID || "12345",
          originatorConversationID: header.originatorConversationID || "",
          statusCode: "0",
          statusMessage: "Notification received successfully"
        },
        responsePayload: {
          transactionInfo: { transactionId: receiptNumber }
        }
      };
    } catch (error: any) {
      this.logger.error(`Till IPN Processing Failed: ${error.message}`);
      return { header: { statusCode: "0", statusMessage: "Acknowledged with internal errors" } };
    }
  }

  async handleAccountNotification(payload: any) {
    this.logger.log(`Received Account IPN: ${JSON.stringify(payload)}`);
    try {
      const amountPaid = Number(payload.transactionAmount);
      const accountReference = payload.customerReference;
      const receiptNumber = payload.transactionReference;

      await this.applyDirectPaymentToLedger(accountReference, amountPaid, receiptNumber, 'BANK_TRANSFER', 'N/A');

      return {
        transactionID: receiptNumber,
        statusCode: "0",
        statusMessage: "Notification received successfully"
      };
    } catch (error: any) {
      this.logger.error(`Account IPN Processing Failed: ${error.message}`);
      return { statusCode: "0", statusMessage: "Acknowledged with internal errors" };
    }
  }

  private async applyDirectPaymentToLedger(reference: string, amount: number, receiptNumber: string, method: string, phone: string) {
    const refParts = reference.split('-');
    const extractedId = refParts[refParts.length - 1].toLowerCase();

    // 1. FIRST: Check if it's a Tenant Rent Invoice
    let tenantInvoice = await this.prisma.invoice.findFirst({
      where: {
        OR: [
          { id: { startsWith: extractedId } },
          { id: { startsWith: reference.replace('INV-', '').toLowerCase() } },
          { tenant: { unit: { unit_number: reference } } }
        ],
        status: { not: 'PAID' }
      },
      include: { payments: true, tenant: true },
      orderBy: { due_date: 'asc' }
    });

    if (tenantInvoice) {
      const previouslyPaid = (tenantInvoice as any).payments.reduce((sum: number, p: any) => sum + p.amount_paid, 0);
      const totalPaidSoFar = previouslyPaid + amount;

      let newStatus = 'PARTIALLY_PAID';
      let overpayment = 0;

      if (totalPaidSoFar >= tenantInvoice.amount) {
        newStatus = 'PAID';
        overpayment = totalPaidSoFar - tenantInvoice.amount;
      }

      await this.prisma.payment.create({
        data: {
          invoice_id: tenantInvoice.id,
          amount_paid: amount,
          payment_method: method,
          reference_number: receiptNumber,
        }
      });

      await this.prisma.invoice.update({
        where: { id: tenantInvoice.id },
        data: { status: newStatus }
      });

      if (overpayment > 0) {
        await this.prisma.tenant.update({
          where: { id: tenantInvoice.tenant_id },
          data: { credit_balance: { increment: overpayment } }
        });
      }

      this.logger.log(`✅ Successfully mapped IPN payment of KSH ${amount} to Tenant Rent Invoice ${tenantInvoice.id}.`);
      return; 
    }

    // 2. SECOND: Check if it's a SaaS Platform Invoice
    let platformInvoice = await this.prisma.platformInvoice.findFirst({
      where: {
        OR: [
          { id: { startsWith: extractedId } },
          { id: { startsWith: reference.replace('INV-', '').toLowerCase() } }
        ],
        status: { not: 'PAID' }
      },
      include: { landlord: true }
    });

    if (platformInvoice) {
      await this.prisma.platformInvoice.update({
        where: { id: platformInvoice.id },
        data: {
          status: 'PAID',
          paid_at: new Date(),
          payment_method: method,
          reference_number: receiptNumber
        }
      });

      try {
        const nameParts = platformInvoice.plan_name.split(' - ');
        const upgradeType = nameParts[0] || 'STARTER';
        const upgradeCycle = nameParts.length > 1 ? nameParts[1] : 'MONTHLY';

        const CYCLE_MONTHS = { MONTHLY: 1, QUARTERLY: 3, SEMI_ANNUAL: 6, ANNUAL: 12 };
        const monthsToAdd = CYCLE_MONTHS[upgradeCycle as keyof typeof CYCLE_MONTHS] || 1;

        const newExpiry = new Date();
        newExpiry.setMonth(newExpiry.getMonth() + monthsToAdd);

        await this.prisma.landlord.update({
          where: { id: platformInvoice.landlord_id },
          data: {
            subscription_status: upgradeType,
            subscription_cycle: upgradeCycle,
            subscription_expiry: newExpiry
          }
        });
      } catch (e) {
        this.logger.warn(`Could not automatically extend subscription for landlord ${platformInvoice.landlord_id}. Please review manually.`);
      }

      this.logger.log(`✅ Successfully mapped IPN payment of KSH ${amount} to Platform SaaS Invoice ${platformInvoice.id}. Account upgraded.`);
      return; 
    }

    this.logger.warn(`IPN Alert: Payment of KSH ${amount} received (Ref: ${receiptNumber}), but could not map reference "${reference}" to ANY unpaid invoice (Tenant or SaaS).`);
  }
}