// apps/api/src/admin/admin.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as os from 'os';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

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

  // --- AUDIT LOG FETCHER ---
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

  // 1. Global Platform Metrics
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

  // 2. Manage Landlords (List & Filter)
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

  // 3. Suspend or Activate a User
  async toggleUserStatus(adminId: string, adminEmail: string, userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found in the system.');

    await this.prisma.user.update({
      where: { id: userId },
      data: { is_active: isActive }
    });

    await this.logAction(adminId, adminEmail, isActive ? 'ACTIVATE_USER' : 'SUSPEND_USER', `Changed status for user ${user.email} to ${isActive ? 'Active' : 'Suspended'}`);

    return { message: `User account has been ${isActive ? 'activated' : 'suspended'}.` };
  }

  // 4. View Platform-Wide M-Pesa & Gateway Logs
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
  
  // 5. Get Global Integrations
  async getGlobalIntegrations() {
    try { return await this.prisma.platformIntegration.findMany(); } catch { return []; }
  }

  // 6. Save Global Integration
  async saveGlobalIntegration(adminId: string, adminEmail: string, provider: string, config: any) {
    const result = await this.prisma.platformIntegration.upsert({
      where: { provider },
      update: { config, is_active: true },
      create: { provider, config, is_active: true },
    });

    await this.logAction(adminId, adminEmail, 'UPDATE_INTEGRATION', `Updated global API credentials for ${provider}`);
    return result;
  }

  // 7. Update Subscription Plan
  async updateSubscription(adminId: string, adminEmail: string, userId: string, plan: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId }, include: { user: true } });
    if (!landlord) throw new NotFoundException('Landlord profile not found.');

    await this.prisma.landlord.update({
      where: { user_id: userId },
      data: { subscription_status: plan.toUpperCase() }
    });

    await this.logAction(adminId, adminEmail, 'UPDATE_SUBSCRIPTION', `Changed subscription tier for ${landlord.company_name} (${landlord.user.email}) to ${plan.toUpperCase()}`);
    return { message: `Subscription successfully updated to ${plan.toUpperCase()}.` };
  }

  // 8. User Impersonation
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

  // 9. Global Announcements
  async getAllAnnouncements() {
    return this.prisma.globalAnnouncement.findMany({ orderBy: { created_at: 'desc' } });
  }

  async createAnnouncement(adminId: string, adminEmail: string, data: { title: string; content: string; target_audience: string; is_urgent: boolean }) {
    const announcement = await this.prisma.globalAnnouncement.create({
      data: {
        title: data.title,
        content: data.content,
        target_audience: data.target_audience,
        is_urgent: data.is_urgent
      }
    });

    await this.logAction(adminId, adminEmail, 'CREATE_BROADCAST', `Published a global announcement: "${data.title}" targeting ${data.target_audience}`);
    return announcement;
  }

  async deleteAnnouncement(adminId: string, adminEmail: string, id: string) {
    const exists = await this.prisma.globalAnnouncement.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Announcement not found.');
    
    await this.prisma.globalAnnouncement.delete({ where: { id } });
    await this.logAction(adminId, adminEmail, 'DELETE_BROADCAST', `Deleted global announcement: "${exists.title}"`);
    return { message: 'Announcement deleted successfully.' };
  }

  // --- NEW: SUPPORT HELPDESK ---
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
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found.');

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: status.toUpperCase() }
    });

    await this.logAction(adminId, adminEmail, 'UPDATE_TICKET', `Updated support ticket ${ticketId} status to ${status.toUpperCase()}`);
    return { message: `Ticket status updated to ${status.toUpperCase()}.` };
  }

  // --- NEW: MASTER SYSTEM SETTINGS ---
  async getSystemSettings() {
    let settings = await this.prisma.systemSetting.findUnique({ where: { id: 'global_settings' } });
    
    // Auto-initialize if it doesn't exist yet
    if (!settings) {
        settings = await this.prisma.systemSetting.create({
            data: { id: 'global_settings' }
        });
    }
    return settings;
  }

  async updateSystemSettings(adminId: string, adminEmail: string, data: any) {
    const settings = await this.prisma.systemSetting.upsert({
        where: { id: 'global_settings' },
        update: data,
        create: { id: 'global_settings', ...data }
    });

    await this.logAction(adminId, adminEmail, 'UPDATE_SETTINGS', `Updated master system settings (Maintenance Mode: ${settings.maintenance_mode ? 'ON' : 'OFF'})`);
    return settings;
  }

  // --- SAAS REVENUE MANAGER ---
  async getPlatformBilling() {
    const invoices = await this.prisma.platformInvoice.findMany({
      include: {
        landlord: {
          select: { company_name: true, user: { select: { email: true } } }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return invoices;
  }

  async markPlatformInvoicePaid(invoiceId: string) {
    return this.prisma.platformInvoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID', paid_at: new Date() }
    });
  }

  async suspendOverdueLandlord(landlordId: string) {
    // Suspend the landlord's account if they haven't paid
    return this.prisma.landlord.update({
      where: { id: landlordId },
      data: { subscription_status: 'SUSPENDED' }
    });
  }

  // --- SYSTEM HEALTH & DEVOPS ---
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

    // Fetch the last 20 automated job logs
    const recentJobs = await this.prisma.systemJobLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    return {
      server: {
        platform: os.platform(),
        uptime: os.uptime(),
        cpuLoad: os.loadavg()[0].toFixed(2), // 1-minute load average
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

  // --- ADVANCED ANALYTICS & BI ---
  async getAdvancedAnalytics() {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    // 1. Payment Methods (Volume & Count)
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

    // 2. Maintenance Request Types (Platform-wide heat)
    const maintenance = await this.prisma.maintenanceRequest.groupBy({
      by: ['issue_type'],
      _count: true,
    });

    const maintenanceStats = maintenance.map(m => ({
      name: m.issue_type,
      value: m._count,
    }));

    // 3. Time-Series Data (Landlord Growth & Revenue over 12 months)
    const landlords = await this.prisma.landlord.findMany({
      where: { created_at: { gte: twelveMonthsAgo } },
      select: { created_at: true }
    });

    const invoices = await this.prisma.platformInvoice.findMany({
      where: { created_at: { gte: twelveMonthsAgo }, status: 'PAID' },
      select: { amount: true, created_at: true }
    });

    // Generate last 12 months buckets
    const monthlyTrends: { month: string; newLandlords: number; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = targetMonth.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      const targetMonthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      // Count landlords joined this month
      const landlordsJoined = landlords.filter(l => l.created_at >= targetMonth && l.created_at <= targetMonthEnd).length;
      
      // Sum revenue collected this month
      const revenueCollected = invoices
        .filter(inv => inv.created_at >= targetMonth && inv.created_at <= targetMonthEnd)
        .reduce((sum, inv) => sum + inv.amount, 0);

      monthlyTrends.push({
        month: monthLabel,
        newLandlords: landlordsJoined,
        revenue: revenueCollected
      });
    }

    return {
      paymentStats,
      maintenanceStats,
      monthlyTrends
    };
  }

  // --- RBAC & TEAM MANAGEMENT ---
  async getTeamAndRoles() {
    // Fetch all internal administrative roles (excluding external users)
    const roles = await this.prisma.role.findMany({
      where: { name: { notIn: ['LANDLORD', 'TENANT', 'MANAGER'] } },
      include: { 
        permissions: true,
        _count: { select: { users: true } }
      }
    });

    // Fetch all internal staff
    const staff = await this.prisma.user.findMany({
      where: { role: { name: { notIn: ['LANDLORD', 'TENANT', 'MANAGER'] } } },
      select: {
        id: true, email: true, first_name: true, last_name: true, 
        is_active: true, created_at: true,
        role: { select: { id: true, name: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    return { roles, staff };
  }

  async createCustomRole(dto: { name: string, permissions: { subject: string, action: string }[] }) {
    // 1. Create the Role
    const newRole = await this.prisma.role.create({
      data: { name: dto.name.toUpperCase().replace(/\s+/g, '_') }
    });

    // 2. Attach the Permissions
    if (dto.permissions && dto.permissions.length > 0) {
      await this.prisma.permission.createMany({
        data: dto.permissions.map(p => ({
          role_id: newRole.id,
          subject: p.subject,
          action: p.action
        }))
      });
    }
    return { message: 'Custom role created successfully', role: newRole };
  }

  async inviteStaffMember(dto: { email: string, role_id: string, first_name: string, last_name: string }) {
    // 1. Check if the email is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (existingUser) {
      throw new ConflictException('A user with this email address already exists in the system.');
    }

    // 2. Safely create the new user
    return this.prisma.user.create({
      data: {
        email: dto.email,
        first_name: dto.first_name,
        last_name: dto.last_name,
        password_hash: 'TEMPORARY_HASH_SETUP_REQUIRED', 
        role_id: dto.role_id,
        requires_password_change: true
      }
    });
  }

  // --- GLOBAL TEMPLATE LIBRARY ---
  async getGlobalTemplates() {
    return this.prisma.globalTemplate.findMany({
      orderBy: { updated_at: 'desc' }
    });
  }

  async saveGlobalTemplate(dto: { name: string, type: string, content: string }) {
    // Upsert ensures we update the existing template or create it if it's the first time
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