// apps/api/src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { PdfService } from './pdf.service'; 

@Module({
  providers: [MailService, PdfService],
  // THE FIX: Export both services so other modules can inject them!
  exports: [MailService, PdfService], 
})
export class MailModule {}