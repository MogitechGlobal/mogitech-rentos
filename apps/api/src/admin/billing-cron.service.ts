// apps/api/src/admin/billing-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service'; 
import { MailService } from '../mail/mail.service'; 

// THE ADVANCED 5-TIER PRICING MATRIX
const PRICING = {
    STARTER: { MONTHLY: 1500, QUARTERLY: 4275, SEMI_ANNUAL: 8100, ANNUAL: 15000 },
    BASIC: { MONTHLY: 2500, QUARTERLY: 7125, SEMI_ANNUAL: 13500, ANNUAL: 25000 },
    STANDARD: { MONTHLY: 4500, QUARTERLY: 12825, SEMI_ANNUAL: 24300, ANNUAL: 45000 },
    PRO: { MONTHLY: 6500, QUARTERLY: 18525, SEMI_ANNUAL: 35100, ANNUAL: 65000 },
    ENTERPRISE: { MONTHLY: 12000, QUARTERLY: 34200, SEMI_ANNUAL: 64800, ANNUAL: 120000 }
};

@Injectable()
export class BillingCronService {
  private readonly logger = new Logger(BillingCronService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService 
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateMonthlySaaSInvoices() {
    this.logger.log('Starting automated SaaS invoice generation...');
    const startTime = Date.now();

    const jobLog = await this.prisma.systemJobLog.create({
      data: {
        job_name: 'SAAS_BILLING_AUTOMATION',
        status: 'IN_PROGRESS',
        message: 'Initializing billing cycle based on 5-Tier Matrix...'
      }
    });

    try {
        const activeLandlords = await this.prisma.landlord.findMany({
          where: { 
              NOT: { subscription_status: 'SUSPENDED' },
              subscription_status: { not: 'FREE' }
          }
        });

        let generatedCount = 0;
        const now = new Date();
        const currentMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const dueDate = new Date(now.getFullYear(), now.getMonth(), 5);

        for (const landlord of activeLandlords) {
          let rawPlan = (landlord.subscription_status || 'STARTER').toUpperCase();
          if (rawPlan === 'PREMIUM') rawPlan = 'PRO'; 
          
          const plan = (['STARTER', 'BASIC', 'STANDARD', 'PRO', 'ENTERPRISE'].includes(rawPlan) ? rawPlan : 'STARTER') as keyof typeof PRICING;
          const cycle = (landlord.subscription_cycle || 'MONTHLY').toUpperCase() as keyof typeof PRICING.STARTER;

          let amount = 0;
          if (PRICING[plan] && PRICING[plan][cycle]) {
              amount = PRICING[plan][cycle];
          } else if (PRICING[plan] && PRICING[plan].MONTHLY) {
              amount = PRICING[plan].MONTHLY; 
          }

          if (amount === 0) continue; 

          if (landlord.subscription_expiry) {
              const expiryDate = new Date(landlord.subscription_expiry);
              const thirtyDaysFromNow = new Date();
              thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
              
              if (expiryDate > thirtyDaysFromNow) continue; 
          }

          const existingInvoice = await this.prisma.platformInvoice.findFirst({
            where: { landlord_id: landlord.id, billing_period: currentMonth }
          });

          if (!existingInvoice) {
            await this.prisma.platformInvoice.create({
              data: {
                landlord_id: landlord.id, amount, plan_name: `${plan} - ${cycle}`,
                billing_period: currentMonth, due_date: dueDate, status: 'UNPAID'
              }
            });
            generatedCount++;
          } 
          // --- NEW: SELF-HEALING DATA FIX ---
          // If the invoice exists but the amount is wrong, update it!
          else if (existingInvoice.status === 'UNPAID' && existingInvoice.amount !== amount) {
             await this.prisma.platformInvoice.update({
                 where: { id: existingInvoice.id },
                 data: { amount, plan_name: `${plan} - ${cycle}` }
             });
             generatedCount++;
          }
        }

        await this.prisma.systemJobLog.update({
          where: { id: jobLog.id },
          data: {
            status: 'SUCCESS',
            records_processed: generatedCount,
            duration_ms: Date.now() - startTime,
            message: `Successfully generated/synced ${generatedCount} invoices for ${currentMonth}.`
          }
        });

    } catch (error: any) {
        this.logger.error(`Billing Job Failed: ${error.message}`);
        await this.prisma.systemJobLog.update({
          where: { id: jobLog.id },
          data: { status: 'FAILED', duration_ms: Date.now() - startTime, message: `CRITICAL ERROR: ${error.message}` }
        });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAutomatedSaaSReminders() {
      this.logger.log('Checking for automated SaaS reminders...');
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);
      
      const fiveDaysStart = new Date(todayStart);
      fiveDaysStart.setDate(fiveDaysStart.getDate() + 5);
      const fiveDaysEnd = new Date(fiveDaysStart);
      fiveDaysEnd.setDate(fiveDaysEnd.getDate() + 1);
      

      const warningInvoices = await this.prisma.platformInvoice.findMany({
          where: { status: 'UNPAID', due_date: { gte: fiveDaysStart, lt: fiveDaysEnd } },
          include: { landlord: { include: { user: true } } }
      });

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      for (const inv of warningInvoices) {
          if (inv.landlord?.user?.email) {
              const firstName = inv.landlord.user.first_name || inv.landlord.company_name;
              const dueDateStr = new Date(inv.due_date).toLocaleDateString();

              await this.mailService.sendSaaSInvoiceReminder(inv.landlord.user.email, firstName, inv.id, inv.amount, dueDateStr, inv.plan_name);
              
              // Automated WhatsApp Reminder
              await this.dispatchWhatsAppMessage(inv.landlord.contact_phone, firstName, inv.amount, inv.plan_name, dueDateStr);
              await delay(1500);
          }
      }

      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const expiredInvoices = await this.prisma.platformInvoice.findMany({
          where: { status: 'UNPAID', due_date: { gte: todayStart, lt: todayEnd } },
          include: { landlord: { include: { user: true } } }
      });

      for (const inv of expiredInvoices) {
          await this.prisma.platformInvoice.update({
              where: { id: inv.id },
              data: { status: 'OVERDUE' }
          });

          if (inv.landlord?.user?.email) {
              const firstName = inv.landlord.user.first_name || inv.landlord.company_name;
              const dueDateStr = new Date(inv.due_date).toLocaleDateString();

              await this.mailService.sendSaaSExpiryNotice(inv.landlord.user.email, firstName, inv.plan_name);
              
              // Automated WhatsApp Expiry/Overdue Reminder
              await this.dispatchWhatsAppMessage(inv.landlord.contact_phone, firstName, inv.amount, inv.plan_name, dueDateStr);
              await delay(1500);
          }
      }
  }

  // ==========================================
  // WHATSAPP CLOUD API HELPER (SAAS BILLING)
  // ==========================================
  private async dispatchWhatsAppMessage(phone: string, landlordName: string, balance: number, planName: string, dueDate: string) {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneId || !phone) return false;

    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.substring(1)}`;

    const payload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
            name: "saas_reminder", // Must match your Meta template name
            language: { code: "en" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: landlordName },
                        { type: "text", text: balance.toLocaleString() },
                        { type: "text", text: planName },
                        { type: "text", text: dueDate }
                    ]
                }
            ]
        }
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            this.logger.log(`✅ [WHATSAPP] SaaS reminder sent to ${formattedPhone}`);
            return true;
        }
        return false;
    } catch (error) {
        this.logger.error(`WhatsApp Dispatch Failed: ${error}`);
        return false;
    }
  }
}