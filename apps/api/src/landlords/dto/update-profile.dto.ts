// apps/api/src/landlords/dto/update-profile.dto.ts
import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  companyAddress?: string;

  @IsString()
  @IsOptional()
  currency?: string;

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

  @IsString()
  @IsOptional()
  companyLogoBase64?: string;
}
