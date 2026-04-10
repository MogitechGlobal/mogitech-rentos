// apps/api/src/portal/portal.controller.ts
/* eslint-disable */
import { Controller, Get, Post, Body, Param, UseGuards, Request, Res, Put } from '@nestjs/common';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateTenantProfileDto } from './dto/update-tenant-profile.dto';

@Controller('api/v1/portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TENANT') 
export class PortalController {
    constructor(private readonly portalService: PortalService) { }

    @Get('my-lease')
    async getMyLease(@Request() req: any) {
        return this.portalService.getMyLease(req.user.sub);
    }

    @Post('invoices/:id/pay')
    async payInvoice(
        @Request() req: any,
        @Param('id') invoiceId: string,
        @Body() body: { amount_paid: number; payment_method: string; reference_number: string }
    ) {
        return this.portalService.processTenantPayment(req.user.sub, invoiceId, body);
    }

    // --- NEW: TENANT DIRECT SETTLEMENT STK PUSH ---
    @Post('invoices/:id/mpesa-push')
    async initiateRentMpesaPush(
        @Request() req: any,
        @Param('id') invoiceId: string,
        @Body() body: { phone: string }
    ) {
        // FIXED: Call initiateTenantStkPush instead of initiateRentPush
        return this.portalService.initiateTenantStkPush(req.user.sub, invoiceId, body.phone);
    }

    @Get('maintenance')
    async getMaintenanceRequests(@Request() req: any) {
        return this.portalService.getMyMaintenanceRequests(req.user.sub);
    }

    @Post('maintenance')
    async submitMaintenanceRequest(@Request() req: any, @Body() body: any) {
        return this.portalService.submitMaintenanceRequest(req.user.sub, body);
    }

    @Get('payments/:id/download')
    async downloadReceipt(
        @Param('id') paymentId: string,
        @Request() req: any,
        @Res() res: any 
    ) {
        const userId = req.user.sub;
        const pdfBuffer = await this.portalService.generateReceiptBuffer(userId, paymentId);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Receipt_${paymentId}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }

    @Get('profile')
    async getProfile(@Request() req: any) {
        return this.portalService.getTenantProfile(req.user.sub);
    }

    @Put('profile')
    async updateProfile(
        @Request() req: any,
        @Body() updateDto: UpdateTenantProfileDto
    ) {
        return this.portalService.updateProfile(req.user.sub, updateDto);
    }

    @Get('documents')
    async getMyDocuments(@Request() req: any) {
        return this.portalService.getMyDocuments(req.user.sub);
    }

    @Get('announcements')
    async getAnnouncements(@Request() req: any) {
        return this.portalService.getMyAnnouncements(req.user.sub);
    }

    @Get('utilities')
    async getUtilities(@Request() req: any) {
        return this.portalService.getMyUtilities(req.user.sub);
    }

    @Post('lease/notice')
    async submitNoticeToVacate(
        @Request() req: any, 
        @Body() body: { moveOutDate: string; reason: string }
    ) {
        return this.portalService.submitNoticeToVacate(req.user.sub, body);
    }

    @Get('gate-passes')
    async getGatePasses(@Request() req: any) {
        return this.portalService.getMyGatePasses(req.user.sub);
    }

    @Post('gate-passes')
    async createGatePass(
        @Request() req: any,
        @Body() body: { visitorName: string; type: string; expectedArrival: string }
    ) {
        return this.portalService.createGatePass(req.user.sub, body);
    }

    // --- DYNAMIC E-SIGNATURE ROUTE WITH EXCEPTIONS/NOTES ---
    @Post('documents/:id/sign')
    async signDocument(
        @Request() req: any, 
        @Param('id') docId: string, 
        @Body() body: { signature: string; notes?: string }
    ) {
        return this.portalService.signDocument(req.user.sub, docId, body.signature, body.notes);
    }

    // --- NEW: RATE MAINTENANCE REQUEST ---
    @Post('maintenance/:id/rate')
    async rateMaintenanceRequest(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: { rating: number; feedback?: string }
    ) {
        return this.portalService.rateMaintenanceRequest(req.user.sub, id, body);
    }
}