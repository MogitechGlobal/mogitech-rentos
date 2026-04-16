import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, PrismaService],
})
export class LeadsModule {}