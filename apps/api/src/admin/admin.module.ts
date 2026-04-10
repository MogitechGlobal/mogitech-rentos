// apps/api/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt'; // <-- Add this import
import { BillingCronService } from './billing-cron.service'; // <-- Import it

@Module({
  imports: [JwtModule.register({})], // <-- Add this line
  controllers: [AdminController],
  providers: [AdminService, PrismaService, BillingCronService],
})
export class AdminModule {}