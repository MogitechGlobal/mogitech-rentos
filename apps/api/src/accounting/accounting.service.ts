// apps/api/src/accounting/accounting.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  // --- NEW: RBAC DATA ISOLATION HELPER ---
  private async resolveAccess(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { user_id: userId } });
    if (landlord) return { landlordId: landlord.id, propertyIds: null }; // Full access

    const staff = await this.prisma.staff.findUnique({
        where: { user_id: userId },
        include: { assignments: true }
    });

    if (staff) {
        return {
            landlordId: staff.landlord_id,
            propertyIds: staff.assignments.map(a => a.property_id) // Caretaker/Finance Restrictions
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

    return this.prisma.expense.create({
      data: {
        property_id: property.id,
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        date_incurred: new Date(data.date_incurred),
      }
    });
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

    return this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        date_incurred: new Date(data.date_incurred),
        property_id: data.property_id
      }
    });
  }

  async deleteExpense(userId: string, expenseId: string) {
    const access = await this.resolveAccess(userId);
    const expense = await this.prisma.expense.findUnique({ include: { property: true }, where: { id: expenseId } });
    
    if (!expense || expense.property.landlord_id !== access.landlordId) {
      throw new UnauthorizedException('Access denied.');
    }
    
    // Security check: Make sure staff is allowed to delete this specific property's expense
    if (access.propertyIds && !access.propertyIds.includes(expense.property_id)) {
      throw new UnauthorizedException('Access denied to this property.');
    }
    
    return this.prisma.expense.delete({ where: { id: expenseId } });
  }
}