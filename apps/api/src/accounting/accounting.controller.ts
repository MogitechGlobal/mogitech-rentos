import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Put } from '@nestjs/common';

@Controller('api/v1/accounting')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('LANDLORD', 'ADMIN')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('pnl')
  async getPnl(@Request() req: any, @Query('propertyId') propertyId: string) {
    return this.accountingService.getProfitAndLoss(req.user.sub, propertyId);
  }

  @Post('expenses')
  async recordExpense(@Request() req: any, @Body() body: any) {
    return this.accountingService.recordExpense(req.user.sub, body);
  }

  @Delete('expenses/:id')
  async deleteExpense(@Request() req: any, @Param('id') expenseId: string) {
    return this.accountingService.deleteExpense(req.user.sub, expenseId);
  }

  @Put('expenses/:id')
  async updateExpense(@Request() req: any, @Param('id') expenseId: string, @Body() body: any) {
    return this.accountingService.updateExpense(req.user.sub, expenseId, body);
  }
}