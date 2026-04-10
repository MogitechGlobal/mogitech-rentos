// apps/api/src/portal/portal.service.ts
/* eslint-disable */
import {
    Injectable,
    NotFoundException,
    BadRequestException
} from '@nestjs/common'; 
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PdfService } from '../mail/pdf.service';
import { PaymentsService } from '../payments/payments.service';
import * as bcrypt from 'bcrypt';
import { UpdateTenantProfileDto } from './dto/update-tenant-profile.dto';

@Injectable()
export class PortalService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private pdfService: PdfService,
        private paymentsService: PaymentsService 
    ) { }

    // --- PHONE VALIDATION ---
    private formatSafaricomNumber(phone: string): string {
        let formattedPhone = phone.replace(/\s+/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.substring(1)}`;
        if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);

        if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
            throw new BadRequestException('Invalid phone number length or format. Please enter a valid 10-digit number (e.g., 0712345678).');
        }

        const validPrefixes = ['70', '71', '72', '74', '75', '76', '79', '110', '111', '112', '113', '114', '115'];
        const isValidSafaricom = validPrefixes.some(p => formattedPhone.substring(3).startsWith(p));
        
        if (!isValidSafaricom) {
            throw new BadRequestException('STK Push is only supported on Safaricom numbers. Please provide a valid Safaricom phone number.');
        }

        return formattedPhone;
    }

    async getMyLease(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: {
                user: { select: { avatar_url: true } },
                unit: {
                    include: {
                        property: {
                            include: { landlord: true }
                        }
                    }
                },
                invoices: {
                    orderBy: { due_date: 'desc' },
                    include: { payments: true }
                }
            }
        });

        if (!tenant) {
            throw new NotFoundException('Tenant profile not found. Please contact your property manager.');
        }

        const outstandingBalance = tenant.invoices.reduce((sum, inv) => {
            if (inv.status === 'PAID') return sum;
            const paidAmount = inv.payments.reduce((pSum, p) => pSum + p.amount_paid, 0);
            return sum + (inv.amount - paidAmount);
        }, 0);

        return {
            ...tenant,
            outstandingBalance
        };
    }

    async processTenantPayment(userId: string, invoiceId: string, data: { amount_paid: number; payment_method: string; reference_number: string }) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { unit: { include: { property: { include: { landlord: true } } } } }
        });

        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { payments: true }
        });

        if (!invoice || invoice.tenant_id !== tenant.id) {
            throw new NotFoundException('Invoice not found.');
        }

        const amountPaid = Number(data.amount_paid);
        const previouslyPaid = (invoice as any).payments.reduce((sum: number, p: any) => sum + p.amount_paid, 0);
        const totalPaidSoFar = previouslyPaid + amountPaid;

        let newStatus = 'PARTIALLY_PAID';
        let overpayment = 0;

        if (totalPaidSoFar >= invoice.amount) {
            newStatus = 'PAID';
            overpayment = totalPaidSoFar - invoice.amount;
        }

        const payment = await this.prisma.payment.create({
            data: {
                invoice_id: invoice.id,
                amount_paid: amountPaid,
                payment_method: data.payment_method,
                reference_number: data.reference_number,
            }
        });

        await this.prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: newStatus }
        });

        if (overpayment > 0) {
            await this.prisma.tenant.update({
                where: { id: tenant.id },
                data: { credit_balance: { increment: overpayment } }
            });
        }

        try {
            const landlord = tenant.unit?.property?.landlord;
            const pdfBuffer = await this.pdfService.generatePaymentReceipt({
                id: payment.id,
                tenantName: `${tenant.first_name} ${tenant.last_name}`,
                propertyName: tenant.unit?.property?.name || 'MogiRentOS Property',
                unitNumber: tenant.unit?.unit_number || 'N/A',
                amount: amountPaid,
                method: data.payment_method,
                reference: data.reference_number || 'N/A',
                invoiceNumber: (invoice as any).invoice_number || invoice.id.substring(0, 8).toUpperCase(),
                companyName: landlord?.company_name || 'MogiRentOS',
                companyLogo: landlord?.company_logo || null,
            });

            this.mailService.sendPaymentReceipt(
                tenant.email,
                tenant.first_name,
                pdfBuffer,
                amountPaid
            ).catch(err => console.error('Email delivery failed:', err));

        } catch (pdfErr) {
            console.error('PDF Generation failed:', pdfErr);
        }

        return payment;
    }

    async initiateTenantStkPush(userId: string, invoiceId: string, phone: string) {
        // 1. Validate Tenant & Fetch Landlord relation through the Unit
        const tenant = await this.prisma.tenant.findUnique({ 
            where: { user_id: userId },
            include: {
                unit: {
                    include: {
                        property: {
                            include: { landlord: true }
                        }
                    }
                }
            }
        });
        
        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        // 2. Validate Invoice
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId, tenant_id: tenant.id },
            include: {
                payments: true 
            }
        });

        if (!invoice) throw new NotFoundException('Invoice not found or does not belong to you.');
        if (invoice.status === 'PAID') throw new BadRequestException('This invoice is already fully paid.');

        // 3. Validate Landlord Gateway Setup
        const landlord = tenant.unit?.property?.landlord;
        
        if (!landlord) {
             throw new BadRequestException('Property or Landlord details are missing for this unit.');
        }

        if (!landlord.gateway_type) {
             throw new BadRequestException('Your landlord has not configured a payment gateway yet. Please pay via Bank Transfer or Cash and record manually.');
        }

        const isKcbBuni = landlord.gateway_type === 'BANK_TRANSFER' && landlord.bank_name?.includes('KCB');

        if (landlord.gateway_type === 'MPESA' && !landlord.mpesa_shortcode) {
            throw new BadRequestException('Your landlord has not provided their M-Pesa Paybill number. Please contact management.');
        }

        if (landlord.gateway_type === 'BANK_TRANSFER' && !isKcbBuni) {
            throw new BadRequestException(`Your landlord's bank (${landlord.bank_name || 'their account'}) does not support automated STK Pushes yet. Please use the Manual Entry option.`);
        }

        // 4. Calculate Balance
        const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount_paid, 0);
        const balance = invoice.amount - amountPaid;

        if (balance <= 0) {
            throw new BadRequestException('No outstanding balance on this invoice.');
        }

        // 5. Format and Validate the Phone Number
        const formattedPhone = this.formatSafaricomNumber(phone);

        // 6. FIXED: Calling the correct Tenant Direct Settlement method!
        return this.paymentsService.initializeTenantRentPush(userId, invoice.id, formattedPhone);
    }
    

    async generateReceiptBuffer(userId: string, paymentId: string): Promise<Buffer> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { unit: { include: { property: { include: { landlord: true } } } } }
        });

        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { invoice: true }
        });

        if (!payment || !tenant || payment.invoice.tenant_id !== tenant.id) {
            throw new NotFoundException('Receipt not found or access denied.');
        }

        const landlord = tenant.unit?.property?.landlord; 

        return this.pdfService.generatePaymentReceipt({
            id: payment.id,
            tenantName: `${tenant.first_name} ${tenant.last_name}`,
            propertyName: tenant.unit?.property?.name || 'Property',
            unitNumber: tenant.unit?.unit_number || 'N/A',
            amount: payment.amount_paid,
            method: payment.payment_method,
            reference: payment.reference_number || 'N/A', 
            invoiceNumber: (payment.invoice as any).invoice_number || payment.invoice_id.substring(0, 8).toUpperCase(),
            companyName: landlord?.company_name || 'MogiRentOS',
            companyLogo: landlord?.company_logo || null,
        });
    }

    async getMyMaintenanceRequests(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { user_id: userId } });
        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        return this.prisma.maintenanceRequest.findMany({
            where: { tenant_id: tenant.id },
            orderBy: { created_at: 'desc' }
        });
    }

    async getMyMaintenanceHistory(userId: string) {
        return this.getMyMaintenanceRequests(userId);
    }

    async submitMaintenanceRequest(userId: string, data: { issue_type: string; urgency: string; description: string }) {
        const tenant = await this.prisma.tenant.findUnique({ where: { user_id: userId } });
        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        return this.prisma.maintenanceRequest.create({
            data: {
                tenant_id: tenant.id,
                unit_id: tenant.unit_id,
                issue_type: data.issue_type,
                urgency: data.urgency,
                description: data.description,
                status: 'PENDING'
            }
        });
    }

    async getTenantProfile(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            select: {
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                emergency_contact_name: true,
                emergency_contact_phone: true,
                user: { select: { avatar_url: true } } 
            }
        });
        if (!tenant) throw new NotFoundException('Profile not found');
        return tenant;
    }

    async updateProfile(userId: string, dto: UpdateTenantProfileDto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { user_id: userId } });

        if (!tenant) throw new NotFoundException('Tenant profile not found. Cannot update.');

        let newPasswordHash: string | undefined = undefined;
        if (dto.newPassword) {
            if (!dto.currentPassword) throw new BadRequestException('You must provide your current password to set a new one.');

            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user || !user.password_hash) throw new BadRequestException('Invalid user account.');

            const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password_hash);
            if (!isPasswordValid) throw new BadRequestException('The current password provided is incorrect.');

            newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
        }

        await this.prisma.$transaction(async (tx) => {
            if (dto.firstName || dto.lastName || newPasswordHash || dto.avatarBase64) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        ...(dto.firstName && { first_name: dto.firstName }),
                        ...(dto.lastName && { last_name: dto.lastName }),
                        ...(newPasswordHash && { password_hash: newPasswordHash }),
                        ...(dto.avatarBase64 && { avatar_url: dto.avatarBase64 }),
                    },
                });
            }

            if (dto.firstName || dto.lastName || dto.phone || dto.emergencyName || dto.emergencyPhone) {
                await tx.tenant.update({
                    where: { id: tenant.id },
                    data: {
                        ...(dto.firstName && { first_name: dto.firstName }),
                        ...(dto.lastName && { last_name: dto.lastName }),
                        ...(dto.phone && { phone: dto.phone }),
                        ...(dto.emergencyName !== undefined && { emergency_contact_name: dto.emergencyName }),
                        ...(dto.emergencyPhone !== undefined && { emergency_contact_phone: dto.emergencyPhone }),
                    },
                });
            }
        });

        return this.getTenantProfile(userId);
    }

    async getMyDocuments(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { unit: { include: { property: { include: { landlord: true } } } }, lease_document: true }
        });

        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        const documents: any[] = [];
        const companyName = tenant.unit?.property?.landlord?.company_name || 'Tech Global Ltd';
        const tenantName = `${tenant.first_name} ${tenant.last_name}`;

        // 1. DYNAMIC LEASE DOCUMENT
        if (tenant.lease_document) {
            documents.push({
                id: tenant.lease_document.id,
                title: tenant.lease_document.type === 'CUSTOM' ? 'Custom Uploaded Lease' : 'Official Lease Agreement',
                description: `Contract for ${tenant.unit?.property?.name || 'Property'} - Unit ${tenant.unit?.unit_number || 'N/A'}`,
                type: tenant.lease_document.type === 'CUSTOM' ? 'CUSTOM_PDF' : 'E-SIGN',
                file_url: tenant.lease_document.file_url,
                date: tenant.lease_document.created_at,
                size: 'Digital Contract',
                category: 'LEGAL',
                status: tenant.lease_document.status,
                content: tenant.lease_document.content,
                is_signed: tenant.lease_document.status === 'APPROVED',
                tenant_signature: tenant.lease_document.tenant_signature,
                landlord_signature: tenant.lease_document.landlord_signature,
                signed_at: tenant.lease_document.signed_at,
                approved_at: tenant.lease_document.approved_at,
                company_name: companyName,
                tenant_name: tenantName
            });
        }

        // 2. STANDARD BUILDING RULES 
        const rulesStatus = tenant.rules_landlord_signature ? 'APPROVED' : (tenant.rules_signature ? 'PENDING_APPROVAL' : 'PENDING_SIGNATURE');

        documents.push({
            id: 'doc_rules_1',
            title: 'Building Rules & Regulations',
            description: `Community guidelines for ${tenant.unit?.property?.name || 'the property'}.`,
            type: 'E-SIGN',
            date: tenant.created_at,
            size: 'Standard Policy',
            category: 'POLICY',
            status: rulesStatus, 
            is_signed: rulesStatus === 'APPROVED', 
            company_name: companyName,
            tenant_name: tenantName,
            tenant_signature: tenant.rules_signature,
            landlord_signature: tenant.rules_landlord_signature || 'Pending Approval', 
            signed_at: tenant.rules_signed_at,
            approved_at: tenant.rules_approved_at, 
            content: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151;">
                    <h2 style="color: #0f3e46; border-bottom: 2px solid #1f8898; padding-bottom: 10px;">BUILDING RULES & POLICIES</h2>
                    <h4 style="color: #1f8898;">1. General Conduct & Noise</h4>
                    <p>Tenants shall not make or allow any disturbing noises in the unit or on the premises. Quiet hours are strictly enforced between <strong>10:00 PM and 7:00 AM</strong> daily.</p>
                    <h4 style="color: #1f8898;">2. Refuse & Garbage</h4>
                    <p>All garbage must be properly bagged and disposed of in the designated community bins. Do not leave trash bags in hallways or common areas.</p>
                    <h4 style="color: #1f8898;">3. Alterations & Decor</h4>
                    <p>No structural alterations, painting, or heavy drilling is permitted without prior written consent from management.</p>
                    <h4 style="color: #1f8898;">4. Common Areas</h4>
                    <p>Corridors, walkways, and stairwells must remain clear of personal belongings, shoes, and bicycles at all times for fire safety.</p>
                </div>
            `
        });

        // 3. STANDARD INSPECTION REPORT 
        const inspectStatus = tenant.inspection_landlord_signature ? 'APPROVED' : (tenant.inspection_signature ? 'PENDING_APPROVAL' : 'PENDING_SIGNATURE');

        const exceptionsHtml = tenant.inspection_notes ? `
            <div style="margin-top: 25px; padding: 15px; background-color: #fffbeb; border-left: 4px solid #f59e0b;">
                <h4 style="color: #b45309; margin: 0 0 5px 0; font-size: 14px;">Tenant Exceptions / Notes:</h4>
                <p style="margin: 0; font-size: 13px; color: #92400e; font-style: italic;">"${tenant.inspection_notes}"</p>
            </div>
        ` : '';

        documents.push({
            id: 'doc_inspect_1',
            title: 'Move-in Inspection Report',
            description: 'Initial condition report for your unit.',
            type: 'E-SIGN', 
            date: tenant.lease_start,
            size: 'Standard Report',
            category: 'INSPECTION',
            status: inspectStatus,
            is_signed: inspectStatus === 'APPROVED',
            company_name: companyName,
            tenant_name: tenantName,
            tenant_signature: tenant.inspection_signature,
            landlord_signature: tenant.inspection_landlord_signature || 'Pending Approval',
            signed_at: tenant.inspection_signed_at,
            approved_at: tenant.inspection_approved_at,
            content: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151;">
                    <h2 style="color: #0f3e46; border-bottom: 2px solid #1f8898; padding-bottom: 10px;">MOVE-IN INSPECTION REPORT</h2>
                    <p><strong>Unit:</strong> ${tenant.unit?.unit_number} &nbsp; | &nbsp; <strong>Date Inspected:</strong> ${new Date(tenant.lease_start).toLocaleDateString()}</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left;">
                        <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                            <th style="padding: 10px;">Area / Item</th>
                            <th style="padding: 10px;">Condition</th>
                            <th style="padding: 10px;">Notes</th>
                        </tr>
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">Living Area Walls & Floors</td>
                            <td style="padding: 10px; color: #047857; font-weight: bold;">Good / Clean</td>
                            <td style="padding: 10px;">Freshly painted</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">Kitchen Fixtures & Plumbing</td>
                            <td style="padding: 10px; color: #047857; font-weight: bold;">Working</td>
                            <td style="padding: 10px;">No leaks detected</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">Bathroom Tiles & Fittings</td>
                            <td style="padding: 10px; color: #047857; font-weight: bold;">Good</td>
                            <td style="padding: 10px;">Standard wear</td>
                        </tr>
                    </table>
                    ${exceptionsHtml}
                    <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">* This serves as the baseline condition for assessing any damages upon move-out.</p>
                </div>
            `
        });

        return documents;
    }

    // --- UNIVERSAL E-SIGN ENGINE ---
    async signDocument(userId: string, docId: string, signature: string, notes?: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { lease_document: true }
        });

        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        // 1. Sign Building Rules
        if (docId === 'doc_rules_1') {
            return this.prisma.tenant.update({
                where: { id: tenant.id },
                data: { rules_signature: signature, rules_signed_at: new Date() }
            });
        }
        
        // 2. Sign Inspection Report (WITH NOTES)
        if (docId === 'doc_inspect_1') {
            return this.prisma.tenant.update({
                where: { id: tenant.id },
                data: { 
                    inspection_signature: signature, 
                    inspection_signed_at: new Date(),
                    inspection_notes: notes || null
                }
            });
        }

        // 3. Sign Official Lease
        if (tenant.lease_document && tenant.lease_document.id === docId) {
            return this.prisma.leaseDocument.update({
                where: { id: tenant.lease_document.id },
                data: {
                    tenant_signature: signature,
                    signed_at: new Date(),
                    status: 'PENDING_APPROVAL' 
                }
            });
        }

        throw new BadRequestException('Invalid document ID provided for signing.');
    }

    async getMyAnnouncements(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { unit: { include: { property: true } } }
        });

        if (!tenant || !tenant.unit) {
            throw new NotFoundException('Tenant profile or associated property not found.');
        }

        // 1. Fetch Local Property Announcements
        const localAnnouncements = await this.prisma.announcement.findMany({
            where: { property_id: tenant.unit.property_id },
            orderBy: { created_at: 'desc' }
        });

        // 2. Fetch Global System Announcements (Targeted at ALL or TENANTS)
        const systemAnnouncements = await this.prisma.globalAnnouncement.findMany({
            where: { target_audience: { in: ['ALL', 'TENANTS'] } },
            orderBy: { created_at: 'desc' }
        });

        // 3. Unify the Data Structure
        const formattedLocal = localAnnouncements.map(a => ({
            id: a.id,
            title: a.title,
            message: a.message,
            type: a.type,
            created_at: a.created_at,
            source: 'PROPERTY',
            source_name: tenant.unit?.property?.name || 'Property Management'
        }));

        const formattedSystem = systemAnnouncements.map(a => ({
            id: a.id,
            title: a.title,
            message: a.content, // Map 'content' to 'message' for the frontend
            type: a.is_urgent ? 'EMERGENCY' : 'INFO', 
            created_at: a.created_at,
            source: 'SYSTEM',
            source_name: 'MogiRentOS System Admin'
        }));

        // 4. Merge and sort by newest first
        return [...formattedLocal, ...formattedSystem].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    async getMyUtilities(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { unit: true }
        });

        if (!tenant || !tenant.unit_id) {
            throw new NotFoundException('Tenant profile or associated unit not found.');
        }

        const readings = await this.prisma.meterReading.findMany({
            where: { unit_id: tenant.unit_id },
            orderBy: { created_at: 'asc' } 
        });

        const buildUtilityData = (type: string, defaultPrice: number) => {
            const typeReadings = readings.filter(r => r.utilityType === type);
            const history: any[] = [];

            for (let i = 0; i < typeReadings.length; i++) {
                const current = typeReadings[i];
                const previous = i > 0 ? typeReadings[i - 1].reading : 0;
                const consumption = Math.max(0, current.reading - previous);

                history.push({
                    month: new Date(current.created_at).toLocaleString('default', { month: 'short' }),
                    consumption,
                    amount: consumption * defaultPrice,
                    reading: current.reading,
                    created_at: current.created_at
                });
            }

            if (typeReadings.length === 0) {
                return {
                    current_reading: 0, previous_reading: 0, consumption: 0,
                    unit_price: defaultPrice, total_bill: 0, last_updated: new Date().toISOString(),
                    history: []
                };
            }

            const latest = typeReadings[typeReadings.length - 1];
            const prev = typeReadings.length > 1 ? typeReadings[typeReadings.length - 2].reading : 0;
            const consumption = Math.max(0, latest.reading - prev);

            return {
                current_reading: latest.reading,
                previous_reading: prev,
                consumption,
                unit_price: defaultPrice,
                total_bill: consumption * defaultPrice,
                last_updated: latest.created_at,
                history
            };
        };

        return {
            water: buildUtilityData('water', 150),
            electricity: buildUtilityData('electricity', 25)
        };
    }

    async submitNoticeToVacate(userId: string, data: { moveOutDate: string; reason: string }) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { unit: { include: { property: true } } }
        });

        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        const moveOutDate = new Date(data.moveOutDate);
        const today = new Date();
        const daysNotice = Math.ceil((moveOutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysNotice < 30) {
            throw new BadRequestException('A minimum of 30 days notice is required by your lease agreement.');
        }

        return {
            status: 'success',
            message: `Your notice to vacate on ${moveOutDate.toDateString()} has been formally recorded.`,
            move_out_date: moveOutDate,
            days_notice_given: daysNotice,
            reason: data.reason
        };
    }

    async getMyGatePasses(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { unit: { include: { property: true } } }
        });

        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        return [
            {
                id: 'pass_1',
                visitor_name: 'Mogitech Global',
                type: 'GUEST',
                pin: '482091',
                status: 'ACTIVE',
                expected_arrival: new Date(Date.now() + 86400000).toISOString(), 
                created_at: new Date().toISOString(),
            },
            {
                id: 'pass_2',
                visitor_name: 'Jumia Delivery',
                type: 'DELIVERY',
                pin: '193847',
                status: 'USED',
                expected_arrival: new Date(Date.now() - 86400000).toISOString(), 
                created_at: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: 'pass_3',
                visitor_name: 'Safaricom Internet Tech',
                type: 'SERVICE',
                pin: '572910',
                status: 'EXPIRED',
                expected_arrival: new Date(Date.now() - 86400000 * 5).toISOString(),
                created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            }
        ];
    }

    async createGatePass(userId: string, data: { visitorName: string; type: string; expectedArrival: string }) {
        const tenant = await this.prisma.tenant.findUnique({ where: { user_id: userId } });
        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        const pin = Math.floor(100000 + Math.random() * 900000).toString();

        return {
            id: `pass_${Math.random().toString(36).substr(2, 9)}`,
            visitor_name: data.visitorName,
            type: data.type,
            pin: pin,
            status: 'ACTIVE',
            expected_arrival: new Date(data.expectedArrival).toISOString(),
            created_at: new Date().toISOString(),
        };
    }

    // --- NEW: RATE MAINTENANCE REQUEST ---
    async rateMaintenanceRequest(userId: string, requestId: string, data: { rating: number; feedback?: string }) {
        const tenant = await this.prisma.tenant.findUnique({ where: { user_id: userId } });
        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        const request = await this.prisma.maintenanceRequest.findUnique({ where: { id: requestId } });

        if (!request || request.tenant_id !== tenant.id) {
            throw new NotFoundException('Maintenance request not found.');
        }

        if (request.status !== 'RESOLVED') {
            throw new BadRequestException('You can only rate maintenance requests that have been resolved.');
        }

        if (request.rating) {
            throw new BadRequestException('This request has already been rated.');
        }

        return this.prisma.maintenanceRequest.update({
            where: { id: requestId },
            data: {
                rating: data.rating,
                feedback: data.feedback || null
            }
        });
    }
}