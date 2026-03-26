// apps/api/src/mail/pdf.service.ts
/* eslint-disable */
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
    async generatePaymentReceipt(data: {
        id: string;
        tenantName: string;
        propertyName: string;
        unitNumber: string;
        amount: number;
        method: string;
        reference: string;
        invoiceNumber: string;
        companyName: string; // <-- Added
        companyLogo?: string | null; // <-- Added
    }): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 0, left: 50, right: 50 } });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const primaryColor = '#0d393f'; 
            const accentColor = '#1f8898';  
            const lightGray = '#f3f4f6';

            // --- 1. Watermark ---
            doc.save();
            doc.rotate(-30, { origin: [300, 400] });
            doc.fillOpacity(0.04).fontSize(80).font('Helvetica-Bold')
               .text('PAID IN FULL', 0, 400, { align: 'center', lineBreak: false });
            doc.restore();

            // --- 2. Header: Company Info with Dynamic Logo ---
            doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);
            doc.fillColor('#ffffff');

            let textStartX = 50;

            // Render logo if the landlord uploaded one
            if (data.companyLogo && data.companyLogo.startsWith('data:image')) {
                try {
                    // Convert base64 Data URI to a Buffer for PDFKit
                    const base64Data = data.companyLogo.split(',')[1];
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    
                    // Draw image (50x50 perfectly centered in the header)
                    doc.image(imageBuffer, 50, 25, { fit: [50, 50], align: 'center', valign: 'center' });
                    textStartX = 115; // Shift text right to make room for the logo
                } catch (e) {
                    console.error('Failed to parse landlord logo:', e);
                }
            }

            doc.fontSize(24).font('Helvetica-Bold').text(data.companyName, textStartX, 35);
            doc.fontSize(10).font('Helvetica').text('Automated Property Management', textStartX, 65);

            // "OFFICIAL RECEIPT" badge right-aligned
            doc.fontSize(18).font('Helvetica-Bold').text('OFFICIAL RECEIPT', 300, 40, { align: 'right' });

            // --- 3. Receipt Meta Data ---
            doc.fillColor('#000000');
            doc.fontSize(10).font('Helvetica-Bold').text('BILLED TO:', 50, 140);
            doc.font('Helvetica').text(data.tenantName, 50, 155);
            doc.text(`${data.propertyName} - Unit ${data.unitNumber}`, 50, 170);

            doc.font('Helvetica-Bold').text('Receipt No:', 350, 140);
            doc.font('Helvetica').text(`REC-${data.id.substring(0, 8).toUpperCase()}`, 450, 140);
            
            doc.font('Helvetica-Bold').text('Date Paid:', 350, 155);
            doc.font('Helvetica').text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 450, 155);

            doc.font('Helvetica-Bold').text('Invoice Ref:', 350, 170);
            doc.font('Helvetica').text(`INV-${data.invoiceNumber}`, 450, 170);

            // --- 4. The Payment Table ---
            const tableTop = 230;
            doc.rect(50, tableTop, 500, 25).fill(accentColor);
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
            doc.text('DESCRIPTION', 60, tableTop + 8);
            doc.text('PAYMENT METHOD', 250, tableTop + 8);
            doc.text('REFERENCE CODE', 380, tableTop + 8);
            doc.text('AMOUNT', 0, tableTop + 8, { align: 'right', width: 530 });

            doc.fillColor('#000000').font('Helvetica').fontSize(10);
            doc.text('Settlement of Account Balance', 60, tableTop + 35);
            doc.text(data.method, 250, tableTop + 35);
            doc.text(data.reference || 'N/A', 380, tableTop + 35);
            doc.text(`KSH ${data.amount.toLocaleString()}`, 0, tableTop + 35, { align: 'right', width: 530 });

            doc.rect(50, tableTop + 60, 500, 1).fill(lightGray);
            doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12);
            doc.text('TOTAL PAID:', 350, tableTop + 75);
            doc.text(`KSH ${data.amount.toLocaleString()}`, 0, tableTop + 75, { align: 'right', width: 530 });

            // --- 5. Official Stamp & Signature Area ---
            doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text('Authorized Signature', 50, 420, { lineBreak: false });
            doc.rect(50, 410, 150, 1).fill(primaryColor);

            // --- 6. Footer ---
            const bottom = doc.page.height - 60;
            doc.rect(0, bottom - 15, doc.page.width, 75).fill(lightGray);
            doc.fillColor('#6b7280').font('Helvetica').fontSize(8);
            doc.text('This is a computer-generated receipt and does not require a physical signature.', 0, bottom, { align: 'center', width: doc.page.width, lineBreak: false });
            doc.text(`Generated by ${data.companyName} via MogiRentOS on ${new Date().toLocaleString()}`, 0, bottom + 12, { align: 'center', width: doc.page.width, lineBreak: false });

            doc.end();
        });
    }
}