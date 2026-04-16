import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService, PrismaService],
})
export class MarketplaceModule {}