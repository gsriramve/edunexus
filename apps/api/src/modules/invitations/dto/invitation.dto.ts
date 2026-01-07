import { IsString, IsEmail, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string; // If not provided, defaults to 7 days from now
}

export class ResendInvitationDto {
  @IsOptional()
  @IsString()
  message?: string;
}

export class InvitationQueryDto {
  @IsOptional()
  @IsString()
  status?: 'pending' | 'accepted' | 'expired' | 'cancelled';

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  search?: string;
}

export class ValidateTokenDto {
  @IsString()
  token: string;
}
