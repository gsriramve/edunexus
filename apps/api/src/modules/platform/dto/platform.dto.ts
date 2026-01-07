import { IsString, IsEmail, IsOptional, IsNumber, Min, Max, IsDateString, IsEnum } from 'class-validator';

/**
 * DTO for creating a new tenant with optional principal invitation
 */
export class CreateTenantDto {
  @IsString()
  name: string;

  @IsString()
  domain: string;

  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsEmail()
  principalEmail?: string;

  @IsOptional()
  @IsString()
  principalName?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  trialDays?: number;
}

/**
 * DTO for inviting a principal to a tenant
 */
export class InvitePrincipalDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

/**
 * DTO for extending a tenant's trial
 */
export class ExtendTrialDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  days?: number; // Default 15 days
}

/**
 * DTO for updating tenant status
 */
export class UpdateTenantStatusDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Query DTO for listing tenants
 */
export class TenantQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

/**
 * Query DTO for audit logs
 */
export class AuditLogQueryDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  targetType?: string;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

/**
 * Platform action types for audit logging
 */
export enum PlatformAction {
  TENANT_CREATED = 'TENANT_CREATED',
  TENANT_ACTIVATED = 'TENANT_ACTIVATED',
  TENANT_SUSPENDED = 'TENANT_SUSPENDED',
  TENANT_REACTIVATED = 'TENANT_REACTIVATED',
  TENANT_CANCELLED = 'TENANT_CANCELLED',
  TRIAL_EXTENDED = 'TRIAL_EXTENDED',
  INVITATION_SENT = 'INVITATION_SENT',
  INVITATION_RESENT = 'INVITATION_RESENT',
  INVITATION_CANCELLED = 'INVITATION_CANCELLED',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  PRINCIPAL_ASSIGNED = 'PRINCIPAL_ASSIGNED',
}

/**
 * Target types for audit logging
 */
export enum TargetType {
  TENANT = 'tenant',
  INVITATION = 'invitation',
  USER = 'user',
}
