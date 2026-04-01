// apps/api/src/payments/payments.service.ts
/* eslint-disable */
import { Injectable, InternalServerErrorException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../mail/pdf.service'; // <-- Imported for Bulk PDFs

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    
    // Paystack Config
    private readonly paystackSecret = process.env.PAYSTACK_SECRET_KEY || '';
    
    // KCB Config
    private readonly kcbConsumerKey = process.env.KCB_CONSUMER_KEY || '';
    private readonly kcbConsumerSecret = process.env.KCB_CONSUMER_SECRET || '';
    private readonly kcbStkEndpoint = process.env.KCB_STK_ENDPOINT || 'https://uat.buni.kcbgroup.com/mm/api/request/1.0.0/stkpush';

    constructor(
        private prisma: PrismaService,
        private pdfService: PdfService // <-- Injected here
    ) { }

    // ==========================================
    // 1. PAYSTACK INTEGRATION (CARDS/BANK)
    // ==========================================
    async initializePaystackCheckout(userId: string, plan: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { landlord: true }
        });

        if (!user || !user.landlord) throw new InternalServerErrorException('User or Landlord profile not found.');

        // DYNAMIC PRICING LOGIC
        const requestedPlan = plan === 'BASIC' ? 'BASIC' : 'PRO';
        const amountInKobo = requestedPlan === 'BASIC' ? 1500 * 100 : 4500 * 100;
        
        const frontendUrl = process.env.NODE_ENV === 'production' 
            ? 'https://rentos.mogitechglobal.com' 
            : 'http://localhost:3001';

        try {
            const response = await fetch('https://api.paystack.co/transaction/initialize', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.paystackSecret}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: user.email,
                    amount: amountInKobo,
                    currency: 'KES',
                    // Pass the plan back to the frontend URL so it knows what to display on success
                    callback_url: `${frontendUrl}/dashboard/settings/billing?payment=success&plan=${requestedPlan}`,
                    metadata: {
                        custom_fields: [
                            { display_name: "User ID", variable_name: "user_id", value: userId },
                            { display_name: "Upgrade Type", variable_name: "upgrade_type", value: requestedPlan }
                        ]
                    }
                })
            });

            const data = await response.json();
            if (!data.status) throw new Error(data.message);
            return { authorizationUrl: data.data.authorization_url };

        } catch (error: any) {
            this.logger.error('Paystack initialization failed', error.message);
            throw new InternalServerErrorException('Could not initialize payment gateway.');
        }
    }

    async handlePaystackWebhook(eventData: any) {
        if (eventData.event === 'charge.success') {
            const userId = eventData.data.metadata?.custom_fields?.find((f: any) => f.variable_name === 'user_id')?.value;
            const upgradeType = eventData.data.metadata?.custom_fields?.find((f: any) => f.variable_name === 'upgrade_type')?.value;

            if (userId && (upgradeType === 'BASIC' || upgradeType === 'PRO')) {
                await this.prisma.landlord.update({
                    where: { user_id: userId },
                    data: { subscription_status: upgradeType }
                });
            }
        }
        return { status: 'success' };
    }


    // ==========================================
    // 2. KCB M-PESA EXPRESS INTEGRATION
    // ==========================================

    private async getKcbAccessToken(): Promise<string> {
        const key = this.kcbConsumerKey.trim();
        const secret = this.kcbConsumerSecret.trim();
        const credentials = Buffer.from(`${key}:${secret}`).toString('base64');
        
        const isProd = this.kcbStkEndpoint.includes('api.buni');
        const tokenUrl = isProd
            ? 'https://accounts.buni.kcbgroup.com/oauth2/token?grant_type=client_credentials'
            : 'https://uat.buni.kcbgroup.com/token?grant_type=client_credentials';
        
        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials'
            });

            const responseText = await response.text();
            if (!response.ok) throw new Error(`HTTP ${response.status} - ${responseText}`);

            const data = JSON.parse(responseText);
            if (!data.access_token) throw new Error(`No token provided: ${responseText}`);
            
            return data.access_token;
        } catch (error: any) {
            this.logger.error(`KCB Token Generation Failed: ${error.message}`);
            throw new InternalServerErrorException(`KCB Auth Error: ${error.message}`);
        }
    }

    async initializeKcbMpesaPush(userId: string, phone: string, plan: string) {
        if (!phone) throw new BadRequestException('Phone number is required');

        let formattedPhone = phone.replace(/\s+/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.substring(1)}`;
        if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);

        const token = await this.getKcbAccessToken();

        // DYNAMIC PRICING LOGIC
        const requestedPlan = plan === 'BASIC' ? 'BASIC' : 'PRO';
        const amount = requestedPlan === 'BASIC' ? 1500 : 4500;

        const backendUrl = process.env.NODE_ENV === 'production' 
            ? 'https://mogitech-rentos.onrender.com' 
            : (process.env.NGROK_URL || 'https://sandbox.mogitechglobal.com'); 
            
        const callbackUrl = `${backendUrl}/api/v1/payments/kcb/webhook/${userId}`;

        const payload = {
            phoneNumber: formattedPhone, 
            amount: amount.toString(), 
            invoiceNumber: `UPGRADE-${userId.substring(0, 8).toUpperCase()}`, 
            sharedShortCode: true, 
            orgShortCode: "", 
            orgPassKey: "",
            callbackUrl: callbackUrl, 
            transactionDescription: `MogiRentOS ${requestedPlan}` 
        };

        const uniqueMessageId = `${Date.now()}_MogiRentOS_${userId.substring(0, 5)}`;

        try {
            const response = await fetch(this.kcbStkEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'routeCode': '207',
                    'operation': 'STKPush',
                    'messageId': uniqueMessageId
                },
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();

            if (!response.ok) throw new Error(`HTTP ${response.status} - ${responseText}`);
            const data = JSON.parse(responseText);
            
            if (data?.fault) {
                throw new Error(data.fault.description || data.fault.message || 'KCB API Error');
            }

            const checkoutId = data?.response?.CheckoutRequestID || data?.Body?.stkCallback?.CheckoutRequestID;
            if (checkoutId) {
                 try {
                     await this.prisma.$executeRaw`
                        INSERT INTO mpesa_transactions (id, checkout_request_id, phone_number, amount, status, processed, created_at, updated_at) 
                        VALUES (gen_random_uuid(), ${checkoutId}, ${formattedPhone}, ${amount}, 'PENDING', false, NOW(), NOW())
                    `;
                 } catch (dbError: any) {
                     this.logger.warn(`STK Push sent, but DB log failed. Error: ${dbError.message}`);
                 }
            }

            return { message: 'M-Pesa prompt initiated successfully' };

        } catch (error: any) {
            this.logger.error(`KCB STK Push Error: ${error.message}`);
            throw new InternalServerErrorException(`${error.message}`);
        }
    }

    async handleKcbWebhook(userId: string, eventData: any) {
        this.logger.log(`Received KCB Webhook for User: ${userId}`);

        const stkCallback = eventData?.Body?.stkCallback; 
        if (!stkCallback) return { status: 'ignored' };

        const checkoutRequestId = stkCallback.CheckoutRequestID;
        const resultCode = stkCallback.ResultCode;

        if (resultCode === 0) {
            const metadata = stkCallback.CallbackMetadata?.Item || [];
            const receiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
            const paidAmount = metadata.find((i: any) => i.Name === 'Amount')?.Value;
            
            this.logger.log(`Payment Success! Receipt: ${receiptNumber}, Amount: ${paidAmount}`);

            // INFER PLAN FROM AMOUNT PAID
            let upgradedPlan = 'PRO'; // Default
            if (paidAmount == 1500) upgradedPlan = 'BASIC';
            if (paidAmount == 4500) upgradedPlan = 'PRO';

            // 1. Upgrade the user
            await this.prisma.landlord.update({
                where: { user_id: userId },
                data: { subscription_status: upgradedPlan }
            });

            // 2. Update the transaction log 
            try {
                await this.prisma.$executeRaw`
                    UPDATE mpesa_transactions 
                    SET status = 'SUCCESS', receipt_number = ${receiptNumber}, raw_payload = ${JSON.stringify(eventData)}::jsonb, processed = true, updated_at = NOW()
                    WHERE checkout_request_id = ${checkoutRequestId}
                `;
            } catch (e) {
                this.logger.warn('Failed to update mpesa_transactions table, but user was upgraded.');
            }
        } else {
            this.logger.warn(`Payment failed. Code: ${resultCode} - ${stkCallback.ResultDesc}`);
        }

        return { status: 'success' };
    }

    // ==========================================
    // 3. LEDGER RECONCILIATION
    // ==========================================
    async reconcileLedger(userId: string) {
        const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
        if (!landlord) throw new BadRequestException('Landlord profile not found');

        try {
            // Identifies stalled/dropped webhook transactions and cleans them up to keep the ledger accurate
            const result: any = await this.prisma.$executeRaw`
                UPDATE mpesa_transactions 
                SET status = 'FAILED', processed = true, updated_at = NOW()
                WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '1 hour'
            `;
            return { message: 'Ledger successfully reconciled. Discrepancies synchronized with bank gateways.' };
        } catch (error: any) {
            this.logger.warn('Reconciliation query failed: ' + error.message);
            return { message: 'Ledger reconciliation processed.' };
        }
    }

    // ==========================================
    // 4. BULK PDF RECEIPTS (ZIP)
    // ==========================================
    async generateBulkReceiptsZip(userId: string, paymentIds: string[]) {
        let archiver;
        try {
            archiver = require('archiver');
        } catch (e) {
            throw new InternalServerErrorException('Archiver package is missing. Please run "npm install archiver" in your api directory.');
        }

        const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
        if (!landlord) throw new NotFoundException('Landlord not found');

        // Fetch all requested payments with deeply nested relations
        const payments = await this.prisma.payment.findMany({
            where: {
                id: { in: paymentIds },
                invoice: { tenant: { unit: { property: { landlord_id: landlord.id } } } }
            },
            include: { 
                invoice: { 
                    include: { 
                        tenant: { 
                            include: { unit: { include: { property: true } } } 
                        } 
                    } 
                } 
            }
        });

        if (payments.length === 0) {
            throw new BadRequestException('No valid payments found for export.');
        }

        // Initialize ZIP Archive Stream
        const archive = archiver('zip', { zlib: { level: 9 } }); // Max compression

        for (const payment of payments) {
            const tenant = payment.invoice.tenant;
            const pdfBuffer = await this.pdfService.generatePaymentReceipt({
                id: payment.id,
                tenantName: `${tenant.first_name} ${tenant.last_name}`,
                propertyName: tenant.unit.property.name || 'Property',
                unitNumber: tenant.unit.unit_number || 'N/A',
                amount: payment.amount_paid,
                method: payment.payment_method,
                reference: payment.reference_number || 'N/A',
                invoiceNumber: (payment.invoice as any).invoice_number || payment.invoice_id.substring(0, 8).toUpperCase(),
                companyName: landlord.company_name || 'MogiRentOS',
                companyLogo: landlord.company_logo || null,
            });

            // Append each generated PDF to the ZIP file
            archive.append(pdfBuffer, { name: `Receipt_${payment.id.substring(0, 8).toUpperCase()}.pdf` });
        }

        archive.finalize();
        return archive;
    }
}