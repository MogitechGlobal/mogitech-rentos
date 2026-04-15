// apps/api/src/tenants/tenants.service.ts
/* eslint-disable */
import { Injectable, NotFoundException, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private prisma: PrismaService) { }

  // --- PRIVATE EMAIL DISPATCHER ---
  private async sendTenantWelcomeEmail(email: string, firstName: string, tempPass: string, propertyName: string, unitNumber: string, landlordName: string) {
    const loginUrl = process.env.NEXT_PUBLIC_FRONTEND_URL 
        ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/login` 
        : 'https://rentos.mogitechglobal.com/login';
        
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'mogitechglobal.com',
            port: Number(process.env.SMTP_PORT) || 465,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: { rejectUnauthorized: false }
        });

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #1f8898; margin: 0;">MogiRentOS</h1>
                </div>
                <h2 style="color: #111827;">Welcome to your new home!</h2>
                <p style="color: #4b5563; line-height: 1.6;">
                    Hi ${firstName},<br><br>
                    <strong>${landlordName}</strong> has officially added you to the MogiRentOS portal for your residency at <strong>${propertyName} (Unit ${unitNumber})</strong>.
                </p>
                
                <div style="background-color: #f8fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                    <h3 style="margin-top: 0; color: #111827; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Login Credentials</h3>
                    <p style="margin: 0 0 10px 0;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #1f8898;">${loginUrl}</a></p>
                    <p style="margin: 0 0 10px 0;"><strong>Email Address:</strong> ${email}</p>
                    <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 6px 10px; border-radius: 4px; font-size: 16px; font-weight: bold; color: #111827;">${tempPass}</code></p>
                </div>

                <p style="color: #e11d48; font-size: 13px; font-weight: bold; background: #fff1f2; padding: 10px; border-radius: 6px; border-left: 4px solid #e11d48;">
                    ⚠️ Security Notice: This temporary password is secure and randomly generated. You will be required to change it to a permanent password immediately upon your first login.
                </p>

                <h3 style="color: #111827; font-size: 16px; margin-top: 30px;">What can you do in the portal?</h3>
                <ul style="color: #4b5563; line-height: 1.6;">
                    <li><strong>Review & Sign Leases:</strong> Digitally sign your lease documents.</li>
                    <li><strong>Pay Rent:</strong> View invoices and pay directly via M-Pesa or Bank Transfer.</li>
                    <li><strong>Request Maintenance:</strong> Submit tickets for repairs directly to your landlord.</li>
                    <li><strong>Download Receipts:</strong> Access your complete payment history at any time.</li>
                </ul>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                
                <div style="color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
                    <p style="margin-bottom: 10px;">
                        This is an automated message sent on behalf of <strong>${landlordName}</strong> via the MogiRentOS platform. Please do not reply directly to this email. For maintenance or urgent property inquiries, please contact your property manager directly through the portal.
                    </p>
                    <p style="margin-bottom: 10px;">
                        <strong>Security Tip:</strong> MogiRentOS staff or your landlord will <em>never</em> ask you for your password via email or phone.
                    </p>
                    <p style="margin: 0;">
                        By logging in and using MogiRentOS, you agree to our 
                        <a href="https://rentos.mogitechglobal.com/terms" target="_blank" style="color: #1f8898; text-decoration: underline;">Terms of Service</a> and 
                        <a href="https://rentos.mogitechglobal.com/privacy" target="_blank" style="color: #1f8898; text-decoration: underline;">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"MogiRentOS Team" <rentos@mogitechglobal.com>',
            to: email,
            subject: `Welcome to ${propertyName}! Your Tenant Portal Access.`,
            html,
        });
        
        this.logger.log(`Tenant welcome email dispatched successfully to ${email}`);
    } catch (error) {
        this.logger.error(`Failed to send tenant welcome email to ${email}.`, error);
    }
  }

  async registerTenant(userId: string, unitId: string, data: any) {
    const existingTenantEmail = await this.prisma.tenant.findUnique({ 
        where: { email: data.email } 
    });
    
    if (existingTenantEmail) throw new ConflictException('A tenant with this email address is already registered.');

    const unit = await this.prisma.unit.findFirst({
      where: { id: unitId, property: { landlord: { user_id: userId } } },
      include: { property: { include: { landlord: true } } }
    });

    if (!unit) throw new UnauthorizedException('Unit not found or access denied.');
    if (unit.status === 'OCCUPIED') throw new UnauthorizedException('This unit is already occupied!');

    const tenantRole = await this.prisma.role.findUnique({ where: { name: 'TENANT' } });
    if (!tenantRole) throw new NotFoundException('TENANT role not found.');

    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('A user with this email already exists.');

    // --- SECURE PASSWORD GENERATION ---
    const tempPassword = crypto.randomBytes(4).toString('hex'); 
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(tempPassword, salt);

    const result = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email, password_hash, first_name: data.first_name, last_name: data.last_name,
          role_id: tenantRole.id, requires_password_change: true, 
        }
      });

      const newTenant = await tx.tenant.create({
        data: {
          unit_id: unitId, user_id: newUser.id, first_name: data.first_name, last_name: data.last_name,
          email: data.email, phone: data.phone, lease_start: new Date(data.lease_start), lease_end: new Date(data.lease_end),
        }
      });

      const updatedUnit = await tx.unit.update({ where: { id: unitId }, data: { status: 'OCCUPIED' } });

      const leaseType = data.lease_type || 'STANDARD';
      const fileUrl = data.lease_file_url || null;     
      let leaseContent: string | null = null;

      if (leaseType === 'STANDARD') {
          leaseContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151;">
                <h2 style="text-align: center; color: #0f3e46; border-bottom: 2px solid #1f8898; padding-bottom: 10px; margin-bottom: 20px;">STANDARD RESIDENTIAL LEASE AGREEMENT</h2>
                
                <p>This Lease Agreement is officially entered into on <strong>${new Date().toLocaleDateString()}</strong> by and between:</p>
                <p><strong>LANDLORD:</strong> ${unit.property.landlord.company_name} <br/>
                   <strong>TENANT:</strong> ${data.first_name} ${data.last_name}</p>
                
                <h3 style="color: #1f8898; margin-top: 30px;">1. PREMISES & DURATION</h3>
                <p>The Landlord agrees to rent the premises located at <strong>${unit.property.name} - Unit ${unit.unit_number}</strong> to the Tenant.</p>
                <p>The term of this lease shall commence on <strong>${new Date(data.lease_start).toLocaleDateString()}</strong> and terminate on <strong>${new Date(data.lease_end).toLocaleDateString()}</strong>.</p>
                
                <h3 style="color: #1f8898; margin-top: 30px;">2. RENT DETAILS</h3>
                <p>The Tenant agrees to pay a monthly rent of <strong>KSH ${unit.rent_amount.toLocaleString()}</strong>, payable strictly on or before the 5th day of every calendar month via the official MogiRentOS payment portal.</p>
                
                <h3 style="color: #1f8898; margin-top: 30px;">3. USE OF PREMISES & MAINTENANCE</h3>
                <ul>
                    <li>The premises shall be used exclusively for residential purposes by the Tenant and authorized occupants.</li>
                    <li>The Tenant shall maintain the premises in a clean, sanitary, and good condition. All damages caused by the Tenant's negligence will be repaired at the Tenant's expense.</li>
                    <li>The Landlord will be responsible for structural and major electrical/plumbing repairs not caused by the Tenant.</li>
                </ul>

                <h3 style="color: #1f8898; margin-top: 30px;">4. DEFAULT & TERMINATION</h3>
                <p>If the Tenant fails to pay rent within 10 days of the due date, the Landlord reserves the right to terminate this agreement, initiate eviction proceedings, and claim outstanding arrears.</p>
                <p>Either party may terminate this agreement early by providing a formal <strong>30-day written notice</strong> via the system.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #1f8898; margin-top: 40px;">
                    <p style="margin: 0; font-size: 12px;">By electronically signing this document via MogiRentOS, both parties acknowledge and agree to be bound by the terms and conditions set forth above.</p>
                </div>
            </div>
          `;
      }

      await tx.leaseDocument.create({
        data: {
            tenant_id: newTenant.id,
            type: leaseType,
            file_url: fileUrl,
            content: leaseContent,
            status: leaseType === 'CUSTOM' ? 'APPROVED' : 'PENDING_SIGNATURE' 
        }
      });

      return { tenant: newTenant, unit: updatedUnit, user: newUser };
    });

    await this.sendTenantWelcomeEmail(
        data.email, 
        data.first_name, 
        tempPassword, 
        unit.property.name, 
        unit.unit_number, 
        unit.property.landlord.company_name
    );

    return result;
  }

  async getAllTenants(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord not found');

    return this.prisma.tenant.findMany({
      where: { unit: { property: { landlord_id: landlord.id } } },
      include: {
        unit: { include: { property: true } },
        // --- CRITICAL FIX: Include payments so the frontend can calculate balances ---
        invoices: { include: { payments: true } },
        lease_document: true 
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async updateTenant(userId: string, tenantId: string, data: any) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, unit: { property: { landlord: { user_id: userId } } } }
    });
    if (!tenant) throw new UnauthorizedException('Tenant not found.');

    return this.prisma.$transaction(async (tx) => {
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: {
          first_name: data.first_name, last_name: data.last_name, email: data.email, phone: data.phone,
          lease_start: new Date(data.lease_start), lease_end: new Date(data.lease_end),
        }
      });
      if (updatedTenant.user_id) {
        await tx.user.update({
          where: { id: updatedTenant.user_id },
          data: { first_name: data.first_name, last_name: data.last_name, email: data.email }
        });
      }
      return updatedTenant;
    });
  }

  async moveOutTenant(userId: string, tenantId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, unit: { property: { landlord: { user_id: userId } } } }
    });
    if (!tenant) throw new NotFoundException('Tenant not found.');

    return this.prisma.$transaction([
      this.prisma.unit.update({ where: { id: tenant.unit_id }, data: { status: 'VACANT' } }),
      this.prisma.tenant.update({ where: { id: tenantId }, data: { is_active: false } })
    ]);
  }

  async approveDocument(userId: string, tenantId: string, data: { signature: string, docType: string }) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, unit: { property: { landlord: { user_id: userId } } } },
      include: { lease_document: true }
    });

    if (!tenant) throw new NotFoundException('Tenant not found.');

    if (data.docType === 'LEASE') {
        if (!tenant.lease_document || tenant.lease_document.status !== 'PENDING_APPROVAL') {
            throw new BadRequestException('Lease document is not ready for approval.');
        }
        return this.prisma.leaseDocument.update({
          where: { id: tenant.lease_document.id },
          data: { landlord_signature: data.signature, approved_at: new Date(), status: 'APPROVED' }
        });
    } 
    else if (data.docType === 'RULES') {
        if (!tenant.rules_signature) throw new BadRequestException('Tenant has not signed the rules yet.');
        return this.prisma.tenant.update({
          where: { id: tenant.id },
          data: { rules_landlord_signature: data.signature, rules_approved_at: new Date() }
        });
    } 
    else if (data.docType === 'INSPECTION') {
        if (!tenant.inspection_signature) throw new BadRequestException('Tenant has not signed the inspection report yet.');
        return this.prisma.tenant.update({
          where: { id: tenant.id },
          data: { inspection_landlord_signature: data.signature, inspection_approved_at: new Date() }
        });
    }

    throw new BadRequestException('Invalid document type provided.');
  }

  async updateDocumentContent(userId: string, tenantId: string, data: { docType: string, content: string }) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, unit: { property: { landlord: { user_id: userId } } } },
      include: { lease_document: true }
    });

    if (!tenant) throw new NotFoundException('Tenant not found.');

    if (data.docType === 'LEASE') {
        if (tenant.lease_document) {
            return this.prisma.leaseDocument.update({
              where: { id: tenant.lease_document.id },
              data: { content: data.content }
            });
        } else {
            return this.prisma.leaseDocument.create({
              data: {
                  tenant_id: tenantId,
                  type: 'STANDARD',
                  status: 'PENDING_SIGNATURE',
                  content: data.content
              }
            });
        }
    } 
    else if (data.docType === 'RULES') {
        return this.prisma.tenant.update({
          where: { id: tenant.id },
          data: { rules_content: data.content }
        });
    } 
    else if (data.docType === 'INSPECTION') {
        return this.prisma.tenant.update({
          where: { id: tenant.id },
          data: { inspection_content: data.content }
        });
    }

    throw new BadRequestException('Invalid document type provided.');
  }
}