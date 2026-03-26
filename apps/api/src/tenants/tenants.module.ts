// apps/api/src/tenants/tenants.module.ts
import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, PrismaService],
})
export class TenantsModule {}
