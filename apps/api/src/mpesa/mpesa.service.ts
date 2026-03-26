// apps/api/src/mpesa/mpesa.service.ts
/* eslint-disable */
import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);

  constructor(private prisma: PrismaService) { }

  /**
   * 1. INITIATE STK PUSH
   * Triggered by the Tenant in the Tenant Portal.
   * Logs the intent in mpesa_transactions before calling Safaricom. [cite: 1315, 1325]
   */
  async initiateStkPush(tenantId: string, amount: number, phone: string) {
    // In production, this is where you call Safaricom's Daraja API.
    const simulatedCheckoutRequestId = `ws_CO_${Date.now()}`;

    // Log the intent immediately to the mpesa_transactions table [cite: 1315, 1325]
    await this.prisma.mpesaTransaction.create({
      data: {
        checkout_request_id: simulatedCheckoutRequestId,
        phone_number: phone,
        amount: amount,
        status: 'PENDING'
      }
    });

    return {
      message: 'STK Push sent to phone',
      checkoutRequestId: simulatedCheckoutRequestId
    };
  }

  async getLandlordMpesaLogs(userId: string) {
      // 1. Get all active tenant phone numbers for this landlord's properties
      const activeTenants = await this.prisma.tenant.findMany({
        where: {
          is_active: true,
          unit: { property: { landlord: { user_id: userId } } }
        },
        select: { phone: true }
      });

      if (activeTenants.length === 0) return [];

      // 2. Convert local phones (07...) to Safaricom format (2547...)
      const safaricomPhones = activeTenants.map(t => t.phone.replace(/^0/, '254'));

      // 3. Fetch the latest 8 webhook logs matching those phones
      return this.prisma.mpesaTransaction.findMany({
        where: { phone_number: { in: safaricomPhones } },
        orderBy: { created_at: 'desc' },
        take: 8
      });
    }

  /**
   * 2. WEBHOOK HANDLER
   * Public endpoint called by Safaricom servers.
   * Updates the transaction record and triggers the reconciliation engine. [cite: 1315, 1325]
   */
  async handleCallback(payload: any) {
    this.logger.log('Received M-Pesa Callback');

    const body = payload.Body.stkCallback;
    const checkoutRequestId = body.CheckoutRequestID;
    const resultCode = body.ResultCode;

    // Handle Failed Transactions (ResultCode 0 is success)
    if (resultCode !== 0) {
      await this.prisma.mpesaTransaction.update({
        where: { checkout_request_id: checkoutRequestId },
        data: { status: 'FAILED', raw_payload: body }
      });
      return { status: 'acknowledged' };
    }

    // Extract Metadata for Successful Transactions
    const callbackMetadata = body.CallbackMetadata.Item;
    const amountItem = callbackMetadata.find((item: any) => item.Name === 'Amount');
    const receiptItem = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber');
    const phoneItem = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber');

    const mpesaRecord = await this.prisma.mpesaTransaction.update({
      where: { checkout_request_id: checkoutRequestId },
      data: {
        status: 'SUCCESS',
        amount: amountItem.Value,
        receipt_number: receiptItem.Value,
        phone_number: phoneItem.Value.toString(),
        raw_payload: body
      }
    });

    // Trigger Reconciliation Engine [cite: 1315, 1325]
    await this.reconcilePayment(mpesaRecord.id);

    return { status: 'success' };
  }

  /**
   * 3. THE RECONCILIATION ALGORITHM
   * Matches the M-Pesa payload to the correct Tenant and Invoice.
   * Uses Type Guards to satisfy strict TypeScript requirements. [cite: 1315, 1325]
   */
  private async reconcilePayment(transactionId: string) {
    const transaction = await this.prisma.mpesaTransaction.findUnique({
      where: { id: transactionId }
    });

    // Guard: Ensure transaction exists, is successful, and hasn't been processed yet
    if (!transaction || transaction.processed || transaction.status !== 'SUCCESS') return;

    // --- REVISED: TypeScript Type Guard (Fixes TS18047) ---
    // This ensures phone_number and amount are NOT null before processing [cite: 1315, 1325]
    if (!transaction.phone_number || transaction.amount === null) {
      this.logger.error(`Reconciliation Failed: Transaction ${transactionId} is missing critical phone or amount data.`);
      return;
    }

    // 1. Normalize Phone Number and find the Tenant [cite: 1315, 1325]
    // Replaces country code 254 with local 0 for database matching
    const normalizedPhone = transaction.phone_number.replace(/^254/, '0');

    const tenant = await this.prisma.tenant.findFirst({
      where: { phone: normalizedPhone, is_active: true }
    });

    if (!tenant) {
      this.logger.warn(`Reconciliation Failed: No active tenant found for phone ${normalizedPhone}`);
      return;
    }

    // 2. Identify Liability: Find the oldest outstanding invoice [cite: 1315, 1325]
    const oldestInvoice = await this.prisma.invoice.findFirst({
      where: {
        tenant_id: tenant.id,
        status: { in: ['UNPAID', 'PARTIAL'] }
      },
      include: { payments: true },
      orderBy: { due_date: 'asc' }
    });

    // If no invoice found, move funds to the Tenant's credit balance [cite: 1315, 1325]
    if (!oldestInvoice) {
      this.logger.warn(`Reconciliation Note: Tenant ${tenant.id} has no outstanding invoices. Escrowing funds to credit balance.`);
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: { credit_balance: { increment: transaction.amount } }
      });
      await this.prisma.mpesaTransaction.update({
        where: { id: transactionId },
        data: { processed: true }
      });
      return;
    }

    // 3. Execute Settlement Transaction [cite: 1315, 1325]
    const amountPaid = transaction.amount;
    const previouslyPaid = oldestInvoice.payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const newTotalPaid = previouslyPaid + amountPaid;

    let newInvoiceStatus = 'UNPAID';
    if (newTotalPaid >= oldestInvoice.amount) {
      newInvoiceStatus = 'PAID';
    } else if (newTotalPaid > 0) {
      newInvoiceStatus = 'PARTIAL';
    }

    // Atomic update using $transaction to ensure data integrity [cite: 1315, 1325]
    await this.prisma.$transaction([
      // Log the payment in the official ledger
      this.prisma.payment.create({
        data: {
          invoice_id: oldestInvoice.id,
          amount_paid: amountPaid,
          payment_method: 'MPESA',
          reference_number: transaction.receipt_number || 'UNKNOWN',
        }
      }),
      // Update the invoice status based on new balance
      this.prisma.invoice.update({
        where: { id: oldestInvoice.id },
        data: { status: newInvoiceStatus }
      }),
      // Mark the raw transaction as fully reconciled
      this.prisma.mpesaTransaction.update({
        where: { id: transactionId },
        data: { processed: true }
      })
    ]);

    this.logger.log(`Reconciliation Success: Applied ${amountPaid} KES to Invoice ${oldestInvoice.id} for Tenant ${tenant.id}`);
  }
}