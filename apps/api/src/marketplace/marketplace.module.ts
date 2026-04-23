import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditModule } from '../audit/audit.module'; 

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService, PrismaService],
  imports: [AuditModule]
})
export class MarketplaceModule {}