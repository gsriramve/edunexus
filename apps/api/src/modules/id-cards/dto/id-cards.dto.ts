import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum IdCardStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export class GenerateIdCardDto {
  @IsDateString()
  @IsOptional()
  validUntil?: string; // Defaults to end of academic year if not provided
}

export class BulkGenerateIdCardsDto {
  @IsArray()
  @IsString({ each: true })
  studentIds: string[];

  @IsDateString()
  @IsOptional()
  validUntil?: string;
}

export class RevokeIdCardDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class IdCardQueryDto {
  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  batch?: string;

  @IsEnum(IdCardStatus)
  @IsOptional()
  status?: IdCardStatus;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number;
}

export class IdCardResponse {
  id: string;
  tenantId: string;
  studentId: string;
  cardNumber: string;
  issueDate: Date;
  validUntil: Date;
  qrVerificationToken: string;
  status: string;
  cachedName: string;
  cachedRollNo: string;
  cachedDepartment: string;
  cachedBatch: string;
  cachedBloodGroup?: string;
  cachedPhotoUrl?: string;
  pdfGeneratedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    rollNo: string;
    batch: string;
    semester: number;
    section?: string;
    user: {
      name: string;
      email: string;
    };
    department: {
      name: string;
      code: string;
    };
  };
}

export class IdCardVerificationResponse {
  valid: boolean;
  message: string;
  card?: {
    cardNumber: string;
    studentName: string;
    rollNo: string;
    department: string;
    batch: string;
    status: string;
    validUntil: Date;
    photoUrl?: string;
  };
  collegeName?: string;
}

export class BulkGenerateResponse {
  total: number;
  generated: number;
  skipped: number;
  errors: Array<{
    studentId: string;
    error: string;
  }>;
  cards: IdCardResponse[];
}

export class IdCardStatsResponse {
  totalCards: number;
  activeCards: number;
  expiredCards: number;
  revokedCards: number;
  cardsByDepartment: Record<string, number>;
  cardsByBatch: Record<string, number>;
  recentlyGenerated: IdCardResponse[];
}
