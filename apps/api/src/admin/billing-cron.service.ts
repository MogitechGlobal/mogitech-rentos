import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path if necessary

@Injectable()
export class BillingCronService {
  private readonly logger = new Logger(BillingCronService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * This job runs automatically at Midnight (00:00) on the 1st day of every month.
   */
  //@Cron('*/10 * * * * *') // For testing: runs every 10 seconds. Change to below for production.
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateMonthlySaaSInvoices() {
    this.logger.log('Starting automated monthly SaaS invoice generation...');
    const startTime = Date.now();

    // 1. Create an "IN_PROGRESS" log entry
    const jobLog = await this.prisma.systemJobLog.create({
      data: {
        job_name: 'SAAS_BILLING_AUTOMATION',
        status: 'IN_PROGRESS',
        message: 'Initializing billing cycle...'
      }
    });

    try {
        const activeLandlords = await this.prisma.landlord.findMany({
          where: { NOT: { subscription_status: 'SUSPENDED' } }
        });

        let generatedCount = 0;
        const now = new Date();
        const currentMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const dueDate = new Date(now.getFullYear(), now.getMonth(), 5);

        for (const landlord of activeLandlords) {
          let amount = 1000; 
          const plan = (landlord.subscription_status || 'BASIC').toUpperCase();
          if (plan === 'PREMIUM') amount = 5000;
          else if (plan === 'PRO') amount = 2500;
          else if (plan === 'FREE') amount = 0;

          if (amount === 0) continue; 

          const existingInvoice = await this.prisma.platformInvoice.findFirst({
            where: { landlord_id: landlord.id, billing_period: currentMonth }
          });

          if (!existingInvoice) {
            await this.prisma.platformInvoice.create({
              data: {
                landlord_id: landlord.id, amount, plan_name: plan,
                billing_period: currentMonth, due_date: dueDate, status: 'UNPAID'
              }
            });
            generatedCount++;
          }
        }

        // 2. Update log to SUCCESS
        await this.prisma.systemJobLog.update({
          where: { id: jobLog.id },
          data: {
            status: 'SUCCESS',
            records_processed: generatedCount,
            duration_ms: Date.now() - startTime,
            message: `Successfully generated ${generatedCount} invoices for ${currentMonth}.`
          }
        });

    } catch (error: any) {
        // 3. Update log to FAILED if it crashes
        this.logger.error(`Billing Job Failed: ${error.message}`);
        await this.prisma.systemJobLog.update({
          where: { id: jobLog.id },
          data: {
            status: 'FAILED',
            duration_ms: Date.now() - startTime,
            message: `CRITICAL ERROR: ${error.message}`
          }
        });
    }
  }
}