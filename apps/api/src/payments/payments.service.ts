// apps/api/src/payments/payments.service.ts
/* eslint-disable */
import { Injectable, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    
    // Paystack Config
    private readonly paystackSecret = process.env.PAYSTACK_SECRET_KEY || '';
    
    // KCB Config
    private readonly kcbConsumerKey = process.env.KCB_CONSUMER_KEY || '';
    private readonly kcbConsumerSecret = process.env.KCB_CONSUMER_SECRET || '';
    private readonly kcbStkEndpoint = process.env.KCB_STK_ENDPOINT || 'https://api.buni.kcbgroup.com/mpesa/express/v1/processrequest';

    constructor(private prisma: PrismaService) { }

    // ==========================================
    // 1. PAYSTACK INTEGRATION (CARDS/BANK)
    // ==========================================
    async initializePaystackCheckout(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { landlord: true }
        });

        if (!user || !user.landlord) throw new InternalServerErrorException('User or Landlord profile not found.');

        const amountInKobo = 1 * 100; // KSH 4,500
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
                    callback_url: `${frontendUrl}/dashboard/settings/billing?payment=success`,
                    metadata: {
                        custom_fields: [
                            { display_name: "User ID", variable_name: "user_id", value: userId },
                            { display_name: "Upgrade Type", variable_name: "upgrade_type", value: "PREMIUM_PLAN" }
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

            if (userId && upgradeType === 'PREMIUM_PLAN') {
                await this.prisma.landlord.update({
                    where: { user_id: userId },
                    data: { subscription_status: 'PREMIUM' }
                });
            }
        }
        return { status: 'success' };
    }


    // ==========================================
    // 2. KCB M-PESA EXPRESS INTEGRATION
    // ==========================================

    private async getKcbAccessToken(): Promise<string> {
        const credentials = Buffer.from(`${this.kcbConsumerKey}:${this.kcbConsumerSecret}`).toString('base64');
        
        // FIX: Explicitly appending the grant_type to the URL as per KCB spec
        const tokenUrl = process.env.NODE_ENV === 'production'
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

            const data = await response.json();
            if (!data.access_token) throw new Error(data.error_description || 'Failed to generate KCB access token');
            
            return data.access_token;
        } catch (error: any) {
            this.logger.error('KCB Token Error:', error.message);
            throw new InternalServerErrorException('Payment gateway authentication failed.');
        }
    }

    async initializeKcbMpesaPush(userId: string, phone: string) {
        if (!phone) throw new BadRequestException('Phone number is required');

        // Format phone to 2547XXXXXXXX
        let formattedPhone = phone.replace(/\s+/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.substring(1)}`;
        if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);

        const token = await this.getKcbAccessToken();

        // FIX: Provided a safe fallback URL for local testing so KCB doesn't reject the payload format
        const backendUrl = process.env.NODE_ENV === 'production' 
            ? 'https://mogitech-rentos.onrender.com' 
            : (process.env.NGROK_URL || 'https://sandbox.mogitechglobal.com'); 
            
        const callbackUrl = `${backendUrl}/api/v1/payments/kcb/webhook/${userId}`;

        const payload = {
            phoneNumber: formattedPhone, 
            amount: "4500", 
            invoiceNumber: `UPGRADE-${userId.substring(0, 8).toUpperCase()}`, 
            sharedShortCode: true, 
            orgShortCode: "", 
            orgPassKey: "",
            callbackUrl: callbackUrl, 
            transactionDescription: "MogiRentOS Premium" 
        };

        try {
            const response = await fetch(this.kcbStkEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            // Check for KCB-specific faults (e.g., Invalid credentials, Insufficient balance)
            if (data?.fault) {
                throw new Error(data.fault.description || data.fault.message || 'KCB API Error');
            }

            // FIX: Wrapped the raw SQL in a try/catch so a database typo doesn't crash the payment process!
            const checkoutId = data?.response?.CheckoutRequestID || data?.Body?.stkCallback?.CheckoutRequestID;
            if (checkoutId) {
                 try {
                     await this.prisma.$executeRaw`
                        INSERT INTO mpesa_transactions (id, checkout_request_id, phone_number, amount, status, processed, created_at, updated_at) 
                        VALUES (gen_random_uuid(), ${checkoutId}, ${formattedPhone}, 4500, 'PENDING', false, NOW(), NOW())
                    `;
                 } catch (dbError: any) {
                     this.logger.warn(`STK Push sent, but DB log failed. Ensure table name matches Prisma schema exactly. Error: ${dbError.message}`);
                 }
            }

            return { message: 'M-Pesa prompt initiated successfully' };

        } catch (error: any) {
            this.logger.error('KCB STK Push Error:', error.message);
            throw new InternalServerErrorException(error.message || 'Failed to send M-Pesa prompt.');
        }
    }

    async handleKcbWebhook(userId: string, eventData: any) {
        this.logger.log(`Received KCB Webhook for User: ${userId}`);

        const stkCallback = eventData?.Body?.stkCallback; 
        if (!stkCallback) return { status: 'ignored' };

        const checkoutRequestId = stkCallback.CheckoutRequestID;
        const resultCode = stkCallback.ResultCode; // 0 means success

        if (resultCode === 0) {
            const metadata = stkCallback.CallbackMetadata?.Item || [];
            const receiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
            
            this.logger.log(`Payment Success! Receipt: ${receiptNumber}`);

            // 1. Upgrade the user
            await this.prisma.landlord.update({
                where: { user_id: userId },
                data: { subscription_status: 'PREMIUM' }
            });

            // 2. Update the transaction log (Wrapped in try/catch for safety)
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
}