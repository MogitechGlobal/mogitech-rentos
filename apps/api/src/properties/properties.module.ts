// apps/api/src/properties/properties.module.ts
import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PropertiesController],
  providers: [PropertiesService, PrismaService],
})
export class PropertiesModule {}
