// apps/api/src/tickets/tickets.module.ts
import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [TicketsController],
  providers: [TicketsService, PrismaService],
})
export class TicketsModule {}
