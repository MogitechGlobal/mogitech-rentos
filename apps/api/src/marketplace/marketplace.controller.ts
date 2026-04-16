import { Controller, Get, Post, Body } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';

@Controller('api/v1/marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('listings')
  async getListings() {
    return this.marketplaceService.getPublicListings();
  }

  // --- NEW: RECEIVE LEADS FROM PUBLIC FRONTEND ---
  @Post('leads')
  async submitLead(@Body() body: any) {
    return this.marketplaceService.createLead(body);
  }
}