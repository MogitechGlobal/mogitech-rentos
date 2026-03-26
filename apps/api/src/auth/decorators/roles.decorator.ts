// apps/api/src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

// This allows us to tag our routes with specific roles (e.g., @Roles('LANDLORD'))
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
