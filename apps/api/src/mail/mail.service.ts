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
            secure: true, // Set to TRUE because we are using Port 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // This helps bypass potential certificate issues on some cPanel servers
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
            from: '"MogiRentOS Support" <noreply@mogirentos.com>',
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

    // Add this new method to MailService
    async sendPaymentReceipt(email: string, firstName: string, pdfBuffer: Buffer, amount: number) {
        await this.transporter.sendMail({
            from: '"MogiRentOS Payments" <rentos@mogitechglobal.com>',
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


    async sendInvoiceReminder(
        email: string,
        firstName: string,
        invoiceDescription: string,
        balance: number,
        dueDate: string,
        unitNumber: string,
        companyName: string
    ) {
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

        // Assuming you are using Nodemailer or similar in your MailService
        return this.transporter.sendMail({
            from: `"MogiRentOS Billing" <${process.env.MAIL_USER}>`,
            to: email,
            subject,
            html,
        });
    }
}