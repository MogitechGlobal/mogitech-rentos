// apps/api/src/mpesa/mpesa.service.ts
/* eslint-disable */
import { Injectable, Logger, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);

  constructor(private prisma: PrismaService) { }

  // --- NEW: RBAC DATA ISOLATION HELPER ---
  private async resolveAccess(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (landlord) return { landlordId: landlord.id, propertyIds: null }; // Full access

    const staff = await this.prisma.staff.findUnique({
        where: { user_id: userId },
        include: { assignments: true }
    });

    if (staff) {
        return {
            landlordId: staff.landlord_id,
            propertyIds: staff.assignments.map(a => a.property_id) // Restricted access
        };
    }

    throw new UnauthorizedException('Access denied. No landlord or staff profile found.');
  }

  async initiateStkPush(tenantId: string, amount: number, phone: string) {
    const simulatedCheckoutRequestId = `ws_CO_${Date.now()}`;

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

  // --- FIXED: DATA ISOLATION FOR MPESA LOGS ---
  async getLandlordMpesaLogs(userId: string) {
      const access = await this.resolveAccess(userId);

      // 1. Get all active tenant phone numbers for assigned properties ONLY
      const activeTenants = await this.prisma.tenant.findMany({
        where: {
          is_active: true,
          unit: { 
              property: { 
                  landlord_id: access.landlordId,
                  ...(access.propertyIds ? { id: { in: access.propertyIds } } : {}) // Apply staff restriction
              } 
          }
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

    // Trigger Reconciliation Engine
    await this.reconcilePayment(mpesaRecord.id);

    return { status: 'success' };
  }

  private async reconcilePayment(transactionId: string) {
    const transaction = await this.prisma.mpesaTransaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction || transaction.processed || transaction.status !== 'SUCCESS') return;

    if (!transaction.phone_number || transaction.amount === null) {
      this.logger.error(`Reconciliation Failed: Transaction ${transactionId} is missing critical phone or amount data.`);
      return;
    }

    const normalizedPhone = transaction.phone_number.replace(/^254/, '0');

    const tenant = await this.prisma.tenant.findFirst({
      where: { phone: normalizedPhone, is_active: true }
    });

    if (!tenant) {
      this.logger.warn(`Reconciliation Failed: No active tenant found for phone ${normalizedPhone}`);
      return;
    }

    const oldestInvoice = await this.prisma.invoice.findFirst({
      where: {
        tenant_id: tenant.id,
        status: { in: ['UNPAID', 'PARTIAL'] }
      },
      include: { payments: true },
      orderBy: { due_date: 'asc' }
    });

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

    const amountPaid = transaction.amount;
    const previouslyPaid = oldestInvoice.payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const newTotalPaid = previouslyPaid + amountPaid;

    let newInvoiceStatus = 'UNPAID';
    if (newTotalPaid >= oldestInvoice.amount) {
      newInvoiceStatus = 'PAID';
    } else if (newTotalPaid > 0) {
      newInvoiceStatus = 'PARTIAL';
    }

    await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          invoice_id: oldestInvoice.id,
          amount_paid: amountPaid,
          payment_method: 'MPESA',
          reference_number: transaction.receipt_number || 'UNKNOWN',
        }
      }),
      this.prisma.invoice.update({
        where: { id: oldestInvoice.id },
        data: { status: newInvoiceStatus }
      }),
      this.prisma.mpesaTransaction.update({
        where: { id: transactionId },
        data: { processed: true }
      })
    ]);

    this.logger.log(`Reconciliation Success: Applied ${amountPaid} KES to Invoice ${oldestInvoice.id} for Tenant ${tenant.id}`);
  }
}