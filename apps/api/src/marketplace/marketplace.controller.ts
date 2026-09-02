// apps/api/src/marketplace/marketplace.controller.ts
import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Import JWT guard

@Controller('api/v1/marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('listings')
  async getListings(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.marketplaceService.getMaskedListings(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  // --- ADDED JWT GUARD TO IDENTIFY THE USER ---
  @UseGuards(JwtAuthGuard) 
  @Post('unlock')
  @HttpCode(HttpStatus.OK)
  async initiateUnlock(@Request() req: any, @Body() body: { unit_id: string; phone: string }) {
    // Pass the logged-in user's ID to the service
    return this.marketplaceService.initiateUnlockPayment(body.unit_id, body.phone, req.user.sub);
  }

  @Get('unlock/status')
  async checkUnlockStatus(
    @Query('unit_id') unit_id: string,
    @Query('phone') phone: string,
  ) {
    return this.marketplaceService.getUnlockStatusAndReveal(unit_id, phone);
  }

  @Post('mpesa/callback')
  @HttpCode(HttpStatus.OK)
  async handleMpesaCallback(@Body() payload: any) {
    this.marketplaceService.processMpesaCallback(payload);
    return { ResultCode: 0, ResultDesc: "Accepted" };
  }

  @Post('leads')
  async submitLead(@Body() body: any) {
    return this.marketplaceService.createLead(body);
  }
}