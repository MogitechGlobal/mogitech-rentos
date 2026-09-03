// apps/api/src/contact/contact.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('api/v1/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitContact(@Body() body: any) {
    // 1. Server-side validation
    if (!body.firstName || !body.email || !body.enquiryType || !body.message) {
      throw new BadRequestException('First name, email, enquiry type, and message are required.');
    }

    // 2. Pass to service
    const enquiry = await this.contactService.createEnquiry(body);

    // 3. Return success response
    return {
      success: true,
      message: 'Enquiry received successfully.',
      id: enquiry.id,
    };
  }
}