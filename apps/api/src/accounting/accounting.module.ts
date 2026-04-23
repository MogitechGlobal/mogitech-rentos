// apps/api/src/accounting/accounting.module.ts
import { Module } from '@nestjs/common';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditModule } from '../audit/audit.module'; // <-- 1. Import the new module

@Module({
  imports: [AuditModule], // <-- 2. Add it to the imports array
  controllers: [AccountingController],
  providers: [AccountingService, PrismaService],
})
export class AccountingModule {}