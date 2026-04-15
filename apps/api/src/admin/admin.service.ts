import { Injectable, NotFoundException, BadRequestException, Logger, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service'; // <-- IMPORT MAIL SERVICE
import * as os from 'os';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService // <-- INJECT MAIL SERVICE
  ) { }

  // --- INTERNAL AUDIT LOGGER ---
  private async logAction(adminId: string, adminEmail: string, action: string, details: string) {
    await this.prisma.auditLog.create({
      data: {
        admin_id: adminId,
        admin_email: adminEmail,
        action,
        details
      }
    });
  }

  // --- PRIVATE EMAIL DISPATCHER ---
  private async sendStaffInviteEmail(email: string, firstName: string, tempPass: string) {
    const loginUrl = process.env.NEXT_PUBLIC_FRONTEND_URL
      ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/super-admin/login`
      : 'https://rentos.mogitechglobal.com/super-admin/login';

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false }
      });

      const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                <h2 style="color: #1f8898;">Welcome to MogiRentOS!</h2>
                <p>Hi ${firstName},</p>
                <p>You have been officially invited to join the administrative team.</p>
                <div style="background-color: #f8fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #1f8898;">${loginUrl}</a></p>
                    <p style="margin: 0 0 10px 0;"><strong>Email Address:</strong> ${email}</p>
                    <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 6px 10px; border-radius: 4px; font-size: 16px; font-weight: bold; color: #111827;">${tempPass}</code></p>
                </div>
                <p style="color: #e11d48; font-size: 13px; font-weight: bold; background: #fff1f2; padding: 10px; border-radius: 6px; border-left: 4px solid #e11d48;">
                    ⚠️ Security Notice: This temporary password will expire in exactly 24 hours. You will be required to change it immediately upon your first login.
                </p>
                <p>Best regards,<br><strong>MogiRentOS Security Team</strong></p>
            </div>
        `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"MogiRentOS Security" <noreply@mogitechglobal.com>',
        to: email,
        subject: 'Your Admin Invitation (Action Required)',
        html,
      });

      this.logger.log(`Invitation email dispatched successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send invite email to ${email}.`, error);
    }
  }

  async getAuditLogs(page: number = 1, search: string = '') {
    const limit = 50;
    const skip = (page - 1) * limit;

    const whereClause = search ? {
      OR: [
        { admin_email: { contains: search, mode: 'insensitive' as any } },
        { action: { contains: search, mode: 'insensitive' as any } },
        { details: { contains: search, mode: 'insensitive' as any } }
      ]
    } : {};

    const logs = await this.prisma.auditLog.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' }
    });

    const total = await this.prisma.auditLog.count({ where: whereClause });

    return {
      data: logs,
      meta: { total, page, last_page: Math.ceil(total / limit) }
    };
  }

  async getDashboardStats() {
    const totalLandlords = await this.prisma.landlord.count();
    const totalTenants = await this.prisma.tenant.count();
    const totalProperties = await this.prisma.property.count();

    const proLandlords = await this.prisma.landlord.count({ where: { subscription_status: 'PRO' } });
    const basicLandlords = await this.prisma.landlord.count({ where: { subscription_status: 'BASIC' } });
    const estimatedMonthlyMrr = (proLandlords * 4500) + (basicLandlords * 1500);

    const recentTransactions = await this.prisma.mpesaTransaction.count({
      where: { created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    });

    return {
      overview: {
        total_landlords: totalLandlords,
        total_tenants: totalTenants,
        total_properties: totalProperties,
        monthly_recurring_revenue: estimatedMonthlyMrr,
        recent_transactions_24h: recentTransactions
      }
    };
  }

  async getAllLandlords(page: number = 1, search: string = '') {
    const limit = 20;
    const skip = (page - 1) * limit;

    const whereClause = search ? {
      OR: [
        { company_name: { contains: search, mode: 'insensitive' as any } },
        { user: { email: { contains: search, mode: 'insensitive' as any } } }
      ]
    } : {};

    const landlords = await this.prisma.landlord.findMany({
      where: whereClause,
      include: {
        user: { select: { email: true, is_active: true, created_at: true } },
        _count: { select: { properties: true } }
      },
      skip,
      take: limit,
      orderBy: { created_at: 'desc' }
    });

    const total = await this.prisma.landlord.count({ where: whereClause });

    return {
      data: landlords.map(l => ({
        id: l.id,
        user_id: l.user_id,
        company_name: l.company_name,
        email: l.user?.email,
        phone: l.contact_phone,
        plan: l.subscription_status,
        properties_count: l._count.properties,
        is_active: l.user?.is_active,
        joined_at: l.created_at
      })),
      meta: { total, page, last_page: Math.ceil(total / limit) }
    };
  }

  async toggleUserStatus(adminId: string, adminEmail: string, userId: string, isActive: boolean) {
    // 1. Fetch user and include landlord to access the phone number
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, landlord: true }
    });
    if (!user) throw new NotFoundException('User not found in the system.');

    if (user.role.name === 'ADMIN' && !isActive) {
      throw new ForbiddenException('Security Violation: You cannot suspend an Administrator account.');
    }

    // 2. Update status in Database
    await this.prisma.user.update({
      where: { id: userId },
      data: { is_active: isActive }
    });

    await this.logAction(adminId, adminEmail, isActive ? 'ACTIVATE_USER' : 'SUSPEND_USER', `Changed status for user ${user.email} to ${isActive ? 'Active' : 'Suspended'}`);

    // 3. --- NEW: DISPATCH EMAILS & SMS LOGS ---
    const firstName = user.first_name || user.landlord?.company_name || 'User';
    const phone = user.landlord?.contact_phone || 'N/A';

    if (isActive) {
      await this.mailService.sendAccountActivationNotice(user.email, firstName);
      this.logger.log(`📱 [SMS DISPATCHED] To ${phone}: Your MogiRentOS account has been activated and is ready for use.`);
    } else {
      // Uses the suspension notice you previously added for billing
      await this.mailService.sendAccountSuspensionNotice(user.email, firstName);
      this.logger.log(`📱 [SMS DISPATCHED] To ${phone}: URGENT: Your MogiRentOS account has been suspended. Please contact support.`);
    }

    return { message: `User account has been ${isActive ? 'activated' : 'suspended'}.` };
  }

  async getSystemTransactions(page: number = 1) {
    const limit = 50;
    const skip = (page - 1) * limit;

    const transactions = await this.prisma.mpesaTransaction.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' }
    });

    const total = await this.prisma.mpesaTransaction.count();

    return {
      data: transactions,
      meta: { total, page, last_page: Math.ceil(total / limit) }
    };
  }

  async getGlobalIntegrations() {
    try { return await this.prisma.platformIntegration.findMany(); } catch { return []; }
  }

  async saveGlobalIntegration(adminId: string, adminEmail: string, provider: string, config: any) {
    const result = await this.prisma.platformIntegration.upsert({
      where: { provider },
      update: { config, is_active: true },
      create: { provider, config, is_active: true },
    });

    await this.logAction(adminId, adminEmail, 'UPDATE_INTEGRATION', `Updated global API credentials for ${provider}`);
    return result;
  }

  async updateSubscription(adminId: string, adminEmail: string, userId: string, plan: string) {
    const landlord = await this.prisma.landlord.findUnique({ 
        where: { user_id: userId }, 
        include: { user: true } 
    });
    if (!landlord) throw new NotFoundException('Landlord profile not found.');

    // 1. Update Database
    await this.prisma.landlord.update({
      where: { user_id: userId },
      data: { subscription_status: plan.toUpperCase() }
    });

    await this.logAction(adminId, adminEmail, 'UPDATE_SUBSCRIPTION', `Changed subscription tier for ${landlord.company_name} (${landlord.user?.email}) to ${plan.toUpperCase()}`);

    // 2. --- NEW: DISPATCH EMAIL & SMS LOG ---
    if (landlord.user?.email) {
        const firstName = landlord.user.first_name || landlord.company_name;
        await this.mailService.sendSubscriptionTierUpdate(landlord.user.email, firstName, plan.toUpperCase());
        this.logger.log(`📱 [SMS DISPATCHED] To ${landlord.contact_phone}: Your MogiRentOS subscription tier has been successfully updated to ${plan.toUpperCase()}.`);
    }

    return { message: `Subscription successfully updated to ${plan.toUpperCase()}.` };
  }

  async impersonateUser(adminId: string, adminEmail: string, targetUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: { role: true }
    });

    if (!user) throw new NotFoundException('User not found.');
    if (user.role.name === 'ADMIN') throw new BadRequestException('Security violation: Cannot impersonate another Super Admin.');

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-development-key',
      expiresIn: '1h'
    });

    await this.logAction(adminId, adminEmail, 'IMPERSONATE_USER', `Initiated impersonation session for user ${user.email}`);

    return {
      message: `Successfully impersonated ${user.email}`,
      access_token,
      user: { id: user.id, email: user.email, role: user.role.name }
    };
  }

  // --- MULTI-CHANNEL BROADCAST ENGINE ---
  async getAllAnnouncements() {
    return this.prisma.globalAnnouncement.findMany({ orderBy: { created_at: 'desc' } });
  }

  async createAnnouncement(adminId: string, adminEmail: string, data: any) {
    const { title, content, target_audience, individual_email, is_urgent, channels } = data;

    // 1. Gather Target Users for Email/SMS
    let targetUsers: any[] = [];
    if (channels.email || channels.sms) {
      if (target_audience === 'INDIVIDUAL' && individual_email) {
        const user = await this.prisma.user.findUnique({ where: { email: individual_email } });
        if (!user) throw new NotFoundException(`User with email ${individual_email} not found.`);
        targetUsers = [user];
      } else if (target_audience === 'LANDLORDS') {
        targetUsers = await this.prisma.user.findMany({ where: { role: { name: 'LANDLORD' }, is_active: true } });
      } else if (target_audience === 'TENANTS') {
        targetUsers = await this.prisma.user.findMany({ where: { role: { name: 'TENANT' }, is_active: true } });
      } else if (target_audience === 'ALL') {
        targetUsers = await this.prisma.user.findMany({ where: { is_active: true } });
      }
    }

    let announcement: any = null;

    // 2. Dispatch PORTAL Notices
    if (channels.portal) {
      announcement = await this.prisma.globalAnnouncement.create({
        data: {
          title,
          content,
          target_audience: target_audience === 'INDIVIDUAL' ? `INDIVIDUAL: ${individual_email}` : target_audience,
          is_urgent
        }
      });
    } else {
      // Return a virtual object for frontend state so UI updates instantly
      announcement = {
        id: 'email-only-' + Date.now(),
        title,
        content,
        target_audience: target_audience === 'INDIVIDUAL' ? `INDIVIDUAL: ${individual_email}` : target_audience,
        is_urgent,
        created_at: new Date()
      };
    }

    // 3. Dispatch EMAIL Blast
    if (channels.email) {
      for (const user of targetUsers) {
        try {
          await this.mailService.sendBroadcastEmail(
            user.email,
            user.first_name || 'User',
            title,
            content,
            'MogiRentOS Administration',
            is_urgent ? 'EMERGENCY' : 'INFO'
          );
        } catch (error) {
          this.logger.error(`Failed to send broadcast email to ${user.email}`);
        }
      }
    }

    // 4. Dispatch SMS
    if (channels.sms) {
      for (const user of targetUsers) {
        this.logger.log(`[SMS DISPATCHED] To user ${user.email}: ${title}`);
      }
    }

    await this.logAction(adminId, adminEmail, 'CREATE_BROADCAST', `Published an announcement: "${title}" targeting ${target_audience}`);
    return announcement;
  }

  async deleteAnnouncement(adminId: string, adminEmail: string, id: string) {
    const exists = await this.prisma.globalAnnouncement.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Announcement not found.');

    await this.prisma.globalAnnouncement.delete({ where: { id } });
    await this.logAction(adminId, adminEmail, 'DELETE_BROADCAST', `Deleted global announcement: "${exists.title}"`);
    return { message: 'Announcement deleted successfully.' };
  }

  async getAllSupportTickets(page: number = 1, search: string = '') {
    const limit = 20;
    const skip = (page - 1) * limit;

    const whereClause = search ? {
      OR: [
        { subject: { contains: search, mode: 'insensitive' as any } },
        { landlord: { company_name: { contains: search, mode: 'insensitive' as any } } }
      ]
    } : {};

    const tickets = await this.prisma.supportTicket.findMany({
      where: whereClause,
      include: { landlord: { select: { company_name: true, user: { select: { email: true } } } } },
      skip,
      take: limit,
      orderBy: { created_at: 'desc' }
    });

    const total = await this.prisma.supportTicket.count({ where: whereClause });

    return {
      data: tickets,
      meta: { total, page, last_page: Math.ceil(total / limit) }
    };
  }

  async updateSupportTicketStatus(adminId: string, adminEmail: string, ticketId: string, status: string) {
    // 1. Include the Landlord and User relations so we can grab the email
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        landlord: {
          include: { user: true }
        }
      }
    });

    if (!ticket) throw new NotFoundException('Ticket not found.');

    // 2. Update the status in the database
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: status.toUpperCase() }
    });

    await this.logAction(adminId, adminEmail, 'UPDATE_TICKET', `Updated support ticket ${ticketId} status to ${status.toUpperCase()}`);

    // 3. --- NEW: DISPATCH THE AUTOMATED STATUS EMAIL ---
    if (ticket.landlord?.user?.email) {
      try {
        // Use the user's first name, fallback to company name if missing
        const firstName = ticket.landlord.user.first_name || ticket.landlord.company_name;

        await this.mailService.sendTicketStatusUpdate(
          ticket.landlord.user.email,
          firstName,
          ticket.subject,        // The issue/subject of the ticket
          status.toUpperCase()   // The new status
        );
      } catch (error) {
        this.logger.error(`Failed to send ticket status update email to ${ticket.landlord.user.email}`, error);
      }
    }

    return { message: `Ticket status updated to ${status.toUpperCase()}. Landlord notified via email.` };
  }

  // --- MASTER SYSTEM SETTINGS ---
  async getSystemSettings() {
    let settings = await this.prisma.systemSetting.findUnique({ where: { id: 'global_settings' } });

    if (!settings) {
      settings = await this.prisma.systemSetting.create({
        data: { id: 'global_settings' }
      });
    }
    return settings;
  }

  async updateSystemSettings(adminId: string, adminEmail: string, data: any) {
    // 1. Fetch current settings before we update them to see if the toggle changed
    const previousSettings = await this.prisma.systemSetting.findUnique({ where: { id: 'global_settings' } });
    const wasMaintenanceModeOn = previousSettings?.maintenance_mode || false;

    // 2. Perform the update
    const settings = await this.prisma.systemSetting.upsert({
      where: { id: 'global_settings' },
      update: data,
      create: { id: 'global_settings', ...data }
    });

    await this.logAction(adminId, adminEmail, 'UPDATE_SETTINGS', `Updated master system settings (Maintenance Mode: ${settings.maintenance_mode ? 'ON' : 'OFF'})`);

    // 3. --- NEW: DISPATCH SYSTEM-WIDE MAINTENANCE ALERTS ---
    if (wasMaintenanceModeOn !== settings.maintenance_mode) {
      // Run this asynchronously so it doesn't block the frontend API response
      this.dispatchMaintenanceAlerts(settings.maintenance_mode, settings.maintenance_message || 'Scheduled system maintenance is in progress.');
    }

    return settings;
  }

  // Private helper to blast out the maintenance emails and SMS
  private async dispatchMaintenanceAlerts(isStarting: boolean, message: string) {
    this.logger.log(`🚨 [SYSTEM EVENT] Maintenance Mode is now ${isStarting ? 'ON' : 'OFF'}. Dispatching global alerts...`);

    // Fetch all active users across the platform (Admins, Landlords, Tenants)
    const activeUsers = await this.prisma.user.findMany({
      where: { is_active: true }
    });

    // Helper function to create a delay (Throttling)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const user of activeUsers) {
      // Send SMS Text
      this.logger.log(`📱 [SMS DISPATCHED] To ${user.email} (Phone): MogiRentOS System Maintenance is now ${isStarting ? 'ON' : 'OFF'}`);

      // Send HTML Email
      try {
        await this.mailService.sendMaintenanceNotice(
          user.email,
          user.first_name || 'User',
          isStarting,
          message
        );
      } catch (error) {
        this.logger.error(`Failed to send maintenance notice to ${user.email}`);
      }

      // FIX: Wait half a second before sending the next email. 
      // This prevents the SMTP server from flagging the barrage of emails as a spam attack.
      await delay(500);
    }
  }

  // --- SAAS REVENUE MANAGER ---
  async getPlatformBilling() {
    const invoices = await this.prisma.platformInvoice.findMany({
      include: {
        landlord: {
          select: { company_name: true, contact_phone: true, user: { select: { email: true, first_name: true } } }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return invoices;
  }

  // --- ADD THIS TO SAAS REVENUE MANAGER ---
  async remindAllPlatformInvoices(adminId: string, adminEmail: string) {
    const invoices = await this.prisma.platformInvoice.findMany({
      where: { status: { in: ['UNPAID', 'OVERDUE'] } },
      include: { landlord: { include: { user: true } } }
    });

    let sentCount = 0;
    for (const invoice of invoices) {
      if (invoice.landlord?.user?.email) {
        const firstName = invoice.landlord.user.first_name || invoice.landlord.company_name;
        const dueDateStr = new Date(invoice.due_date).toLocaleDateString();

        await this.mailService.sendSaaSInvoiceReminder(
          invoice.landlord.user.email, firstName, invoice.id, invoice.amount, dueDateStr, invoice.plan_name
        );

        this.logger.log(`📱 [SMS DISPATCHED] To ${invoice.landlord.contact_phone}: Bulk Reminder - Subscription invoice for KSH ${invoice.amount} is due.`);
        sentCount++;
      }
    }

    await this.logAction(adminId, adminEmail, 'REMIND_ALL_SAAS_INVOICES', `Dispatched bulk reminders for ${sentCount} unpaid/overdue invoices.`);
    return { message: `Reminders successfully dispatched to ${sentCount} accounts.` };
  }

  async markPlatformInvoicePaid(adminId: string, adminEmail: string, invoiceId: string, data: { payment_method: string; reference_number: string }) {
    const invoice = await this.prisma.platformInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paid_at: new Date(),
        payment_method: data.payment_method,
        reference_number: data.reference_number || null
      },
      include: { landlord: { include: { user: true } } }
    });

    // HIGHLY DETAILED AUDIT TRAIL
    await this.logAction(adminId, adminEmail, 'MARK_SAAS_INVOICE_PAID', `Recorded manual payment for SaaS Invoice ${invoiceId} via ${data.payment_method} (Ref: ${data.reference_number || 'N/A'})`);

    // EMAIL DISPATCH & SMS LOG
    if (invoice.landlord?.user?.email) {
      const firstName = invoice.landlord.user.first_name || invoice.landlord.company_name;
      await this.mailService.sendSaaSPaymentReceipt(
        invoice.landlord.user.email, firstName, invoice.id, invoice.amount, invoice.plan_name, data.payment_method, data.reference_number
      );
      this.logger.log(`📱 [SMS DISPATCHED] To ${invoice.landlord.contact_phone}: We have received your payment of KSH ${invoice.amount} for your MogiRentOS subscription.`);
    }

    return invoice;
  }

  async remindPlatformInvoice(adminId: string, adminEmail: string, invoiceId: string) {
    const invoice = await this.prisma.platformInvoice.findUnique({
      where: { id: invoiceId },
      include: { landlord: { include: { user: true } } }
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    await this.logAction(adminId, adminEmail, 'REMIND_SAAS_INVOICE', `Sent payment reminder for SaaS Invoice ${invoiceId}`);

    // Email Dispatch & SMS Log
    if (invoice.landlord?.user?.email) {
      const firstName = invoice.landlord.user.first_name || invoice.landlord.company_name;
      const dueDateStr = new Date(invoice.due_date).toLocaleDateString();

      await this.mailService.sendSaaSInvoiceReminder(
        invoice.landlord.user.email, firstName, invoice.id, invoice.amount, dueDateStr, invoice.plan_name
      );

      this.logger.log(`📱 [SMS DISPATCHED] To ${invoice.landlord.contact_phone}: Friendly reminder that your MogiRentOS subscription invoice for KSH ${invoice.amount} is due.`);
    }

    return { message: 'Reminder dispatched successfully.' };
  }

  async suspendOverdueLandlord(adminId: string, adminEmail: string, landlordId: string) {
    const landlord = await this.prisma.landlord.update({
      where: { id: landlordId },
      data: { subscription_status: 'SUSPENDED' },
      include: { user: true }
    });

    await this.logAction(adminId, adminEmail, 'SUSPEND_LANDLORD', `Suspended landlord account: ${landlord.company_name}`);

    // Email Dispatch & SMS Log
    if (landlord.user?.email) {
      const firstName = landlord.user.first_name || landlord.company_name;
      await this.mailService.sendAccountSuspensionNotice(landlord.user.email, firstName);
      this.logger.log(`📱 [SMS DISPATCHED] To ${landlord.contact_phone}: URGENT: Your MogiRentOS account has been suspended due to overdue payments.`);
    }

    return landlord;
  }

  async getSystemHealth() {
    const startTime = Date.now();
    let dbStatus = 'CONNECTED';
    let dbLatency = 0;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - startTime;
    } catch (e) {
      dbStatus = 'DISCONNECTED';
    }

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const recentJobs = await this.prisma.systemJobLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    return {
      server: {
        platform: os.platform(),
        uptime: os.uptime(),
        cpuLoad: os.loadavg()[0].toFixed(2),
        ramUsagePct: Math.round((usedMem / totalMem) * 100),
        totalRamGB: (totalMem / 1024 / 1024 / 1024).toFixed(1),
        usedRamGB: (usedMem / 1024 / 1024 / 1024).toFixed(1),
      },
      database: {
        status: dbStatus,
        latencyMs: dbLatency,
      },
      jobs: recentJobs,
    };
  }

  async getAdvancedAnalytics() {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const payments = await this.prisma.payment.groupBy({
      by: ['payment_method'],
      _sum: { amount_paid: true },
      _count: true,
    });

    const paymentStats = payments.map(p => ({
      name: p.payment_method === 'BANK_TRANSFER' ? 'Bank Transfer' : p.payment_method,
      amount: p._sum.amount_paid || 0,
      count: p._count,
    }));

    const maintenance = await this.prisma.maintenanceRequest.groupBy({
      by: ['issue_type'],
      _count: true,
    });

    const maintenanceStats = maintenance.map(m => ({
      name: m.issue_type,
      value: m._count,
    }));

    const landlords = await this.prisma.landlord.findMany({
      where: { created_at: { gte: twelveMonthsAgo } },
      select: { created_at: true }
    });

    const invoices = await this.prisma.platformInvoice.findMany({
      where: { created_at: { gte: twelveMonthsAgo }, status: 'PAID' },
      select: { amount: true, created_at: true }
    });

    const monthlyTrends: { month: string; newLandlords: number; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = targetMonth.toLocaleString('default', { month: 'short', year: '2-digit' });

      const targetMonthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const landlordsJoined = landlords.filter(l => l.created_at >= targetMonth && l.created_at <= targetMonthEnd).length;
      const revenueCollected = invoices
        .filter(inv => inv.created_at >= targetMonth && inv.created_at <= targetMonthEnd)
        .reduce((sum, inv) => sum + inv.amount, 0);

      monthlyTrends.push({
        month: monthLabel,
        newLandlords: landlordsJoined,
        revenue: revenueCollected
      });
    }

    return { paymentStats, maintenanceStats, monthlyTrends };
  }

  async getTeamAndRoles() {
    const roles = await this.prisma.role.findMany({
      where: { name: { notIn: ['LANDLORD', 'TENANT', 'MANAGER'] } },
      include: {
        permissions: true,
        _count: { select: { users: true } }
      }
    });

    const staff = await this.prisma.user.findMany({
      where: { role: { name: { notIn: ['LANDLORD', 'TENANT', 'MANAGER'] } } },
      select: {
        id: true, email: true, first_name: true, last_name: true,
        is_active: true, created_at: true,
        requires_password_change: true,
        invite_expires_at: true,
        role: { select: { id: true, name: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    return { roles, staff };
  }

  async createCustomRole(adminId: string, adminEmail: string, dto: { name: string, permissions: { subject: string, action: string }[] }) {
    const newRole = await this.prisma.role.create({
      data: { name: dto.name.toUpperCase().replace(/\s+/g, '_') }
    });

    if (dto.permissions && dto.permissions.length > 0) {
      await this.prisma.permission.createMany({
        data: dto.permissions.map(p => ({
          role_id: newRole.id,
          subject: p.subject,
          action: p.action
        }))
      });
    }

    await this.logAction(adminId, adminEmail, 'CREATE_ROLE', `Created new administrative role: ${newRole.name}`);
    return { message: 'Custom role created successfully', role: newRole };
  }

  async inviteStaffMember(adminId: string, adminEmail: string, dto: { email: string, role_id: string, first_name: string, last_name: string }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('A user with this email address already exists in the system.');

    const role = await this.prisma.role.findUnique({ where: { id: dto.role_id } });
    if (!role) throw new NotFoundException('Selected role does not exist.');
    if (['LANDLORD', 'TENANT'].includes(role.name)) {
      throw new BadRequestException('Security Violation: Cannot assign customer roles via internal staff invitations.');
    }

    const tempPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        first_name: dto.first_name,
        last_name: dto.last_name,
        password_hash: hashedPassword,
        role_id: dto.role_id,
        requires_password_change: true,
        invite_expires_at: expiresAt
      }
    });

    await this.sendStaffInviteEmail(newUser.email, newUser.first_name || 'Team Member', tempPassword);
    await this.logAction(adminId, adminEmail, 'INVITE_STAFF', `Invited new staff member: ${dto.email}`);

    return { message: 'Staff member invited successfully. Security email has been dispatched.' };
  }

  async resendInvite(adminId: string, adminEmail: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    if (!user.requires_password_change) throw new BadRequestException('This user has already logged in and secured their account. A password reset is required instead.');

    const tempPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: hashedPassword,
        invite_expires_at: expiresAt
      }
    });

    await this.sendStaffInviteEmail(user.email, user.first_name || 'Team Member', tempPassword);
    await this.logAction(adminId, adminEmail, 'RESEND_INVITE', `Resent invitation and generated new temporary credentials for ${user.email}`);

    return { message: 'New temporary password generated and invitation email resent.' };
  }

  async setupNewPassword(userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.requires_password_change) {
      throw new ForbiddenException('Security Violation: This account has already been secured. Please use the standard password reset flow in your profile.');
    }

    if (user.invite_expires_at && new Date(user.invite_expires_at) < new Date()) {
      throw new BadRequestException('Your temporary password has expired. Please contact a Super Admin to resend your invitation.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: hashedPassword,
        requires_password_change: false,
        invite_expires_at: null
      }
    });

    return { message: 'Password successfully updated. You are now securely logged in.' };
  }

  async getGlobalTemplates() {
    return this.prisma.globalTemplate.findMany({
      orderBy: { updated_at: 'desc' }
    });
  }

  async saveGlobalTemplate(dto: { name: string, type: string, content: string }) {
    return this.prisma.globalTemplate.upsert({
      where: { type: dto.type },
      update: { content: dto.content, name: dto.name },
      create: {
        name: dto.name,
        type: dto.type,
        content: dto.content
      }
    });
  }
}