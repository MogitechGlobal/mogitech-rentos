import { IsString, IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateLeadDto {
  @IsUUID()
  @IsNotEmpty()
  unit_id!: string;

  @IsString()
  @IsNotEmpty()
  prospect_name!: string;

  @IsEmail()
  @IsNotEmpty()
  prospect_email!: string;

  @IsString()
  @IsNotEmpty()
  prospect_phone!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}