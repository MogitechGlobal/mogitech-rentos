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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
