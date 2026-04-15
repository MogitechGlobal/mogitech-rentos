// apps/api/src/admin/admin.controller.ts
import { Controller, Get, Post, Body, Param, Query, UseGuards, Res, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Response } from 'express'; 
import { BillingCronService } from './billing-cron.service';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') 
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly billingCronService: BillingCronService
  ) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('page') page: string,
    @Query('search') search: string
  ) {
    return this.adminService.getAuditLogs(Number(page) || 1, search);
  }

  @Get('landlords')
  async getLandlords(
    @Query('page') page: string,
    @Query('search') search: string
  ) {
    return this.adminService.getAllLandlords(Number(page) || 1, search);
  }

  @Post('users/:id/toggle-status')
  async toggleStatus(
    @Request() req: any,
    @Param('id') userId: string,
    @Body() body: { is_active: boolean }
  ) {
    return this.adminService.toggleUserStatus(req.user.sub, req.user.email, userId, body.is_active);
  }

  @Get('transactions')
  async getTransactions(@Query('page') page: string) {
    return this.adminService.getSystemTransactions(Number(page) || 1);
  }

  @Get('integrations')
  async getIntegrations() {
    return this.adminService.getGlobalIntegrations();
  }

  @Post('integrations')
  async saveIntegration(
    @Request() req: any,
    @Body() body: { provider: string; config: any }
  ) {
    return this.adminService.saveGlobalIntegration(req.user.sub, req.user.email, body.provider, body.config);
  }

  @Post('users/:id/subscription')
  async updateSubscription(
    @Request() req: any,
    @Param('id') userId: string,
    @Body() body: { plan: string }
  ) {
    return this.adminService.updateSubscription(req.user.sub, req.user.email, userId, body.plan);
  }

  @Post('users/:id/impersonate')
  async impersonateUser(
    @Request() req: any,
    @Param('id') targetUserId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const data = await this.adminService.impersonateUser(req.user.sub, req.user.email, targetUserId);
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', data.access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax', 
        path: '/',
        maxAge: 60 * 60 * 1000 
    });

    return data;
  }

  @Get('announcements')
  async getAnnouncements() {
    return this.adminService.getAllAnnouncements();
  }

  @Post('announcements')
  async createAnnouncement(
    @Request() req: any,
    @Body() body: any // <-- Changed to 'any' to accept channels and targeting fields
  ) {
    return this.adminService.createAnnouncement(req.user.sub, req.user.email, body);
  }

  @Post('announcements/:id/delete') 
  async deleteAnnouncement(
    @Request() req: any,
    @Param('id') id: string
  ) {
    return this.adminService.deleteAnnouncement(req.user.sub, req.user.email, id);
  }

  // --- SUPPORT HELPDESK ENDPOINTS ---
  @Get('support-tickets')
  async getSupportTickets(
    @Query('page') page: string,
    @Query('search') search: string
  ) {
    return this.adminService.getAllSupportTickets(Number(page) || 1, search);
  }

  @Post('support-tickets/:id/status')
  async updateTicketStatus(
    @Request() req: any,
    @Param('id') ticketId: string,
    @Body() body: { status: string }
  ) {
    return this.adminService.updateSupportTicketStatus(req.user.sub, req.user.email, ticketId, body.status);
  }

  // --- MASTER SYSTEM SETTINGS ENDPOINTS ---
  @Get('settings')
  async getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  @Post('settings')
  async updateSystemSettings(
    @Request() req: any,
    @Body() body: any
  ) {
    return this.adminService.updateSystemSettings(req.user.sub, req.user.email, body);
  }

  // --- SAAS REVENUE ENDPOINTS ---
  @Get('billing')
  async getPlatformBilling() {
    return this.adminService.getPlatformBilling();
  }

  @Post('billing/sync-prices')
  async syncPlatformPrices() {
    await this.billingCronService.generateMonthlySaaSInvoices();
    return { message: 'All unpaid invoices successfully synchronized to exact 5-Tier prices.' };
  }

  @Post('billing/:id/mark-paid')
  async markPlatformInvoicePaid(
    @Request() req: any, 
    @Param('id') id: string,
    @Body() body: { payment_method: string; reference_number: string } // <-- Accept Payload
  ) {
    return this.adminService.markPlatformInvoicePaid(req.user.sub, req.user.email, id, body);
  }

  @Post('billing/:id/remind')
  async remindPlatformInvoice(@Request() req: any, @Param('id') id: string) {
    return this.adminService.remindPlatformInvoice(req.user.sub, req.user.email, id);
  }

  @Post('billing/suspend/:landlordId')
  async suspendOverdueLandlord(@Request() req: any, @Param('landlordId') landlordId: string) {
    return this.adminService.suspendOverdueLandlord(req.user.sub, req.user.email, landlordId);
  }

  // --- SYSTEM HEALTH ENDPOINTS ---
  @Get('system-health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  // --- MANUAL CRON JOB TRIGGER ---
  @Post('billing/seed')
  async triggerSaaSBillingManually() {
    await this.billingCronService.generateMonthlySaaSInvoices();
    return { message: 'SaaS Billing job triggered successfully' };
  }

  // --- ADD THIS NEW ROUTE ---
  @Post('billing/remind-all')
  async remindAllPlatformInvoices(@Request() req: any) {
    return this.adminService.remindAllPlatformInvoices(req.user.sub, req.user.email);
  }

  // --- ADVANCED ANALYTICS ---
  @Get('analytics')
  async getAdvancedAnalytics() {
    return this.adminService.getAdvancedAnalytics();
  }

  // --- RBAC & TEAM ENDPOINTS ---
  @Get('team')
  async getTeamAndRoles() {
    return this.adminService.getTeamAndRoles();
  }

  // SECURITY FIX: Injects Admin identity for Audit Logging
  @Post('team/roles')
  async createCustomRole(@Request() req: any, @Body() body: any) {
    return this.adminService.createCustomRole(req.user.sub, req.user.email, body);
  }

  // SECURITY FIX: Injects Admin identity for Audit Logging
  @Post('team/invite')
  async inviteStaffMember(@Request() req: any, @Body() body: any) {
    return this.adminService.inviteStaffMember(req.user.sub, req.user.email, body);
  }

  // NEW: Securely resend expired invitations
  @Post('team/invite/:id/resend')
  async resendInvite(@Request() req: any, @Param('id') userId: string) {
    return this.adminService.resendInvite(req.user.sub, req.user.email, userId);
  }

  // --- SECURITY FIX: ACCOUNT SETUP ENDPOINT ---
  // Overrides the standard 'ADMIN' RolesGuard to allow newly invited custom roles
  // (like 'FINANCE' or 'SUPPORT') to access their own password setup flow.
  @Post('team/setup-password')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER', 'SUPPORT', 'FINANCE', 'LANDLORD', 'TENANT') 
  async setupNewPassword(
    @Request() req: any,
    @Body() body: { newPassword: string }
  ) {
    return this.adminService.setupNewPassword(req.user.sub, body.newPassword);
  }

  // --- TEMPLATE LIBRARY ENDPOINTS ---
  @Get('templates')
  @Roles('ADMIN', 'SUPER_ADMIN', 'LANDLORD') 
  async getGlobalTemplates() {
    return this.adminService.getGlobalTemplates();
  }

  @Post('templates')
  async saveGlobalTemplate(@Body() body: any) {
    return this.adminService.saveGlobalTemplate(body);
  }
}