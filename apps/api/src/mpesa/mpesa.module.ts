// apps/api/src/mpesa/mpesa.module.ts
import { Module } from '@nestjs/common';
import { MpesaController } from './mpesa.controller';
import { MpesaService } from './mpesa.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MpesaController],
  providers: [MpesaService, PrismaService],
})
export class MpesaModule {}
