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

        //const amountInKobo = 4500 * 100; // KSH 4,500
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
        
        // Using the exact production OAuth2 endpoint from your KCB Developer Portal screenshot
        const tokenUrl = process.env.NODE_ENV === 'production'
            ? 'https://accounts.buni.kcbgroup.com/oauth2/token'
            : 'https://uat.buni.kcbgroup.com/token';
        
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

        // KCB requires a secure callback URL. We inject the userId into the URL so we know who paid!
        const backendUrl = process.env.NODE_ENV === 'production' 
            ? 'https://mogitech-rentos.onrender.com' 
            : process.env.NGROK_URL; // Local testing requires Ngrok
            
        const callbackUrl = `${backendUrl}/api/v1/payments/kcb/webhook/${userId}`;

        // Payload strictly adheres to KCB Buni Specs (Page 2)
        const payload = {
            phoneNumber: formattedPhone, 
            amount: "4500", // Must be a string per KCB spec
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
            
            // Log the attempt to the database tracking the CheckoutRequestID
            if (data?.response?.CheckoutRequestID || data?.Body?.stkCallback?.CheckoutRequestID) {
                 const checkoutId = data?.response?.CheckoutRequestID || data?.Body?.stkCallback?.CheckoutRequestID;
                 await this.prisma.$executeRaw`
                    INSERT INTO mpesa_transactions (id, checkout_request_id, phone_number, amount, status, processed, created_at, updated_at) 
                    VALUES (gen_random_uuid(), ${checkoutId}, ${formattedPhone}, 4500, 'PENDING', false, NOW(), NOW())
                `;
            } else if (data?.fault) {
                // Handle KCB specific errors
                throw new Error(data.fault.description || 'KCB API Error');
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
            // Extract the metadata array (Page 4 of Specs)
            const metadata = stkCallback.CallbackMetadata?.Item || [];
            const receiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
            
            this.logger.log(`Payment Success! Receipt: ${receiptNumber}`);

            // 1. Upgrade the user
            await this.prisma.landlord.update({
                where: { user_id: userId },
                data: { subscription_status: 'PREMIUM' }
            });

            // 2. Update the transaction log
            await this.prisma.$executeRaw`
                UPDATE mpesa_transactions 
                SET status = 'SUCCESS', receipt_number = ${receiptNumber}, raw_payload = ${JSON.stringify(eventData)}::jsonb, processed = true, updated_at = NOW()
                WHERE checkout_request_id = ${checkoutRequestId}
            `;
        } else {
            // Payment failed or was cancelled by user (e.g. Code 1032, 2001)
            this.logger.warn(`Payment failed. Code: ${resultCode} - ${stkCallback.ResultDesc}`);
            await this.prisma.$executeRaw`
                UPDATE mpesa_transactions 
                SET status = 'FAILED', raw_payload = ${JSON.stringify(eventData)}::jsonb, processed = true, updated_at = NOW()
                WHERE checkout_request_id = ${checkoutRequestId}
            `;
        }

        return { status: 'success' };
    }
}