// apps/api/src/invoices/invoices.service.ts
/* eslint-disable */
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service'; 
import { AuditService } from '../audit/audit.service';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService, 
    private mailService: MailService,
    private auditService: AuditService
  ) { }

  // --- RBAC DATA ISOLATION HELPER ---
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
            propertyIds: staff.assignments.map(a => a.property_id) // Caretaker/Finance Restrictions
        };
    }

    throw new UnauthorizedException('Access denied. No landlord or staff profile found.');
  }

  // 1. Generate a new invoice for a tenant
  async createInvoice(userId: string, tenantId: string, data: { amount: number; description: string; due_date: string }) {
    const access = await this.resolveAccess(userId);

    const tenant = await this.prisma.tenant.findUnique({ 
      where: { id: tenantId },
      include: { unit: { include: { property: true } } }
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    // Security Check: Verify property belongs to workspace & staff has access
    if (tenant.unit.property.landlord_id !== access.landlordId) throw new UnauthorizedException('Access denied');
    if (access.propertyIds && !access.propertyIds.includes(tenant.unit.property_id)) {
      throw new UnauthorizedException('Access denied to this property.');
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        tenant_id: tenant.id,
        amount: Number(data.amount),
        description: data.description,
        due_date: new Date(data.due_date),
      },
    });

    await this.auditService.logActivity(userId, 'CREATED_INVOICE', `Created a KSH ${invoice.amount} invoice for tenant ${tenant.first_name} (${tenant.unit.property.name}, Unit ${tenant.unit.unit_number})`);

    return invoice;
  }

  // --- MANUAL BATCH GENERATION ---
  async generateInvoicesOnDemand(userId: string) {
    const access = await this.resolveAccess(userId);

    const activeTenants = await this.prisma.tenant.findMany({
      where: {
        is_active: true,
        unit: { 
          property: { 
            landlord_id: access.landlordId,
            ...(access.propertyIds ? { id: { in: access.propertyIds } } : {})
          } 
        }
      },
      include: { unit: true }
    });

    if (activeTenants.length === 0) return { message: 'No active tenants found.', count: 0 };

    const currentMonthString = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const targetDescription = `Rent for ${currentMonthString}`;
    
    const dueDate = new Date();
    dueDate.setDate(5); 

    let invoicesCreated = 0;

    for (const tenant of activeTenants) {
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
      await this.auditService.logActivity(userId, 'GENERATED_BATCH_INVOICES', `Manually triggered batch generation. Created ${invoicesCreated} invoices for ${currentMonthString}.`);
    }

    return { message: 'Batch generation complete', count: invoicesCreated };
  }

  // 2. Fetch all invoices for a specific landlord's properties
  async getLandlordInvoices(userId: string) {
    const access = await this.resolveAccess(userId);

    return this.prisma.invoice.findMany({
      where: {
        tenant: { 
          unit: { 
            property: { 
              landlord_id: access.landlordId,
              ...(access.propertyIds ? { id: { in: access.propertyIds } } : {}) 
            } 
          } 
        }
      },
      include: {
        tenant: { include: { unit: { include: { property: true } } } },
        payments: true
      },
      orderBy: { due_date: 'asc' }
    });
  }

  // 3. Process a payment
  async recordPayment(userId: string, invoiceId: string, data: { amount_paid: number; payment_method: string; reference_number?: string }) {
    const access = await this.resolveAccess(userId);

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { 
        payments: true, 
        tenant: { include: { unit: { include: { property: true } } } } 
      }
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    if (invoice.tenant.unit.property.landlord_id !== access.landlordId) throw new UnauthorizedException('Access denied');
    if (access.propertyIds && !access.propertyIds.includes(invoice.tenant.unit.property_id)) {
      throw new UnauthorizedException('Access denied to this property.');
    }

    if (invoice.status === 'PAID') throw new BadRequestException('This invoice is already fully paid.');

    const amountPaid = Number(data.amount_paid);
    const previouslyPaid = invoice.payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const newTotalPaid = previouslyPaid + amountPaid;

    let newStatus = 'UNPAID';
    if (newTotalPaid >= invoice.amount) newStatus = 'PAID';
    else if (newTotalPaid > 0) newStatus = 'PARTIAL';

    const result = await this.prisma.$transaction([
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

    await this.auditService.logActivity(userId, 'RECORDED_PAYMENT', `Recorded KSH ${amountPaid} payment via ${data.payment_method} for ${invoice.tenant.first_name}'s invoice.`);

    return result;
  }

  // --- AUTOMATED BILLING ENGINE ---
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) 
  async handleAutomatedBilling() {
    const activeTenants = await this.prisma.tenant.findMany({
      where: { is_active: true },
      include: { unit: true }
    });

    if (activeTenants.length === 0) return;

    const currentMonthString = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const targetDescription = `Rent for ${currentMonthString}`;

    const dueDate = new Date();
    dueDate.setDate(5);

    let invoicesCreated = 0;

    for (const tenant of activeTenants) {
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
  }

  // --- AUTOMATED OVERDUE REMINDER ENGINE ---
  // Runs exactly at midnight (00:00) on the 6th day of every month
  @Cron('0 0 5 * *') 
  async handleAutomatedReminders() {
    console.log('⏳ [CRON] Initiating automated overdue reminders for the 5th of the month...');

    // 1. Fetch all active tenants with unpaid or partially paid invoices
    const unpaidInvoices = await this.prisma.invoice.findMany({
      where: {
        status: { not: 'PAID' },
        tenant: { is_active: true } // Only remind tenants who are still active
      },
      include: {
        tenant: { include: { unit: { include: { property: { include: { landlord: true } } } } } },
        payments: true
      }
    });

    if (unpaidInvoices.length === 0) {
      console.log('✅ [CRON] No outstanding invoices to remind. Everyone is fully paid up!');
      return;
    }

    let sentCount = 0;
    
    // We retain the delay function to protect your WhatsApp API from rate-limiting blocks
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const invoice of unpaidInvoices) {
      const amountPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
      const balance = Number(invoice.amount) - amountPaid;
      
      // Safety check: if balance is somehow 0 or less, skip them
      if (balance <= 0) continue; 

      const dueDateStr = new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const landlord = invoice.tenant.unit.property.landlord;
      const landlordName = landlord.company_name || 'Management';

      try {
        // Dispatch the official Meta WhatsApp Template
        await this.dispatchWhatsAppMessage(
            invoice.tenant.phone,
            invoice.tenant.first_name,
            balance,
            invoice.description,
            dueDateStr,
            landlordName
        );

        // Optionally dispatch Email as a secondary fallback
        if (invoice.tenant.email && typeof this.mailService.sendInvoiceReminder === 'function') {
          await this.mailService.sendInvoiceReminder(
            invoice.tenant.email,
            invoice.tenant.first_name,
            invoice.description,
            balance,
            dueDateStr,
            invoice.tenant.unit.unit_number,
            landlordName
          );
        }
        
        sentCount++;
        await delay(1500); // 1.5s delay between dispatches

      } catch (err: any) {
        console.error(`❌ [CRON] Failed automated reminder for Invoice ${invoice.id}:`, err.message);
      }
    }

    console.log(`✅ [CRON] Automated reminders successfully dispatched to ${sentCount} tenants.`);
  }

  // --- BULK REMINDER ENGINE ---
  async sendBulkPaymentReminders(userId: string, channels: string[] = ['PORTAL']) {
    const access = await this.resolveAccess(userId);

    const unpaidInvoices = await this.prisma.invoice.findMany({
      where: {
        status: { not: 'PAID' },
        tenant: { 
          unit: { 
            property: { 
              landlord_id: access.landlordId,
              ...(access.propertyIds ? { id: { in: access.propertyIds } } : {})
            } 
          } 
        }
      },
      include: {
        tenant: { include: { unit: { include: { property: { include: { landlord: true } } } } } },
        payments: true
      }
    });

    if (unpaidInvoices.length === 0) {
      return {
        status: 'success',
        message: 'No outstanding invoices found. Everyone is fully paid up!'
      };
    }

    let sentCount = 0;
    let failedCount = 0;

    // Added a slight delay between messages to prevent WhatsApp/Email rate limits
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const invoice of unpaidInvoices) {
      const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount_paid, 0);
      const balance = invoice.amount - amountPaid;
      
      if (balance <= 0) continue; 

      const dueDateStr = new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const landlord = invoice.tenant.unit.property.landlord;
      const landlordName = landlord.company_name || 'Management';

      try {
        if (channels.includes('EMAIL')) {
          if (typeof this.mailService.sendInvoiceReminder === 'function') {
            await this.mailService.sendInvoiceReminder(
              invoice.tenant.email,
              invoice.tenant.first_name,
              invoice.description,
              balance,
              dueDateStr,
              invoice.tenant.unit.unit_number,
              landlordName
            );
          }
        }
        
        // --- NEW: WHATSAPP INTEGRATION ---
        if (channels.includes('WHATSAPP')) {
            await this.dispatchWhatsAppMessage(
                invoice.tenant.phone,
                invoice.tenant.first_name,
                balance,
                invoice.description,
                dueDateStr,
                landlordName
            );
        }
        
        if (channels.includes('PORTAL')) {
          console.log(`🔔 [BULK PORTAL] Alert for Tenant ID: ${invoice.tenant.id}`);
        }
        
        sentCount++;
        await delay(1500); // 1.5s delay to strictly avoid rate-limiting algorithms
      } catch (err) {
        failedCount++;
        console.error(`Failed bulk reminder for Invoice ${invoice.id}:`, err);
      }
    }

    if (sentCount === 0 && failedCount > 0) {
      return {
        status: 'warning',
        message: `Your providers blocked ${failedCount} messages. Please check your API limits or WhatsApp token.`
      };
    }

    await this.auditService.logActivity(userId, 'SENT_BULK_REMINDERS', `Dispatched bulk reminders for ${sentCount} outstanding invoices via ${channels.join(', ')}.`);

    return {
      status: 'success',
      message: `Successfully dispatched reminders for ${sentCount} outstanding invoices.${failedCount > 0 ? ` (${failedCount} failed).` : ''}`
    };
  }

  // --- SINGLE MULTI-CHANNEL REMINDER ENGINE ---
  async sendPaymentReminder(userId: string, invoiceId: string, channels: string[] = ['PORTAL']) {
    const access = await this.resolveAccess(userId);

    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenant: { 
          unit: { 
            property: { 
              landlord_id: access.landlordId,
              ...(access.propertyIds ? { id: { in: access.propertyIds } } : {})
            } 
          } 
        }
      },
      include: {
        tenant: { include: { unit: { include: { property: { include: { landlord: true } } } } } },
        payments: true
      }
    });

    if (!invoice) throw new NotFoundException('Invoice not found or access denied.');
    if (invoice.status === 'PAID') throw new BadRequestException('Cannot send a reminder for a fully paid invoice.');

    const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const balance = invoice.amount - amountPaid;
    const dueDateStr = new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const landlord = invoice.tenant.unit.property.landlord;
    const landlordName = landlord.company_name || 'Management';

    const sentChannels: string[] = [];
    const failedChannels: string[] = [];

    if (channels.includes('EMAIL')) {
      try {
        await this.mailService.sendInvoiceReminder(
           invoice.tenant.email,
           invoice.tenant.first_name,
           invoice.description,
           balance,
           dueDateStr,
           invoice.tenant.unit.unit_number,
           landlordName
        );
        sentChannels.push('Email');
      } catch (err: any) {
        failedChannels.push('Email');
      }
    }

    // --- NEW: WHATSAPP INTEGRATION ---
    if (channels.includes('WHATSAPP')) {
        try {
            await this.dispatchWhatsAppMessage(
                invoice.tenant.phone,
                invoice.tenant.first_name,
                balance,
                invoice.description,
                dueDateStr,
                landlordName
            );
            sentChannels.push('WhatsApp');
        } catch (err: any) {
            console.error('WhatsApp Dispatch Failed:', err.message);
            failedChannels.push('WhatsApp');
        }
    }

    if (channels.includes('PORTAL')) {
      sentChannels.push('Portal');
    }

    if (sentChannels.length === 0 && failedChannels.length > 0) {
      throw new BadRequestException(`Failed to dispatch reminders via ${failedChannels.join(', ')}. Check your configurations.`);
    }

    await this.auditService.logActivity(userId, 'SENT_INVOICE_REMINDER', `Sent a manual payment reminder to ${invoice.tenant.first_name} for invoice ${invoice.id} via ${sentChannels.join(', ')}.`);

    let successMsg = `Reminder dispatched via: ${sentChannels.join(', ')}.`;
    if (failedChannels.length > 0) {
      successMsg += ` (Note: ${failedChannels.join(', ')} failed to send).`;
    }

    return {
      status: 'success',
      message: successMsg
    };
  }

  // ==========================================
  // WHATSAPP CLOUD API HELPER (META)
  // ==========================================
  private async dispatchWhatsAppMessage(phone: string, tenantName: string, balance: number, description: string, dueDate: string, companyName: string) {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
        throw new Error('WhatsApp API credentials are not configured in the environment variables.');
    }

    // Sanitize phone number (Meta requires international format without '+' e.g., 254700000000)
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = `254${formattedPhone.substring(1)}`; // Fallback for Kenyan numbers missing country code
    }

    // Meta strictly requires pre-approved templates for outgoing notifications outside the 24h window
    // You must create a template named 'rent_reminder' in your Meta Business Manager
    const payload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
            name: "rent_reminder", // IMPORTANT: Must match the template name in your Meta dashboard
            language: { code: "en" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: tenantName },
                        { type: "text", text: balance.toLocaleString() },
                        { type: "text", text: description },
                        { type: "text", text: dueDate },
                        { type: "text", text: companyName }
                    ]
                }
            ]
        }
    };

    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
    }

    console.log(`✅ [WHATSAPP] Successfully dispatched reminder to ${formattedPhone}`);
    return true;
  }
}