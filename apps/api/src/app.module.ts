// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LandlordsModule } from './landlords/landlords.module';
import { PropertiesModule } from './properties/properties.module'; // <-- Import
import { UnitsModule } from './units/units.module';
import { TenantsModule } from './tenants/tenants.module';
import { InvoicesModule } from './invoices/invoices.module';
import { TicketsModule } from './tickets/tickets.module';
import { PortalModule } from './portal/portal.module';
import { MailModule } from './mail/mail.module';
import { PaymentsModule } from './payments/payments.module';
import { MpesaModule } from './mpesa/mpesa.module';
import { AdminModule } from './admin/admin.module';
import { CommunicationsModule } from './communications/communications.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { LeadsModule } from './leads/leads.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UsersController } from './users/users.controller';
import { PrismaService } from './prisma/prisma.service';
import { AccountingModule } from './accounting/accounting.module';
import { StaffModule } from './staff/staff.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    LandlordsModule,
    PropertiesModule,
    UnitsModule,
    TenantsModule,
    InvoicesModule,
    TicketsModule,
    PortalModule,
    MailModule,
    PaymentsModule,
    MpesaModule,
    AdminModule,
    CommunicationsModule,
    MarketplaceModule,
    LeadsModule,
    CloudinaryModule,
    AccountingModule,
    StaffModule,
    AuditModule,
  ],
  controllers: [
    AppController,
    UsersController
  ],
  providers: [
    AppService,
    PrismaService
  ],
})
export class AppModule {}
