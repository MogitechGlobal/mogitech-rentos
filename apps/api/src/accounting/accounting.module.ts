import { Module } from '@nestjs/common';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AccountingController],
  providers: [AccountingService, PrismaService],
})
export class AccountingModule {}