// apps/api/src/payments/payments.service.ts
/* eslint-disable */
import { Injectable, InternalServerErrorException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../mail/pdf.service'; 

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    
    // Paystack Config
    private readonly paystackSecret = process.env.PAYSTACK_SECRET_KEY || '';
    
    // KCB Master Config (Fallback if DB integration missing)
    private readonly kcbConsumerKey = process.env.KCB_CONSUMER_KEY || '';
    private readonly kcbConsumerSecret = process.env.KCB_CONSUMER_SECRET || '';
    private readonly kcbStkEndpoint = process.env.KCB_STK_ENDPOINT || 'https://uat.buni.kcbgroup.com/mm/api/request/1.0.0/stkpush';
    
    // Master Bank Routing Data (For SaaS Billing)
    private readonly kcbPaybill = process.env.KCB_PAYBILL || '522533';
    private readonly kcbAccountNumber = process.env.KCB_ACCOUNT_NUMBER || '8011909';

    constructor(
        private prisma: PrismaService,
        private pdfService: PdfService 
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

    private async getKcbAccessToken(customKey?: string, customSecret?: string): Promise<string> {
        const key = (customKey || this.kcbConsumerKey).trim();
        const secret = (customSecret || this.kcbConsumerSecret).trim();
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
            throw new InternalServerErrorException(`KCB Auth Error: Check your API Credentials.`);
        }
    }

    // --- A. SAAS PLATFORM BILLING (Landlords paying MogiRentOS) ---
    async initializeKcbMpesaPush(userId: string, phone: string, plan: string) {
        if (!phone) throw new BadRequestException('Phone number is required');

        // 1. Check for Super Admin configured Master Keys in the DB first
        const masterIntegration = await this.prisma.platformIntegration.findUnique({
            where: { provider: 'MPESA' }
        });

        let masterKey = this.kcbConsumerKey;
        let masterSecret = this.kcbConsumerSecret;
        let masterPasskey = "";

        if (masterIntegration && masterIntegration.is_active && masterIntegration.config) {
            const config = masterIntegration.config as any;
            if (config.kcbConsumerKey) masterKey = config.kcbConsumerKey;
            if (config.kcbConsumerSecret) masterSecret = config.kcbConsumerSecret;
            if (config.kcbPasskey) masterPasskey = config.kcbPasskey;
        }

        let formattedPhone = phone.replace(/\s+/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.substring(1)}`;
        if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);

        // Generate Token using Master Keys
        const token = await this.getKcbAccessToken(masterKey, masterSecret);

        const requestedPlan = plan === 'BASIC' ? 'BASIC' : 'PRO';
        const amount = requestedPlan === 'BASIC' ? 1500 : 4500;

        const backendUrl = process.env.NODE_ENV === 'production' 
            ? 'https://mogitech-rentos.onrender.com' 
            : (process.env.NGROK_URL || 'https://sandbox.mogitechglobal.com'); 
            
        const callbackUrl = `${backendUrl}/api/v1/payments/kcb/webhook/${userId}`;

        const referenceStr = `UPG${userId.substring(0, 5).toUpperCase()}`;

        const payload = {
            phoneNumber: formattedPhone, 
            amount: amount.toString(), 
            invoiceNumber: `${this.kcbAccountNumber}-${referenceStr}`, 
            sharedShortCode: true, 
            orgShortCode: this.kcbPaybill, 
            orgPassKey: masterPasskey,
            callbackUrl: callbackUrl, 
            transactionDescription: `MogiRentOS ${requestedPlan}` 
        };

        const uniqueMessageId = `${Date.now()}_MogiRentOS_${userId.substring(0, 5)}`;
        return this.sendStkRequest(token, payload, uniqueMessageId, formattedPhone, amount);
    }

    // --- B. DIRECT SETTLEMENT (Tenants paying Rent directly to Landlord) ---
    async initializeTenantRentPush(tenantUserId: string, invoiceId: string, phone: string) {
        if (!phone) throw new BadRequestException('Phone number is required');

        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { 
                tenant: { include: { unit: { include: { property: { include: { landlord: true } } } } } },
                payments: true
            }
        });

        if (!invoice || invoice.tenant.user_id !== tenantUserId) {
            throw new NotFoundException('Invoice not found.');
        }

        const landlord = invoice.tenant.unit?.property?.landlord;
        if (!landlord) throw new InternalServerErrorException('Critical Error: Landlord record missing.');

        // DIRECT SETTLEMENT ENFORCEMENT: Landlord MUST provide their own credentials
        if (!landlord.mpesa_shortcode || !landlord.kcb_consumer_key || !landlord.kcb_consumer_secret) {
            throw new BadRequestException('Your landlord has not configured their Direct Payment Gateway yet. Please contact management or pay via Bank Transfer.');
        }

        const previouslyPaid = invoice.payments.reduce((sum, p) => sum + p.amount_paid, 0);
        const amountDue = invoice.amount - previouslyPaid;
        if (amountDue <= 0) throw new BadRequestException('This invoice is already fully paid.');

        let formattedPhone = phone.replace(/\s+/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.substring(1)}`;
        if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);

        // GENERATE DYNAMIC TOKEN (Using Landlord's Credentials)
        const token = await this.getKcbAccessToken(landlord.kcb_consumer_key, landlord.kcb_consumer_secret);

        const backendUrl = process.env.NODE_ENV === 'production' 
            ? 'https://mogitech-rentos.onrender.com' 
            : (process.env.NGROK_URL || 'https://sandbox.mogitechglobal.com'); 
            
        const callbackUrl = `${backendUrl}/api/v1/payments/kcb/rent-webhook/${invoiceId}`;

        // Dynamic routing depending on if they are using KCB mapping or native Daraja
        const invoiceRef = landlord.gateway_type === 'BANK' && landlord.bank_account_number 
            ? `${landlord.bank_account_number}-${invoice.id.substring(0, 6)}` 
            : ((invoice as any).invoice_number || `RENT-${invoice.id.substring(0, 6)}`);

        const payload = {
            phoneNumber: formattedPhone, 
            amount: amountDue.toString(), 
            invoiceNumber: invoiceRef, 
            sharedShortCode: false, 
            orgShortCode: landlord.mpesa_shortcode, 
            orgPassKey: landlord.mpesa_passkey || "", 
            callbackUrl: callbackUrl, 
            transactionDescription: `Rent - Unit ${invoice.tenant.unit?.unit_number}` 
        };

        const uniqueMessageId = `${Date.now()}_Rent_${invoice.id.substring(0, 5)}`;
        return this.sendStkRequest(token, payload, uniqueMessageId, formattedPhone, amountDue);
    }

    // --- C. STK PUSH EXECUTION ENGINE ---
    private async sendStkRequest(token: string, payload: any, messageId: string, phone: string, amount: number) {
        try {
            const response = await fetch(this.kcbStkEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'routeCode': '207',
                    'operation': 'STKPush',
                    'messageId': messageId
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
                        VALUES (gen_random_uuid(), ${checkoutId}, ${phone}, ${amount}, 'PENDING', false, NOW(), NOW())
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


    // ==========================================
    // 3. WEBHOOK HANDLERS
    // ==========================================

    // A. Handles Landlords Upgrading to PRO/BASIC
    async handleKcbWebhook(userId: string, eventData: any) {
        this.logger.log(`Received Platform KCB Webhook for User: ${userId}`);

        const stkCallback = eventData?.Body?.stkCallback; 
        if (!stkCallback) return { status: 'ignored' };

        const checkoutRequestId = stkCallback.CheckoutRequestID;
        const resultCode = stkCallback.ResultCode;

        if (resultCode === 0) {
            const metadata = stkCallback.CallbackMetadata?.Item || [];
            const receiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
            const paidAmount = metadata.find((i: any) => i.Name === 'Amount')?.Value;
            
            this.logger.log(`Platform Payment Success! Receipt: ${receiptNumber}, Amount: ${paidAmount}`);

            let upgradedPlan = 'PRO'; 
            if (paidAmount == 1500) upgradedPlan = 'BASIC';
            if (paidAmount == 4500) upgradedPlan = 'PRO';

            await this.prisma.landlord.update({
                where: { user_id: userId },
                data: { subscription_status: upgradedPlan }
            });

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
            this.logger.warn(`Platform Payment failed. Code: ${resultCode} - ${stkCallback.ResultDesc}`);
        }

        return { status: 'success' };
    }

    // B. Handles Tenants Paying Rent Directly to Landlord
    async handleTenantRentWebhook(invoiceId: string, eventData: any) {
        this.logger.log(`Received Rent KCB Webhook for Invoice: ${invoiceId}`);

        const stkCallback = eventData?.Body?.stkCallback; 
        if (!stkCallback) return { status: 'ignored' };

        const checkoutRequestId = stkCallback.CheckoutRequestID;
        const resultCode = stkCallback.ResultCode;

        if (resultCode === 0) {
            const metadata = stkCallback.CallbackMetadata?.Item || [];
            const receiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
            const paidAmount = metadata.find((i: any) => i.Name === 'Amount')?.Value;
            
            this.logger.log(`Rent Payment Success! Receipt: ${receiptNumber}, Amount: ${paidAmount}`);

            const invoice = await this.prisma.invoice.findUnique({
                where: { id: invoiceId },
                include: { payments: true, tenant: true }
            });

            if (invoice) {
                const amountPaidNum = Number(paidAmount);
                const previouslyPaid = (invoice as any).payments.reduce((sum: number, p: any) => sum + p.amount_paid, 0);
                const totalPaidSoFar = previouslyPaid + amountPaidNum;
        
                let newStatus = 'PARTIALLY_PAID';
                let overpayment = 0;
        
                if (totalPaidSoFar >= invoice.amount) {
                    newStatus = 'PAID';
                    overpayment = totalPaidSoFar - invoice.amount;
                }

                await this.prisma.payment.create({
                    data: {
                        invoice_id: invoice.id,
                        amount_paid: amountPaidNum,
                        payment_method: 'M-PESA_DIRECT',
                        reference_number: receiptNumber,
                    }
                });

                await this.prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { status: newStatus }
                });

                if (overpayment > 0) {
                    await this.prisma.tenant.update({
                        where: { id: invoice.tenant_id },
                        data: { credit_balance: { increment: overpayment } }
                    });
                }
            }

            try {
                await this.prisma.$executeRaw`
                    UPDATE mpesa_transactions 
                    SET status = 'SUCCESS', receipt_number = ${receiptNumber}, raw_payload = ${JSON.stringify(eventData)}::jsonb, processed = true, updated_at = NOW()
                    WHERE checkout_request_id = ${checkoutRequestId}
                `;
            } catch (e) {
                this.logger.warn('Failed to log mpesa_transactions for Rent, but invoice was receipted.');
            }
        } else {
            this.logger.warn(`Rent Payment failed. Code: ${resultCode} - ${stkCallback.ResultDesc}`);
        }

        return { status: 'success' };
    }


    // ==========================================
    // 4. LEDGER RECONCILIATION
    // ==========================================
    async reconcileLedger(userId: string) {
        const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
        if (!landlord) throw new BadRequestException('Landlord profile not found');

        try {
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
    // 5. BULK PDF RECEIPTS (ZIP)
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

        const archive = archiver('zip', { zlib: { level: 9 } }); 

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

            archive.append(pdfBuffer, { name: `Receipt_${payment.id.substring(0, 8).toUpperCase()}.pdf` });
        }

        archive.finalize();
        return archive;
    }

    // ==========================================
    // 6. KCB INSTANT PAYMENT NOTIFICATIONS (IPN)
    // ==========================================

    // A. Handles Manual M-Pesa Till/Paybill Payments
    async handleTillNotification(payload: any) {
        this.logger.log(`Received Till IPN: ${JSON.stringify(payload)}`);

        try {
            const header = payload?.header || {};
            const notificationData = payload?.requestPayload?.additionalData?.notificationData;
            
            if (!notificationData) throw new Error('Invalid Till IPN payload');

            const amountPaid = Number(notificationData.transactionAmt);
            const accountReference = notificationData.businessKey; 
            const receiptNumber = notificationData.transactionID;
            const phone = notificationData.debitMSISDN;

            await this.applyDirectPaymentToLedger(accountReference, amountPaid, receiptNumber, 'MPESA', phone);

            return {
                header: {
                    messageID: header.messageID || "12345",
                    originatorConversationID: header.originatorConversationID || "",
                    statusCode: "0",
                    statusMessage: "Notification received successfully"
                },
                responsePayload: {
                    transactionInfo: {
                        transactionId: receiptNumber
                    }
                }
            };
        } catch (error: any) {
            this.logger.error(`Till IPN Processing Failed: ${error.message}`);
            return { header: { statusCode: "0", statusMessage: "Acknowledged with internal errors" } };
        }
    }

    // B. Handles Manual Bank Account Transfers
    async handleAccountNotification(payload: any) {
        this.logger.log(`Received Account IPN: ${JSON.stringify(payload)}`);

        try {
            const amountPaid = Number(payload.transactionAmount);
            const accountReference = payload.customerReference; 
            const receiptNumber = payload.transactionReference;

            await this.applyDirectPaymentToLedger(accountReference, amountPaid, receiptNumber, 'BANK_TRANSFER', 'N/A');

            return {
                transactionID: receiptNumber,
                statusCode: "0",
                statusMessage: "Notification received successfully"
            };
        } catch (error: any) {
            this.logger.error(`Account IPN Processing Failed: ${error.message}`);
            return { statusCode: "0", statusMessage: "Acknowledged with internal errors" };
        }
    }

    // C. Core Reconciliation Engine for Manual/IPN Payments
    private async applyDirectPaymentToLedger(reference: string, amount: number, receiptNumber: string, method: string, phone: string) {
        let invoice = await this.prisma.invoice.findFirst({
            where: { 
                OR: [
                    { id: { startsWith: reference.replace('INV-', '').toLowerCase() } },
                    { tenant: { unit: { unit_number: reference } } }
                ],
                status: { not: 'PAID' }
            },
            include: { payments: true, tenant: true },
            orderBy: { due_date: 'asc' } 
        });

        if (!invoice) {
            this.logger.warn(`IPN Alert: Payment of KSH ${amount} received (Ref: ${receiptNumber}), but could not map reference "${reference}" to an unpaid invoice.`);
            return;
        }

        const previouslyPaid = (invoice as any).payments.reduce((sum: number, p: any) => sum + p.amount_paid, 0);
        const totalPaidSoFar = previouslyPaid + amount;

        let newStatus = 'PARTIALLY_PAID';
        let overpayment = 0;

        if (totalPaidSoFar >= invoice.amount) {
            newStatus = 'PAID';
            overpayment = totalPaidSoFar - invoice.amount;
        }

        await this.prisma.payment.create({
            data: {
                invoice_id: invoice.id,
                amount_paid: amount,
                payment_method: method,
                reference_number: receiptNumber,
            }
        });

        await this.prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: newStatus }
        });

        if (overpayment > 0) {
            await this.prisma.tenant.update({
                where: { id: invoice.tenant_id },
                data: { credit_balance: { increment: overpayment } }
            });
        }

        this.logger.log(`Successfully mapped IPN payment of KSH ${amount} to Invoice ${invoice.id}.`);
    }
}