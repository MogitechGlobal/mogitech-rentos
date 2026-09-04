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
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('Access Denied: No user payload found.');
    }

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
    
    if (dbUser.role) {
      effectiveRoles.add(dbUser.role.name);
    }
    if (dbUser.landlord) {
      effectiveRoles.add('LANDLORD');
    }
    if (dbUser.tenant) {
      effectiveRoles.add('TENANT');
    }
    if (dbUser.staff) {
      effectiveRoles.add('STAFF');
      if (dbUser.staff.role_type) {
        effectiveRoles.add(dbUser.staff.role_type);
      }
    }

    request.user.effectiveRoles = Array.from(effectiveRoles);

    // --- CRITICAL FIX: UNIVERSAL ADMIN ACCESS ---
    // If the user is an ADMIN, they automatically pass all role checks 
    // and will no longer receive 403 Forbidden errors on landlord routes.
    if (effectiveRoles.has('ADMIN') || effectiveRoles.has('SUPER_ADMIN')) {
      return true;
    }

    const hasAccess = requiredRoles.some((role) => effectiveRoles.has(role));

    if (!hasAccess) {
      throw new ForbiddenException(
        `Access Denied: Requires one of [${requiredRoles.join(', ')}]. You have [${Array.from(effectiveRoles).join(', ')}].`
      );
    }
    
    return true;
  }
}