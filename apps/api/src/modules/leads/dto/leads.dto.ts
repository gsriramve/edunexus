import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  DEMO_SCHEDULED = 'demo_scheduled',
  NEGOTIATION = 'negotiation',
  WON = 'won',
  LOST = 'lost',
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
  EVENT = 'event',
  OTHER = 'other',
}

export class CreateLeadDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  institutionName: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;
}

export class LeadResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  institutionName: string;
  message?: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: Date;
  notes?: string;
}

export class UpdateLeadDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
