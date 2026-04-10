// apps/api/src/tenants/tenants.service.ts
/* eslint-disable */
import { Injectable, NotFoundException, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) { }

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

    const tempPassword = '12345678!'; 
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(tempPassword, salt);

    return await this.prisma.$transaction(async (tx) => {
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

      // --- DYNAMIC LEASE GENERATION OR CUSTOM UPLOAD ---
      const leaseType = data.lease_type || 'STANDARD'; // Expected from frontend: 'STANDARD' or 'CUSTOM'
      const fileUrl = data.lease_file_url || null;     // Expected from frontend if CUSTOM
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
            status: leaseType === 'CUSTOM' ? 'APPROVED' : 'PENDING_SIGNATURE' // Custom leases bypass internal e-signing
        }
      });

      return { tenant: newTenant, unit: updatedUnit, user: newUser };
    });
  }

  async getAllTenants(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord not found');

    return this.prisma.tenant.findMany({
      where: { unit: { property: { landlord_id: landlord.id } } },
      include: {
        unit: { include: { property: true } },
        invoices: true,
        lease_document: true // <-- Include the doc status
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

  // --- UPDATED: UNIVERSAL DOCUMENT APPROVAL ---
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

  // --- NEW: SAVE WYSIWYG DOCUMENT CONTENT ---
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
            // Fallback if the lease document record doesn't exist yet
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