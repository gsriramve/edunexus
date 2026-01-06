import { IsString, IsEmail, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';

export enum SubscriptionPlan {
  TRIAL = 'trial',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export class CreateTenantDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  logo?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  principalName: string;

  @IsEmail()
  principalEmail: string;

  @IsEnum(SubscriptionPlan)
  @IsOptional()
  subscriptionPlan?: SubscriptionPlan = SubscriptionPlan.TRIAL;

  @IsOptional()
  estimatedStudents?: number;
}
