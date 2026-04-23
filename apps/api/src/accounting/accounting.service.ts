// apps/api/src/accounting/accounting.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AccountingService {
  constructor(
      private prisma: PrismaService,
      private auditService: AuditService // <-- 1. INJECT AUDIT SERVICE HERE
  ) {}

  // --- RBAC DATA ISOLATION HELPER ---
  private async resolveAccess(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (landlord) return { landlordId: landlord.id, propertyIds: null }; // Full access

    const staff = await this.prisma.staff.findUnique({
        where: { user_id: userId },
        include: { assignments: true }
    });

    if (staff) {
        // Strict Lock: Only Finance/Managers can access Accounting
        if (staff.role_type !== 'FINANCE' && staff.role_type !== 'MANAGER') {
            throw new UnauthorizedException('Strictly Confidential: Only Finance and Management can view P&L data.');
        }
        
        return {
            landlordId: staff.landlord_id,
            propertyIds: staff.assignments.map(a => a.property_id) 
        };
    }

    throw new UnauthorizedException('Access denied. No landlord or staff profile found.');
  }

  async getProfitAndLoss(userId: string, propertyId: string = 'ALL') {
    const access = await this.resolveAccess(userId);

    const propertyFilter = propertyId !== 'ALL' ? { id: propertyId } : {};

    // 1. Calculate Total Revenue (Sum of all actual Payments received for authorized properties)
    const payments = await this.prisma.payment.findMany({
      where: {
        invoice: { 
          tenant: { 
            unit: { 
              property: { 
                landlord_id: access.landlordId, 
                ...(access.propertyIds ? { id: { in: access.propertyIds } } : {}),
                ...propertyFilter 
              } 
            } 
          } 
        }
      }
    });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount_paid, 0);

    // 2. Fetch & Calculate Total Expenses for authorized properties
    const expenses = await this.prisma.expense.findMany({
      where: { 
        property: { 
          landlord_id: access.landlordId, 
          ...(access.propertyIds ? { id: { in: access.propertyIds } } : {}),
          ...propertyFilter 
        } 
      },
      include: { property: { select: { name: true } } },
      orderBy: { date_incurred: 'desc' }
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 3. Get Properties for the Frontend Dropdown (Only properties they have access to)
    const properties = await this.prisma.property.findMany({
      where: { 
        landlord_id: access.landlordId,
        ...(access.propertyIds ? { id: { in: access.propertyIds } } : {})
      },
      select: { id: true, name: true }
    });

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    return {
      metrics: { totalRevenue, totalExpenses, netProfit, profitMargin },
      expenses,
      properties
    };
  }

  async recordExpense(userId: string, data: any) {
    const access = await this.resolveAccess(userId);
    
    const property = await this.prisma.property.findFirst({
      where: { 
        id: data.property_id, 
        landlord_id: access.landlordId,
        ...(access.propertyIds ? { id: { in: access.propertyIds } } : {})
      }
    });

    if (!property) throw new UnauthorizedException('Access denied to this property.');

    const expense = await this.prisma.expense.create({
      data: {
        property_id: property.id,
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        date_incurred: new Date(data.date_incurred),
      }
    });

    // 2. AUDIT LOG: Record Creation
    await this.auditService.logActivity(
        userId, 
        'RECORDED_EXPENSE', 
        `Recorded a KSH ${expense.amount} ${expense.category} expense for ${property.name}`
    );

    return expense;
  }

  async updateExpense(userId: string, expenseId: string, data: any) {
    const access = await this.resolveAccess(userId);
    const expense = await this.prisma.expense.findUnique({ include: { property: true }, where: { id: expenseId } });
    
    if (!expense || expense.property.landlord_id !== access.landlordId) {
      throw new UnauthorizedException('Access denied.');
    }

    // Security check: Make sure staff is allowed to edit this specific property's expense
    if (access.propertyIds && !access.propertyIds.includes(expense.property_id)) {
      throw new UnauthorizedException('Access denied to this property.');
    }

    const updated = await this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        date_incurred: new Date(data.date_incurred),
        property_id: data.property_id
      }
    });

    // 3. AUDIT LOG: Record Update
    await this.auditService.logActivity(
        userId, 
        'UPDATED_EXPENSE', 
        `Updated a ${updated.category} expense record for ${expense.property.name}`
    );

    return updated;
  }

  // --- FULLY CORRECTED DELETE EXPENSE ---
  async deleteExpense(userId: string, expenseId: string) {
    const access = await this.resolveAccess(userId);
    
    // 1. Fetch the expense details first
    const expense = await this.prisma.expense.findUnique({ 
        include: { property: true }, 
        where: { id: expenseId } 
    });
    
    // 2. SECURITY CHECK: Ensure the expense exists and belongs to this workspace
    if (!expense || expense.property.landlord_id !== access.landlordId) {
      throw new UnauthorizedException('Access denied.');
    }
    
    // 3. SECURITY CHECK: Ensure staff is allowed to delete this specific property's expense
    if (access.propertyIds && !access.propertyIds.includes(expense.property_id)) {
      throw new UnauthorizedException('Access denied to this property.');
    }
    
    // 4. Perform the deletion ONLY after security checks pass
    const deleted = await this.prisma.expense.delete({ where: { id: expenseId } });

    // 5. AUDIT LOG: Record Deletion
    await this.auditService.logActivity(
        userId, 
        'DELETED_EXPENSE', 
        `Deleted a KSH ${deleted.amount} ${deleted.category} expense for ${expense.property.name}`
    );

    // 6. Return success
    return deleted;
  }
}