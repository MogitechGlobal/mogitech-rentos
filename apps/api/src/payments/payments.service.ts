// apps/api/src/payments/payments.service.ts
/* eslint-disable */
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly paystackSecret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_your_key_here';

    constructor(private prisma: PrismaService) { }

    async initializePaystackCheckout(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { landlord: true }
        });

        if (!user || !user.landlord) {
            throw new InternalServerErrorException('User or Landlord profile not found.');
        }

        const amountInKobo = 4500 * 100; // Adjusted to match your KSH 4,500 Premium plan!

        // Determine the correct frontend URL based on the environment
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
                    // Dynamically inject the correct URL
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
                this.logger.log(`Upgrading User ${userId} to PREMIUM!`);

                // FIX: Use subscription_status to match your schema.prisma!
                await this.prisma.landlord.update({
                    where: { user_id: userId },
                    data: { subscription_status: 'PREMIUM' }
                });
            }
        }
        return { status: 'success' };
    }
}