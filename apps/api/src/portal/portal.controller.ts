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
@Roles('TENANT') // Only users with the TENANT role can access these routes
export class PortalController {
    constructor(private readonly portalService: PortalService) { }

    @Get('my-lease')
    async getMyLease(@Request() req: any) {
        // req.user.sub contains the UUID from the users table
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
        @Res() res: any // Use @Res to stream the file directly
    ) {
        const userId = req.user.sub;
        const pdfBuffer = await this.portalService.generateReceiptBuffer(userId, paymentId);

        res.set({
            'Content-Type': 'application/json', // Actually application/pdf
            'Content-Disposition': `attachment; filename=Receipt_${paymentId}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }

    // Add to PortalController class
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

    // Add inside PortalController class
    @Get('documents')
    async getMyDocuments(@Request() req: any) {
        return this.portalService.getMyDocuments(req.user.sub);
    }

    // Add inside PortalController class
    @Get('announcements')
    async getAnnouncements(@Request() req: any) {
        return this.portalService.getMyAnnouncements(req.user.sub);
    }

    // Add inside PortalController class
    @Get('utilities')
    async getUtilities(@Request() req: any) {
        return this.portalService.getMyUtilities(req.user.sub);
    }

    // Add inside PortalController class
    @Post('lease/notice')
    async submitNoticeToVacate(
        @Request() req: any, 
        @Body() body: { moveOutDate: string; reason: string }
    ) {
        return this.portalService.submitNoticeToVacate(req.user.sub, body);
    }

    // Add inside PortalController class
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
    
}