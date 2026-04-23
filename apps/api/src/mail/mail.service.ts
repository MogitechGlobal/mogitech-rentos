// apps/api/src/mail/mail.service.ts
/* eslint-disable */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async sendTicketStatusUpdate(email: string, firstName: string, issue: string, newStatus: string) {
        const statusFormatted = newStatus.replace('_', ' ');

        // Choose a color based on the status
        const statusColor = newStatus === 'RESOLVED' ? '#16a34a' : newStatus === 'IN_PROGRESS' ? '#2563eb' : '#d97706';

        const mailOptions = {
            from: `"MogiRentOS Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Maintenance Update: Your request is ${statusFormatted}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #1f8898; margin: 0;">MogiRentOS</h2>
            <p style="color: #888; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Tenant Portal Alert</p>
          </div>
          
          <p style="color: #333; font-size: 16px;">Hello <strong>${firstName}</strong>,</p>
          <p style="color: #555; line-height: 1.5;">There has been an update to your recent maintenance request regarding your <strong>${issue}</strong> issue.</p>
          
          <div style="background-color: #f8fafb; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <span style="font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Current Status</span><br/>
            <span style="display: inline-block; margin-top: 8px; padding: 6px 16px; background-color: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}40; border-radius: 6px; font-weight: bold; text-transform: uppercase; font-size: 14px;">
              ${statusFormatted}
            </span>
          </div>
          
          <p style="color: #555; line-height: 1.5;">You can track the full progress or add comments by logging into your Tenant Portal.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #888; font-size: 12px; text-align: center;">Powered by Mogitech Global Ltd</p>
        </div>
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ [Mail Service] Notification sent to ${email} for status: ${newStatus}`);
        } catch (error) {
            console.error('❌ [Mail Service] Error sending email:', error);
        }
    }

    async sendPaymentReceipt(email: string, firstName: string, pdfBuffer: Buffer, amount: number) {
        await this.transporter.sendMail({
            from: `"MogiRentOS Payments" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Payment Received - Receipt for KES ${amount.toLocaleString()}`,
            html: `<p>Hello ${firstName},</p><p>Thank you for your payment. Please find your official receipt attached to this email.</p>`,
            attachments: [
                {
                    filename: `Receipt_${new Date().getTime()}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });
    }

    async sendInvoiceReminder(email: string, firstName: string, invoiceDescription: string, balance: number, dueDate: string, unitNumber: string, companyName: string) {
        const subject = `Payment Reminder: Outstanding Balance for ${invoiceDescription}`;

        const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1f8898; margin: 0; font-size: 24px; font-weight: 900;">${companyName}</h2>
          <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;">Payment Reminder</p>
        </div>
        
        <p style="font-size: 16px; color: #374151;">Dear <strong>${firstName}</strong>,</p>
        
        <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
          This is a friendly reminder regarding your outstanding balance for Unit <strong>${unitNumber}</strong>. 
          Please ensure payment is settled to avoid any late fees or service interruptions.
        </p>

        <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #e11d48; font-weight: bold; text-transform: uppercase;">Amount Due</p>
          <h1 style="margin: 5px 0; color: #be123c; font-size: 32px;">KSH ${balance.toLocaleString()}</h1>
          <p style="margin: 0; font-size: 13px; color: #9f1239;">Due Date: <strong>${dueDate}</strong></p>
        </div>

        <p style="font-size: 15px; color: #4b5563;">
          <strong>Invoice Details:</strong><br/>
          ${invoiceDescription}
        </p>

        <p style="font-size: 15px; color: #4b5563; margin-top: 30px;">
          You can easily settle this balance by logging into your tenant portal or paying via the authorized M-Pesa Paybill.
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
          <p>If you have already made this payment, please disregard this email.</p>
          <p>Powered by MogiRentOS</p>
        </div>
      </div>
    `;

        return this.transporter.sendMail({
            from: `"MogiRentOS Billing" <${process.env.SMTP_USER}>`,
            to: email,
            subject,
            html,
        });
    }

    async sendPasswordResetEmail(email: string, resetLink: string) {
        const subject = `Reset your MogiRentOS password`;

        const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #111827; margin: 0; font-size: 24px; font-weight: 900;">Mogi<span style="color: #1f8898;">RentOS</span></h2>
                <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;">Security Alert</p>
            </div>
            
            <p style="font-size: 16px; color: #374151;">Hello,</p>
            
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
                We received a request to reset the password for your MogiRentOS workspace. Click the secure button below to create a new password.
            </p>

            <div style="text-align: center; margin: 35px 0;">
                <a href="${resetLink}" style="display: inline-block; background-color: #1f8898; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; text-transform: uppercase; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(31, 136, 152, 0.2);">
                    Reset My Password
                </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                <strong>Security Note:</strong> This link will automatically expire in 15 minutes. If you did not request this password reset, please ignore this email or contact support immediately.
            </p>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
                <p>Powered by Mogitech Global Ltd</p>
            </div>
        </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"MogiRentOS Security" <${process.env.SMTP_USER}>`,
                to: email,
                subject,
                html,
            });
            console.log(`✅ [Mail Service] Password reset email sent to ${email}`);
        } catch (error) {
            console.error('❌ [Mail Service] Error sending password reset email:', error);
        }
    }

    async sendBroadcastEmail(email: string, firstName: string, subject: string, messageHtml: string, companyName: string, urgency: string = 'INFO') {
        const urgencyColor = urgency === 'EMERGENCY' ? '#e11d48' : urgency === 'WARNING' ? '#d97706' : '#1f8898';
        
        const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: ${urgencyColor}; margin: 0; font-size: 24px; font-weight: 900;">${companyName}</h2>
                <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;">Official Communication</p>
            </div>
            
            <p style="font-size: 16px; color: #374151;">Dear <strong>${firstName}</strong>,</p>
            
            <div style="font-size: 15px; color: #4b5563; line-height: 1.6; background-color: #f8fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 20px;">
                <h3 style="margin-top: 0; color: #111827; font-size: 18px;">${subject}</h3>
                ${messageHtml}
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
                <p>This is an official communication from ${companyName}. Please do not reply directly to this automated email.</p>
                <p>Powered by MogiRentOS</p>
            </div>
        </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"${companyName} via MogiRentOS" <${process.env.SMTP_USER}>`,
                to: email,
                subject,
                html,
            });
            console.log(`✅ [Mail Service] Broadcast sent to ${email}`);
        } catch (error) {
            console.error('❌ [Mail Service] Error sending broadcast email:', error);
        }
    }

    // --- NEW: SYSTEM MAINTENANCE MODE ALERTS ---
    async sendMaintenanceNotice(email: string, firstName: string, isStarting: boolean, maintenanceMessage: string) {
        // FIX: Removed Emojis from Subject Line. Spam filters often block automated emails with emojis.
        const subject = isStarting ? '[System Alert] Scheduled Maintenance Notice' : '[System Status] Maintenance Complete - Online';
        const title = isStarting ? 'Maintenance Mode Enabled' : 'Systems Fully Operational';
        const color = isStarting ? '#e11d48' : '#16a34a';

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: ${color}; margin: 0; font-size: 24px; font-weight: 900;">MogiRentOS</h2>
                <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">System Status Update</p>
            </div>
            
            <p style="color: #333; font-size: 16px;">Hello <strong>${firstName}</strong>,</p>
            
            <div style="background-color: ${isStarting ? '#fff1f2' : '#f0fdf4'}; border-left: 4px solid ${color}; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: ${color}; font-size: 16px;">${title}</h3>
                <p style="margin: 0; color: #555; line-height: 1.6;">
                    ${isStarting 
                        ? `The platform has been placed into maintenance mode and is temporarily unavailable. <br/><br/><strong>Message from System Admin:</strong><br/><em style="color: #111827;">"${maintenanceMessage}"</em>` 
                        : 'The scheduled maintenance has been completed successfully. All platform services are now fully restored and operational.'}
                </p>
            </div>
            
            ${!isStarting ? `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://rentos.mogitechglobal.com'}" style="background-color: #1f8898; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Access Your Dashboard</a>
            </div>
            ` : ''}

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
                <p>This is an automated system status alert. Please do not reply directly to this email.</p>
                <p>Powered by Mogitech Global Ltd</p>
            </div>
        </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"MogiRentOS Infrastructure" <${process.env.SMTP_USER}>`,
                to: email,
                subject,
                text: `MogiRentOS System Status Update: ${title}. ${isStarting ? maintenanceMessage : 'Systems are fully operational.'}`, // FIX: Plain text fallback lowers spam score
                html,
            });
            console.log(`✅ [Mail Service] Maintenance alert (${isStarting ? 'OFFLINE' : 'ONLINE'}) sent to ${email}`);
        } catch (error) {
            console.error(`❌ [Mail Service] Error sending maintenance notice to ${email}:`, error);
        }
    }

    // --- NEW: SAAS BILLING COMMUNICATIONS ---

    async sendSaaSInvoiceReminder(email: string, firstName: string, invoiceId: string, amount: number, dueDate: string, planName: string) {
        const shortId = `INV-${invoiceId.substring(0, 6).toUpperCase()}`;
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1f8898; margin: 0; font-size: 24px; font-weight: 900;">MogiRentOS</h2>
                <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Subscription Billing Notice</p>
            </div>
            
            <p style="font-size: 16px; color: #374151;">Hello <strong>${firstName}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">This is a friendly reminder that your MogiRentOS <strong>${planName}</strong> subscription invoice is currently due.</p>

            <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #e11d48; font-weight: bold; text-transform: uppercase;">Amount Due</p>
                <h1 style="margin: 5px 0; color: #be123c; font-size: 32px;">KSH ${amount.toLocaleString()}</h1>
                <p style="margin: 0; font-size: 13px; color: #9f1239;">Due Date: <strong>${dueDate}</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 11px; color: #9f1239; font-weight: bold;">Invoice Ref: ${shortId}</p>
            </div>

            <p style="font-size: 15px; color: #4b5563;">To avoid any interruption to your landlord portal and tenant services, please ensure this is settled promptly.</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
                <p>If you have already made this payment, please disregard this email.</p>
                <p>Powered by Mogitech Global Ltd</p>
            </div>
        </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"MogiRentOS Billing" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `Action Required: MogiRentOS Subscription Invoice Due`,
                html,
            });
        } catch (error) {
            console.error('❌ [Mail Service] Error sending SaaS reminder:', error);
        }
    }

    async sendSaaSPaymentReceipt(email: string, firstName: string, invoiceId: string, amount: number, planName: string, paymentMethod: string, referenceNumber: string) {
        const shortId = `REC-${invoiceId.substring(0, 6).toUpperCase()}`;
        
        // Format method nicely for the email
        const methodDisplay = paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : paymentMethod === 'MPESA' ? 'Safaricom M-Pesa' : 'Cash / Cheque';

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #16a34a; margin: 0; font-size: 24px; font-weight: 900;">Payment Successful</h2>
            </div>
            <p style="font-size: 16px; color: #374151;">Hello <strong>${firstName}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">We have successfully received your payment of <strong>KSH ${amount.toLocaleString()}</strong> for your MogiRentOS <strong>${planName}</strong> subscription.</p>
            
            <div style="background-color: #f8fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <table style="width: 100%; font-size: 14px; color: #374151;">
                    <tr><td style="padding-bottom: 12px; border-bottom: 1px solid #eee;"><strong>Receipt Ref:</strong></td><td style="text-align: right; padding-bottom: 12px; border-bottom: 1px solid #eee; font-weight: bold;">${shortId}</td></tr>
                    <tr><td style="padding: 12px 0; border-bottom: 1px solid #eee;"><strong>Payment Method:</strong></td><td style="text-align: right; padding: 12px 0; border-bottom: 1px solid #eee;">${methodDisplay}</td></tr>
                    <tr><td style="padding-top: 12px;"><strong>Transaction ID:</strong></td><td style="text-align: right; padding-top: 12px; color: #1f8898; font-weight: bold;">${referenceNumber || 'N/A'}</td></tr>
                </table>
            </div>

            <p style="font-size: 15px; color: #4b5563;">Your account remains fully active. Thank you for choosing MogiRentOS!</p>
        </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"MogiRentOS Billing" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `Receipt: Payment Received for MogiRentOS`,
                html,
            });
        } catch (error) {
            console.error('❌ [Mail Service] Error sending SaaS receipt:', error);
        }
    }

    async sendAccountSuspensionNotice(email: string, firstName: string) {
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #e11d48; margin: 0; font-size: 24px; font-weight: 900;">Account Suspended</h2>
            </div>
            <p style="font-size: 16px; color: #374151;">Hello <strong>${firstName}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Your MogiRentOS Landlord Account has been temporarily suspended due to overdue subscription payments.</p>
            <p style="font-size: 15px; color: #4b5563;">During this time, access to your management dashboard and your tenants' portals will be restricted.</p>
            <p style="font-size: 15px; color: #4b5563; margin-top: 20px;">Please contact support or settle your outstanding balance immediately to restore services.</p>
        </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"MogiRentOS Billing" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `Urgent: Your MogiRentOS Account has been Suspended`,
                html,
            });
        } catch (error) {
            console.error('❌ [Mail Service] Error sending suspension notice:', error);
        }
    }

    // Add this anywhere inside MailService (apps/api/src/mail/mail.service.ts)
    async sendSaaSExpiryNotice(email: string, firstName: string, planName: string) {
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #e11d48; margin: 0; font-size: 24px; font-weight: 900;">Subscription Expired</h2>
            </div>
            <p style="font-size: 16px; color: #374151;">Hello <strong>${firstName}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Your MogiRentOS <strong>${planName}</strong> subscription has expired today.</p>
            <p style="font-size: 15px; color: #4b5563;">To avoid account suspension and interruption of service for your tenants, please settle your outstanding invoice immediately via your portal.</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
                <p>Powered by Mogitech Global Ltd</p>
            </div>
        </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"MogiRentOS Billing" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `Urgent: Your MogiRentOS Subscription has Expired`,
                html,
            });
        } catch (error) {
            console.error('❌ [Mail Service] Error sending expiry notice:', error);
        }
    }

    // --- NEW: LANDLORD DIRECTORY NOTIFICATIONS ---

    async sendAccountActivationNotice(email: string, firstName: string) {
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #16a34a; margin: 0; font-size: 24px; font-weight: 900;">Account Activated</h2>
            </div>
            <p style="font-size: 16px; color: #374151;">Hello <strong>${firstName}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Your MogiRentOS Landlord Account has been successfully activated.</p>
            <p style="font-size: 15px; color: #4b5563;">You can now log in to access your management dashboard and all associated services.</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
                <p>Powered by Mogitech Global Ltd</p>
            </div>
        </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"MogiRentOS Team" <${process.env.SMTP_USER}>`, // FIX: "Team" is less likely to trigger filters than "Security"
                to: email,
                subject: `Welcome to MogiRentOS! Your account is now active`, // FIX: Softer subject line
                text: `Hello ${firstName},\n\nYour MogiRentOS Landlord Account has been successfully activated.\n\nYou can now log in to access your management dashboard and all associated services.\n\nBest regards,\nThe MogiRentOS Team`, // FIX: Multi-line plain text fallback matches HTML perfectly
                html,
            });
            console.log(`✅ [Mail Service] Activation notice sent to ${email}`);
        } catch (error) {
            console.error('❌ [Mail Service] Error sending activation notice:', error);
        }
    }

    async sendSubscriptionTierUpdate(email: string, firstName: string, newPlan: string) {
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1f8898; margin: 0; font-size: 24px; font-weight: 900;">Subscription Updated</h2>
            </div>
            <p style="font-size: 16px; color: #374151;">Hello <strong>${firstName}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Your MogiRentOS subscription tier has been officially updated to <strong>${newPlan}</strong> by the administration.</p>
            
            <div style="background-color: #f8fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 25px 0; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #1f8898; font-weight: bold; text-transform: uppercase;">Active Plan</p>
                <h3 style="margin: 5px 0 0 0; color: #111827; font-size: 20px;">${newPlan} TIER</h3>
            </div>

            <p style="font-size: 15px; color: #4b5563;">Your new portfolio volume limits and premium features are now immediately active.</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
                <p>Powered by Mogitech Global Ltd</p>
            </div>
        </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"MogiRentOS Team" <${process.env.SMTP_USER}>`, 
                to: email,
                subject: `Update on your MogiRentOS subscription tier`, // FIX: Removed the word "Notice:" which flags filters
                text: `Hello ${firstName},\n\nYour MogiRentOS subscription tier has been officially updated to ${newPlan} by the administration.\n\nYour new portfolio volume limits and premium features are now immediately active.\n\nBest regards,\nThe MogiRentOS Team`, // FIX: Multi-line plain text fallback matches HTML perfectly
                html,
            });
            console.log(`✅ [Mail Service] Tier update notice sent to ${email}`);
        } catch (error) {
            console.error('❌ [Mail Service] Error sending tier update notice:', error);
        }
    }

    // --- NEW: TEAM & STAFF INVITATIONS ---
    async sendStaffInviteEmail(email: string, firstName: string, landlordName: string, roleName: string, tempPass?: string) {
        const loginUrl = process.env.NEXT_PUBLIC_FRONTEND_URL 
            ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/login` 
            : 'https://rentos.mogitechglobal.com/login';

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1f8898; margin: 0; font-size: 24px; font-weight: 900;">MogiRentOS</h2>
                <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Team Invitation</p>
            </div>
            
            <p style="font-size: 16px; color: #374151;">Hello <strong>${firstName}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">You have been invited by <strong>${landlordName}</strong> to join their property management team as a <strong>${roleName}</strong>.</p>

            ${tempPass ? `
            <div style="background-color: #f8fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="margin-top: 0; color: #111827; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Login Credentials</h3>
                <p style="margin: 0 0 10px 0;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #1f8898;">${loginUrl}</a></p>
                <p style="margin: 0 0 10px 0;"><strong>Email Address:</strong> ${email}</p>
                <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 6px 10px; border-radius: 4px; font-size: 16px; font-weight: bold; color: #111827;">${tempPass}</code></p>
            </div>
            <p style="color: #e11d48; font-size: 13px; font-weight: bold; background: #fff1f2; padding: 10px; border-radius: 6px; border-left: 4px solid #e11d48;">
                ⚠️ Security Notice: Please log in and change your password immediately.
            </p>
            ` : `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="background-color: #1f8898; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Log In to Dashboard</a>
            </div>
            <p style="font-size: 14px; color: #6b7280; text-align: center;">Use your existing MogiRentOS credentials to log in.</p>
            `}

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
                <p>Powered by Mogitech Global Ltd</p>
            </div>
        </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"MogiRentOS Team" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `Invitation to join ${landlordName} on MogiRentOS`,
                html,
            });
            console.log(`✅ [Mail Service] Staff invitation sent to ${email}`);
        } catch (error) {
            console.error('❌ [Mail Service] Error sending staff invitation:', error);
        }
    }
}