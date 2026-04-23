// apps/api/src/invoices/invoices.module.ts
import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../mail/mail.module'; // <-- IMPORT MAIL MODULE
import { AuditModule } from '../audit/audit.module'; // <-- 1. Import the new module

@Module({
  imports: [MailModule, AuditModule], // <-- INJECT HERE
  controllers: [InvoicesController],
  providers: [InvoicesService, PrismaService],
})
export class InvoicesModule {}