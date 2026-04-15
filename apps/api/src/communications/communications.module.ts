// apps/api/src/communications/communications.module.ts
import { Module } from '@nestjs/common';
import { CommunicationsController } from './communications.controller';
import { CommunicationsService } from './communications.service';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../prisma/prisma.service'; 

@Module({
  imports: [MailModule], // Only MailModule goes here
  controllers: [CommunicationsController],
  providers: [CommunicationsService, PrismaService], 
})
export class CommunicationsModule {}