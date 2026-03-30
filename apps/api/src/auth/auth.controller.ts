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
  Res 
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    // 1. Get the token and user from the service
    const { access_token, user } = await this.authService.register(dto);
    
    // 2. Set the HTTP-Only cookie
    this.setAuthCookie(res, access_token);
    
    // 3. Return ONLY the user data in the JSON body
    return { message: 'Registration successful', user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token, user } = await this.authService.login(dto);
    
    this.setAuthCookie(res, access_token);
    
    return { message: 'Logged in successfully', user };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true, // MUST be true for cross-domain production environments
      sameSite: 'none', // MUST be 'none' to allow Vercel to talk to Render
    });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req: any, @Body() body: { newPassword: string }) {
    await this.authService.changePassword(req.user.sub, body.newPassword);
    return { message: 'Password updated successfully' };
  }

  // --- Helper Method to keep code clean ---
  private setAuthCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,     // JavaScript cannot access this cookie (Prevents XSS)
      secure: true,       // MUST be true for cross-domain production environments
      sameSite: 'none',   // MUST be 'none' to allow cross-origin cookies
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days expiration
    });
  }
}