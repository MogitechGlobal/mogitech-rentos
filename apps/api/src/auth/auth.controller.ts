// apps/api/src/auth/auth.controller.ts
/* eslint-disable */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Res,
  Get
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token, user } = await this.authService.register(dto);

    // Set cookie for Next.js Web App
    this.setAuthCookie(res, access_token);

    // FIX: Return access_token in the JSON body for the Flutter Mobile App
    return { 
      message: 'Registration successful', 
      access_token, 
      user 
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token, user } = await this.authService.login(dto);

    // Set cookie for Next.js Web App
    this.setAuthCookie(res, access_token);

    // FIX: Return access_token in the JSON body for the Flutter Mobile App
    return { 
      message: 'Logged in successfully', 
      access_token, 
      user 
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none', 
    });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req: any, @Body() body: { newPassword: string }) {
    await this.authService.changePassword(req.user.sub, body.newPassword);
    return { message: 'Password updated successfully' };
  }

  private setAuthCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,     
      secure: true,       
      sameSite: 'none',   
      maxAge: 1000 * 60 * 60 * 24 * 7, 
    });
  }

  @Get('system-settings')
  async getSystemSettings() {
    return this.authService.getPublicSystemSettings();
  }
}