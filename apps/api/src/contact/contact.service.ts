// apps/api/src/contact/contact.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async createEnquiry(data: {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    company?: string;
    enquiryType: string;
    message: string;
  }) {
    try {
      const enquiry = await this.prisma.contactEnquiry.create({
        data: {
          first_name: data.firstName,
          last_name: data.lastName || null,
          email: data.email,
          phone: data.phone || null,
          company: data.company || null,
          enquiry_type: data.enquiryType,
          message: data.message,
        },
      });

      // TODO: Hook up email notifications to the sales/support team here if needed

      return enquiry;
    } catch (error) {
      console.error('Failed to save contact enquiry:', error);
      throw new InternalServerErrorException('An unexpected error occurred while saving your enquiry.');
    }
  }
}