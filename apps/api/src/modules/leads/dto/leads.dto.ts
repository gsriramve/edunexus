import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({ description: 'Contact person name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Institution/College name' })
  @IsString()
  institutionName: string;

  @ApiPropertyOptional({ description: 'Message from the lead' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Lead source', enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;
}

export class LeadResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  institutionName: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiProperty({ enum: LeadStatus })
  status: LeadStatus;

  @ApiProperty({ enum: LeadSource })
  source: LeadSource;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  notes?: string;
}

export class UpdateLeadDto {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
