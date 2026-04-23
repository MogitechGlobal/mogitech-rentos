import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../mail/mail.module'; // <-- IMPORT THIS

@Module({
  imports: [MailModule], // <-- ADD THIS
  controllers: [StaffController],
  providers: [StaffService, PrismaService],
})
export class StaffModule {}