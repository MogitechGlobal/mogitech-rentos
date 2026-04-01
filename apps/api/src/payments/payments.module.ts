// apps/api/src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../mail/mail.module'; // <-- 1. Import MailModule

@Module({
  imports: [MailModule], // <-- 2. Add it to the imports array
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService],
})
export class PaymentsModule {}