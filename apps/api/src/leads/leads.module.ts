import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditModule } from '../audit/audit.module'; 

@Module({
  imports: [AuditModule], // <-- INJECT HERE
  controllers: [LeadsController],
  providers: [LeadsService, PrismaService],
})
export class LeadsModule {}