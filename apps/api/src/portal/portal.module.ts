// apps/api/src/portal/portal.module.ts
import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../mail/mail.module'; // Import the module

@Module({
  imports: [MailModule], // Add MailModule here
  controllers: [PortalController],
  providers: [PortalService, PrismaService],
})
export class PortalModule {}
