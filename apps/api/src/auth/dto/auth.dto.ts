// apps/api/src/auth/dto/auth.dto.ts
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsString()
  roleName!: string; // e.g., 'LANDLORD' or 'TENANT'

  // --- NEW FIELDS ---
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  first_name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  last_name!: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email!: string;

  @IsString()
  password!: string;
}
