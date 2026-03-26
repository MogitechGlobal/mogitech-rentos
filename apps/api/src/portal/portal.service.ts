// apps/api/src/portal/portal.service.ts
/* eslint-disable */
import {
    Injectable,
    NotFoundException,
    BadRequestException // Ensure this is included
} from '@nestjs/common'; import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PdfService } from '../mail/pdf.service';
import * as bcrypt from 'bcrypt';
import { UpdateTenantProfileDto } from './dto/update-tenant-profile.dto';


@Injectable()
export class PortalService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private pdfService: PdfService
    ) { }

    async getMyLease(userId: string) {
        // Deep relational query to pull everything the tenant needs to see
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

        // Calculate live outstanding balance across all invoices
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
            include: { unit: { include: { property: { include: { landlord: true } } } } } // <-- Updated to fetch landlord
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

        // Check if they overpaid!
        if (totalPaidSoFar >= invoice.amount) {
            newStatus = 'PAID';
            overpayment = totalPaidSoFar - invoice.amount;
        }

        // 1. Save payment record
        const payment = await this.prisma.payment.create({
            data: {
                invoice_id: invoice.id,
                amount_paid: amountPaid,
                payment_method: data.payment_method,
                reference_number: data.reference_number,
            }
        });

        // 2. Update invoice status
        await this.prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: newStatus }
        });

        // 3. SECURE THE OVERPAYMENT: Add extra funds to the tenant's wallet
        if (overpayment > 0) {
            await this.prisma.tenant.update({
                where: { id: tenant.id },
                data: { credit_balance: { increment: overpayment } }
            });
        }

        // 4. Generate PDF and Email Receipt
        try {
            const landlord = tenant.unit?.property?.landlord; // <-- Extract landlord

            const pdfBuffer = await this.pdfService.generatePaymentReceipt({
                id: payment.id,
                tenantName: `${tenant.first_name} ${tenant.last_name}`,
                propertyName: tenant.unit?.property?.name || 'MogiRentOS Property',
                unitNumber: tenant.unit?.unit_number || 'N/A',
                amount: amountPaid,
                method: data.payment_method,
                reference: data.reference_number || 'N/A',
                invoiceNumber: (invoice as any).invoice_number || invoice.id.substring(0, 8).toUpperCase(),
                companyName: landlord?.company_name || 'MogiRentOS', // <-- Added
                companyLogo: landlord?.company_logo || null,         // <-- Added
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

    // apps/api/src/portal/portal.service.ts

    async generateReceiptBuffer(userId: string, paymentId: string): Promise<Buffer> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { unit: { include: { property: { include: { landlord: true } } } } } // <-- Updated
        });

        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { invoice: true }
        });

        if (!payment || !tenant || payment.invoice.tenant_id !== tenant.id) {
            throw new NotFoundException('Receipt not found or access denied.');
        }

        const landlord = tenant.unit?.property?.landlord; // <-- Extract landlord

        return this.pdfService.generatePaymentReceipt({
            id: payment.id,
            tenantName: `${tenant.first_name} ${tenant.last_name}`,
            propertyName: tenant.unit?.property?.name || 'Property',
            unitNumber: tenant.unit?.unit_number || 'N/A',
            amount: payment.amount_paid,
            method: payment.payment_method,
            reference: payment.reference_number || 'N/A', // Fallback for safety
            invoiceNumber: (payment.invoice as any).invoice_number || payment.invoice_id.substring(0, 8).toUpperCase(),
            companyName: landlord?.company_name || 'MogiRentOS', // <-- Added
            companyLogo: landlord?.company_logo || null,         // <-- Added
        });
    }

    // Fetch all maintenance tickets for the logged-in tenant
    async getMyMaintenanceRequests(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { user_id: userId } });
        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        return this.prisma.maintenanceRequest.findMany({
            where: { tenant_id: tenant.id },
            orderBy: { created_at: 'desc' }
        });
    }

    // Support for the History list UI
    async getMyMaintenanceHistory(userId: string) {
        return this.getMyMaintenanceRequests(userId);
    }

    // Create a new maintenance ticket
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

    // Add to PortalService class
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
                user: {
                    select: { avatar_url: true } // Fetch the avatar from the auth user table
                }

            }

        });
        if (!tenant) throw new NotFoundException('Profile not found');
        return tenant;
    }

    // async getTenantProfile(userId: string) {
    //     const tenant = await this.prisma.tenant.findUnique({
    //         where: { user_id: userId },
    //         include: {
    //             user: {
    //                 select: { avatar_url: true } // Fetch the avatar from the auth user table
    //             }
    //         }
    //     });

    //     if (!tenant) throw new NotFoundException('Profile not found');
    //     return tenant;
    // }

    async updateProfile(userId: string, dto: UpdateTenantProfileDto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { user_id: userId } });

        if (!tenant) {
            throw new NotFoundException('Tenant profile not found. Cannot update.');
        }

        // --- HANDLE PASSWORD CHANGE ---
        let newPasswordHash: string | undefined = undefined;
        if (dto.newPassword) {
            if (!dto.currentPassword) {
                throw new BadRequestException('You must provide your current password to set a new one.');
            }

            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user || !user.password_hash) {
                throw new BadRequestException('Invalid user account.');
            }

            const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password_hash);
            if (!isPasswordValid) {
                throw new BadRequestException('The current password provided is incorrect.');
            }

            newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
        }

        // Safely update both User (Auth) and Tenant (Domain) tables
        await this.prisma.$transaction(async (tx) => {
            // 1. Update the User table (Auth, Avatar, Passwords)
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

            // 2. Update the Tenant table (Contact info & Emergency details)
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

    // Add inside PortalService class
    async getMyDocuments(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { unit: { include: { property: true } } }
        });

        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        // For now, we generate contextual documents based on the tenant's actual lease.
        // Later, this will fetch from a 'documents' Prisma table.
        return [
            {
                id: 'doc_lease_1',
                title: 'Signed Lease Agreement',
                description: `Official lease agreement for Unit ${tenant.unit?.unit_number || 'N/A'}.`,
                type: 'PDF',
                date: tenant.lease_start,
                size: '2.4 MB',
                category: 'LEGAL',
                is_signed: true
            },
            {
                id: 'doc_rules_1',
                title: 'Building Rules & Regulations',
                description: `Community guidelines and policies for ${tenant.unit?.property?.name || 'the property'}.`,
                type: 'PDF',
                date: tenant.created_at, 
                size: '1.1 MB',
                category: 'POLICY',
                is_signed: false
            },
            {
                id: 'doc_inspect_1',
                title: 'Move-in Inspection Report',
                description: 'Initial condition report including unit photos.',
                type: 'PDF',
                date: tenant.lease_start,
                size: '5.8 MB',
                category: 'INSPECTION',
                is_signed: true
            }
        ];
    }

    async getMyAnnouncements(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { unit: { include: { property: true } } }
        });

        if (!tenant || !tenant.unit) {
            throw new NotFoundException('Tenant profile or associated property not found.');
        }

        // Fetch ONLY the official announcements posted for this tenant's property
        return this.prisma.announcement.findMany({
            where: { property_id: tenant.unit.property_id },
            orderBy: { created_at: 'desc' }
        });
    }

    // --- PORTAL.SERVICE.TS ---

    async getMyUtilities(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { unit: true }
        });

        if (!tenant || !tenant.unit_id) {
            throw new NotFoundException('Tenant profile or associated unit not found.');
        }

        // Fetch all historical meter readings for this unit
        const readings = await this.prisma.meterReading.findMany({
            where: { unit_id: tenant.unit_id },
            orderBy: { created_at: 'asc' } // Oldest to newest
        });

        // Helper function to build contextual data from raw DB readings
        const buildUtilityData = (type: string, defaultPrice: number) => {
            const typeReadings = readings.filter(r => r.utilityType === type);
            const history: any[] = [];
            
            for (let i = 0; i < typeReadings.length; i++) {
                const current = typeReadings[i];
                // Calculate consumption against the previous reading
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

            // Return empty skeleton if no readings exist yet
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

        // In production, you would save this to a dedicated `NoticeToVacate` Prisma table.
        // You would also trigger this.mailService.sendNoticeAlertToLandlord(...) here.
        
        return {
            status: 'success',
            message: `Your notice to vacate on ${moveOutDate.toDateString()} has been formally recorded.`,
            move_out_date: moveOutDate,
            days_notice_given: daysNotice,
            reason: data.reason
        };
    }

    // Add inside PortalService class
    async getMyGatePasses(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { user_id: userId },
            include: { unit: { include: { property: true } } }
        });

        if (!tenant) throw new NotFoundException('Tenant profile not found.');

        // Returning contextual mock data for the UI.
        // Later, this will be fetched from a 'GatePass' table.
        return [
            {
                id: 'pass_1',
                visitor_name: 'John Doe',
                type: 'GUEST',
                pin: '482091',
                status: 'ACTIVE',
                expected_arrival: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                created_at: new Date().toISOString(),
            },
            {
                id: 'pass_2',
                visitor_name: 'Jumia Delivery',
                type: 'DELIVERY',
                pin: '193847',
                status: 'USED',
                expected_arrival: new Date(Date.now() - 86400000).toISOString(), // Yesterday
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

        // Generate a random 6-digit PIN
        const pin = Math.floor(100000 + Math.random() * 900000).toString();

        // In production, save this to the database:
        /*
        return this.prisma.gatePass.create({
            data: {
                tenant_id: tenant.id,
                unit_id: tenant.unit_id,
                visitor_name: data.visitorName,
                type: data.type,
                expected_arrival: new Date(data.expectedArrival),
                pin: pin,
                status: 'ACTIVE'
            }
        });
        */

        // Simulated Response
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
}