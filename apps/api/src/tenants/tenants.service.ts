// apps/api/src/tenants/tenants.service.ts
/* eslint-disable */
import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) { }

  async registerTenant(userId: string, unitId: string, data: any) {
    // 1. SECURITY CHECK: Verify landlord ownership and unit vacancy

    const existingTenantEmail = await this.prisma.tenant.findUnique({ 
        where: { email: data.email } 
    });
    
    if (existingTenantEmail) {
        throw new ConflictException('A tenant with this email address is already registered in the system.');
    }
    const unit = await this.prisma.unit.findFirst({
      where: {
        id: unitId,
        property: { landlord: { user_id: userId } }
      }
    });

    if (!unit) throw new UnauthorizedException('Unit not found or access denied.');
    if (unit.status === 'OCCUPIED') throw new UnauthorizedException('This unit is already occupied!');

    // 2. FETCH ROLE: Get the specific ID for the 'TENANT' role
    const tenantRole = await this.prisma.role.findUnique({ where: { name: 'TENANT' } });
    if (!tenantRole) throw new NotFoundException('TENANT role not found in the database. Please seed it.');

    // 3. CHECK EMAIL: Ensure the tenant doesn't already have an account
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('A user with this email already exists in the system.');

    // 4. GENERATE TEMPORARY CREDENTIALS
    const tempPassword = '12345678!'; 
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(tempPassword, salt);

    // 5. INTERACTIVE TRANSACTION: Create User -> Create Tenant -> Update Unit
    const result = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          password_hash,
          first_name: data.first_name,
          last_name: data.last_name,
          role_id: tenantRole.id,
          requires_password_change: true, 
        }
      });

      const newTenant = await tx.tenant.create({
        data: {
          unit_id: unitId,
          user_id: newUser.id, 
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          lease_start: new Date(data.lease_start),
          lease_end: new Date(data.lease_end),
        }
      });

      const updatedUnit = await tx.unit.update({
        where: { id: unitId },
        data: { status: 'OCCUPIED' }
      });

      return { tenant: newTenant, unit: updatedUnit, user: newUser };
    });

    return result;
  }

  async getAllTenants(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (!landlord) throw new NotFoundException('Landlord not found');

    return this.prisma.tenant.findMany({
      where: { unit: { property: { landlord_id: landlord.id } } },
      include: {
        unit: { include: { property: true } },
        invoices: true 
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async updateTenant(userId: string, tenantId: string, data: any) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        id: tenantId,
        unit: { property: { landlord: { user_id: userId } } }
      }
    });

    if (!tenant) throw new UnauthorizedException('Tenant not found or unauthorized access.');

    return this.prisma.$transaction(async (tx) => {
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          lease_start: new Date(data.lease_start),
          lease_end: new Date(data.lease_end),
        }
      });

      if (updatedTenant.user_id) {
        await tx.user.update({
          where: { id: updatedTenant.user_id },
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
          }
        });
      }

      return updatedTenant;
    });
  }

  // --- FIXED: SOFT DELETE FOR TERMINATION ---
  async moveOutTenant(userId: string, tenantId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        id: tenantId,
        unit: { property: { landlord: { user_id: userId } } }
      },
      include: { unit: true }
    });

    if (!tenant) throw new NotFoundException('Tenant not found or unauthorized access.');

    // We use a sequential transaction here to safely free up the unit AND archive the lease
    return this.prisma.$transaction([
      this.prisma.unit.update({
        where: { id: tenant.unit_id },
        data: { status: 'VACANT' }
      }),
      this.prisma.tenant.update({
        where: { id: tenantId },
        data: { is_active: false } // <-- Marks them as an archived/past lease!
      })
    ]);
  }
}