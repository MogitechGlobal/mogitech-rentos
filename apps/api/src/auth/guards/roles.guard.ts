// apps/api/src/auth/guards/roles.guard.ts
/* eslint-disable */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check what roles are required for this specific route
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no specific roles are required, let them through (JwtAuthGuard still protects it)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    // Grab the user payload attached to the request by the JwtAuthGuard
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('Access Denied: No user payload found.');
    }

    // --- MULTI-WORKSPACE FIX: Compute Effective Roles ---
    // Fetch the user from the database to see ALL their attached profiles
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { 
        role: true, 
        landlord: true, 
        staff: true, 
        tenant: true 
      }
    });

    if (!dbUser) {
      throw new ForbiddenException('Access Denied: User record not found.');
    }

    const effectiveRoles = new Set<string>();
    
    // 1. Add their primary system role
    if (dbUser.role) {
      effectiveRoles.add(dbUser.role.name);
    }
    
    // 2. Add dynamic workspace roles based on attached profiles
    if (dbUser.landlord) {
      effectiveRoles.add('LANDLORD');
    }
    if (dbUser.tenant) {
      effectiveRoles.add('TENANT');
    }
    if (dbUser.staff) {
      effectiveRoles.add('STAFF');
      // Add specific staff designation (e.g., CARETAKER, FINANCE, VENDOR)
      if (dbUser.staff.role_type) {
        effectiveRoles.add(dbUser.staff.role_type);
      }
    }

    // Optional: Attach effective roles back to the request for downstream controllers
    request.user.effectiveRoles = Array.from(effectiveRoles);

    // 3. Check if ANY of their effective roles match the required roles
    const hasAccess = requiredRoles.some((role) => effectiveRoles.has(role));

    if (!hasAccess) {
      throw new ForbiddenException(
        `Access Denied: Requires one of [${requiredRoles.join(', ')}]. You have [${Array.from(effectiveRoles).join(', ')}].`
      );
    }
    
    return true;
  }
}