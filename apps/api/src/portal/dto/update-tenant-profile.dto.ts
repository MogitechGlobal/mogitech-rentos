// apps/api/src/portal/dto/update-tenant-profile.dto.ts
import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class UpdateTenantProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  emergencyName?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @IsBoolean()
  @IsOptional()
  notifications?: boolean;

  @IsBoolean()
  @IsOptional()
  twoFactorAuth?: boolean;

  @IsString()
  @IsOptional()
  currentPassword?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword?: string;

  @IsString()
  @IsOptional()
  avatarBase64?: string;
}
