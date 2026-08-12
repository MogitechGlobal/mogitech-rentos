// apps/api/src/hunter/hunter.module.ts
import { Module } from '@nestjs/common';
import { HunterController } from './hunter.controller';
import { HunterService } from './hunter.service';
import { PrismaService } from '../prisma/prisma.service'; // <-- Imported PrismaService

@Module({
  controllers: [HunterController],
  providers: [HunterService, PrismaService], // <-- Added PrismaService to providers
})
export class HunterModule {}