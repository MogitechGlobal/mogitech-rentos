// apps/api/src/portal/portal.module.ts
import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../mail/mail.module'; 
import { PaymentsModule } from '../payments/payments.module'; // <-- 1. Import PaymentsModule

@Module({
  imports: [MailModule, PaymentsModule], // <-- 2. Add PaymentsModule to imports
  controllers: [PortalController],
  providers: [PortalService, PrismaService],
})
export class PortalModule {}