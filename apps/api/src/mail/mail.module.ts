// apps/api/src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { PdfService } from './pdf.service'; // Import the PDF service

@Module({
  providers: [MailService, PdfService],
  exports: [MailService, PdfService], // This makes them available to other modules
})
export class MailModule {}
