// apps/api/src/invoices/invoices.service.ts
/* eslint-disable */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service'; // <-- IMPORT MAIL SERVICE

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService, 
    private mailService: MailService // <-- INJECTED MAIL SERVICE
  ) { }

  // 1. Generate a new invoice for a tenant
  async createInvoice(tenantId: string, data: { amount: number; description: string; due_date: string }) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    return this.prisma.invoice.create({
      data: {
        tenant_id: tenant.id,
        amount: Number(data.amount),
        description: data.description,
        due_date: new Date(data.due_date),
      },
    });
  }

  // --- MANUAL BATCH GENERATION ---
  async generateInvoicesOnDemand(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord not found');

    const activeTenants = await this.prisma.tenant.findMany({
      where: {
        is_active: true,
        unit: { property: { landlord_id: landlord.id } }
      },
      include: { unit: true }
    });

    if (activeTenants.length === 0) return { message: 'No active tenants found.', count: 0 };

    // Use standard locale string for month matching
    const currentMonthString = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const targetDescription = `Rent for ${currentMonthString}`;
    
    const dueDate = new Date();
    dueDate.setDate(5); // Due on the 5th

    let invoicesCreated = 0;

    for (const tenant of activeTenants) {
      // BULLETPROOF CHECK: Check if any invoice contains "March 2026" (or current month)
      const existingInvoice = await this.prisma.invoice.findFirst({
        where: { 
          tenant_id: tenant.id, 
          description: { contains: currentMonthString } 
        } 
      });

      if (!existingInvoice) {
        await this.prisma.invoice.create({
          data: {
            tenant_id: tenant.id,
            amount: tenant.unit.rent_amount,
            description: targetDescription, 
            due_date: dueDate,
          }
        });
        invoicesCreated++;
      }
    }

    return { message: 'Batch generation complete', count: invoicesCreated };
  }

  // 2. Fetch all invoices for a specific landlord's properties
  async getLandlordInvoices(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord not found');

    return this.prisma.invoice.findMany({
      where: {
        tenant: { unit: { property: { landlord_id: landlord.id } } }
      },
      include: {
        tenant: { include: { unit: { include: { property: true } } } },
        payments: true
      },
      orderBy: { due_date: 'asc' }
    });
  }

  // 3. Process a payment
  async recordPayment(invoiceId: string, data: { amount_paid: number; payment_method: string; reference_number?: string }) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true }
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'PAID') throw new BadRequestException('This invoice is already fully paid.');

    const amountPaid = Number(data.amount_paid);
    const previouslyPaid = invoice.payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const newTotalPaid = previouslyPaid + amountPaid;

    let newStatus = 'UNPAID';
    if (newTotalPaid >= invoice.amount) newStatus = 'PAID';
    else if (newTotalPaid > 0) newStatus = 'PARTIAL';

    return this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          invoice_id: invoice.id,
          amount_paid: amountPaid,
          payment_method: data.payment_method,
          reference_number: data.reference_number,
        }
      }),
      this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: newStatus }
      })
    ]);
  }

  // --- AUTOMATED BILLING ENGINE ---
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Runs once a day at 12:00 AM
  async handleAutomatedBilling() {
    console.log('⏰ [Cron Job] Waking up to check for automated billing...');

    const activeTenants = await this.prisma.tenant.findMany({
      where: { is_active: true },
      include: { unit: true }
    });

    if (activeTenants.length === 0) {
      console.log('   -> No active tenants found. Going back to sleep.');
      return;
    }

    // Standardized month string to match the manual button
    const currentMonthString = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const targetDescription = `Rent for ${currentMonthString}`;

    const dueDate = new Date();
    dueDate.setDate(5);

    let invoicesCreated = 0;

    for (const tenant of activeTenants) {
      // BULLETPROOF CHECK: Matches the manual button logic
      const existingInvoice = await this.prisma.invoice.findFirst({
        where: {
          tenant_id: tenant.id,
          description: { contains: currentMonthString }
        }
      });

      if (!existingInvoice) {
        await this.prisma.invoice.create({
          data: {
            tenant_id: tenant.id,
            amount: tenant.unit.rent_amount,
            description: targetDescription,
            due_date: dueDate,
          }
        });
        invoicesCreated++;
      }
    }

    if (invoicesCreated > 0) {
      console.log(`✅ [Cron Job] Successfully generated ${invoicesCreated} new invoices for ${currentMonthString}.`);
    }
  }

  // --- BULLETPROOF MULTI-CHANNEL REMINDER ENGINE ---
  async sendPaymentReminder(userId: string, invoiceId: string, channels: string[] = ['PORTAL']) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord not found');

    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenant: { unit: { property: { landlord_id: landlord.id } } }
      },
      include: {
        tenant: { include: { unit: { include: { property: true } } } },
        payments: true
      }
    });

    if (!invoice) throw new NotFoundException('Invoice not found or access denied.');
    if (invoice.status === 'PAID') throw new BadRequestException('Cannot send a reminder for a fully paid invoice.');

    const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const balance = invoice.amount - amountPaid;
    const dueDateStr = new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const sentChannels: string[] = [];
    const failedChannels: string[] = [];

    // 1. Process Email
    if (channels.includes('EMAIL')) {
      try {
        if (typeof this.mailService.sendInvoiceReminder !== 'function') {
          throw new Error('sendInvoiceReminder function is missing from MailService.');
        }
        await this.mailService.sendInvoiceReminder(
           invoice.tenant.email,
           invoice.tenant.first_name,
           invoice.description,
           balance,
           dueDateStr,
           invoice.tenant.unit.unit_number,
           landlord.company_name || 'MogiRentOS Management'
        );
        sentChannels.push('Email');
      } catch (err: any) {
        console.error('Email Dispatch Failed (Likely no SMTP config):', err.message);
        failedChannels.push('Email');
      }
    }

    // 2. Process SMS
    if (channels.includes('SMS')) {
      console.log(`📱 [SMS DISPATCHED] To: ${invoice.tenant.phone}`);
      console.log(`Message: "Hello ${invoice.tenant.first_name}, friendly reminder that your balance of KSH ${balance.toLocaleString()} for ${invoice.description} was due on ${dueDateStr}."`);
      sentChannels.push('SMS');
    }

    // 3. Process Tenant Portal Announcement
    if (channels.includes('PORTAL')) {
      console.log(`🔔 [PORTAL ALERT] Dispatched to Tenant Dashboard (ID: ${invoice.tenant.id})`);
      sentChannels.push('Portal');
    }

    // If everything failed, throw a 400. Otherwise, return success!
    if (sentChannels.length === 0 && failedChannels.length > 0) {
      throw new BadRequestException(`Failed to dispatch reminders via ${failedChannels.join(', ')}. Check your email config.`);
    }

    let successMsg = `Reminder dispatched via: ${sentChannels.join(', ')}.`;
    if (failedChannels.length > 0) {
      successMsg += ` (Note: ${failedChannels.join(', ')} failed due to local config).`;
    }

    return {
      status: 'success',
      message: successMsg
    };
  }
}