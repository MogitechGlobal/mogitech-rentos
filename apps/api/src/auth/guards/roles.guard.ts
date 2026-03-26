// apps/api/src/auth/guards/roles.guard.ts
/* eslint-disable */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check what roles are required for this specific route
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no specific roles are required, let them through (JwtAuthGuard still protects it)
    if (!requiredRoles) {
      return true;
    }
    
    // Grab the user payload attached to the request by the JwtAuthGuard
    const { user } = context.switchToHttp().getRequest();
    
    // If their role isn't in the list of required roles, bounce them!
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access Denied: Your role does not have permission to view this.');
    }
    
    return true;
  }
}
