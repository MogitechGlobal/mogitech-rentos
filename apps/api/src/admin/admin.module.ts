import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt'; 
import { BillingCronService } from './billing-cron.service'; 
import { MailModule } from '../mail/mail.module'; // <-- IMPORT MAIL MODULE

@Module({
  imports: [
    JwtModule.register({}),
    MailModule // <-- ADD TO IMPORTS
  ], 
  controllers: [AdminController],
  providers: [AdminService, PrismaService, BillingCronService],
})
export class AdminModule {}