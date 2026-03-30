// apps/api/src/auth/guards/jwt-auth.guard.ts
/* eslint-disable */
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // 1. Try to get the token from the secure HTTP-Only cookie first
    let token = request.cookies?.['access_token'];
    
    // 2. Fallback: Check headers (useful if you are testing in Postman)
    if (!token) {
      const [type, headerToken] = request.headers.authorization?.split(' ') ?? [];
      token = type === 'Bearer' ? headerToken : undefined;
    }
    
    if (!token) {
      throw new UnauthorizedException('Please log in first');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token, { 
        secret: process.env.JWT_SECRET || 'super-secret-development-key' 
      });
      request['user'] = payload; // Attach user payload to the request
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    
    return true;
  }
}