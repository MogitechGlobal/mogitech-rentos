// apps/api/src/properties/properties.module.ts
import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule], // <-- INJECT HERE
  controllers: [PropertiesController],
  providers: [PropertiesService, PrismaService],
})
export class PropertiesModule {}
