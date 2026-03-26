// apps/api/src/landlords/landlords.module.ts
import { Module } from '@nestjs/common';
import { LandlordsController } from './landlords.controller';
import { LandlordsService } from './landlords.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LandlordsController],
  providers: [LandlordsService, PrismaService],
  exports: [LandlordsService], // We export this in case other modules need to look up landlord info later
})
export class LandlordsModule {}
