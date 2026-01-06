import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsISBN,
} from 'class-validator';
import { Type } from 'class-transformer';

// =============================================================================
// ENUMS
// =============================================================================

export enum BookStatus {
  AVAILABLE = 'available',
  LIMITED = 'limited',
  UNAVAILABLE = 'unavailable',
}

export enum CardStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  LOST = 'lost',
}

export enum IssueStatus {
  ISSUED = 'issued',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
}

export enum ReservationStatus {
  PENDING = 'pending',
  READY = 'ready',
  COLLECTED = 'collected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum ResourceType {
  EBOOK = 'ebook',
  JOURNAL = 'journal',
  PAPER = 'paper',
  VIDEO = 'video',
  COURSE = 'course',
}

export enum AccessType {
  OPEN = 'open',
  RESTRICTED = 'restricted',
  SUBSCRIPTION = 'subscription',
}

// =============================================================================
// CATEGORY DTOs
// =============================================================================

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

// =============================================================================
// BOOK DTOs
// =============================================================================

export class CreateBookDto {
  @IsString()
  categoryId: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  author: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  publisher?: string;

  @IsNumber()
  @IsOptional()
  @Min(1800)
  @Max(2030)
  publishYear?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  edition?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  language?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  pages?: number;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  location?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(1000)
  totalCopies?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(500)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  author?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  publisher?: string;

  @IsNumber()
  @IsOptional()
  @Min(1800)
  @Max(2030)
  publishYear?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  edition?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  language?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  pages?: number;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  location?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(1000)
  totalCopies?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(BookStatus)
  @IsOptional()
  status?: BookStatus;
}

export class BookQueryDto {
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsEnum(BookStatus)
  @IsOptional()
  status?: BookStatus;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  availableOnly?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// LIBRARY CARD DTOs
// =============================================================================

export class CreateCardDto {
  @IsString()
  @IsOptional()
  studentId?: string;

  @IsString()
  @IsOptional()
  staffId?: string;

  @IsDateString()
  expiryDate: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(20)
  maxBooks?: number;
}

export class UpdateCardDto {
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(20)
  maxBooks?: number;

  @IsEnum(CardStatus)
  @IsOptional()
  status?: CardStatus;
}

export class CardQueryDto {
  @IsOptional()
  search?: string;

  @IsEnum(CardStatus)
  @IsOptional()
  status?: CardStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// BOOK ISSUE DTOs
// =============================================================================

export class IssueBookDto {
  @IsString()
  bookId: string;

  @IsString()
  cardId: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(60)
  loanDays?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;
}

export class ReturnBookDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;

  @IsBoolean()
  @IsOptional()
  waiveFine?: boolean;
}

export class RenewBookDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30)
  additionalDays?: number;
}

export class IssueQueryDto {
  @IsString()
  @IsOptional()
  bookId?: string;

  @IsString()
  @IsOptional()
  cardId?: string;

  @IsEnum(IssueStatus)
  @IsOptional()
  status?: IssueStatus;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  overdueOnly?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// RESERVATION DTOs
// =============================================================================

export class CreateReservationDto {
  @IsString()
  bookId: string;

  @IsString()
  cardId: string;
}

export class ReservationQueryDto {
  @IsString()
  @IsOptional()
  bookId?: string;

  @IsString()
  @IsOptional()
  cardId?: string;

  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// E-RESOURCE DTOs
// =============================================================================

export class CreateEResourceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  author?: string;

  @IsEnum(ResourceType)
  type: ResourceType;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  format?: string;

  @IsEnum(AccessType)
  @IsOptional()
  accessType?: AccessType;

  @IsString()
  @IsOptional()
  subjectId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  publisher?: string;

  @IsNumber()
  @IsOptional()
  @Min(1800)
  @Max(2030)
  publishYear?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateEResourceDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(500)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  author?: string;

  @IsEnum(ResourceType)
  @IsOptional()
  type?: ResourceType;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsEnum(AccessType)
  @IsOptional()
  accessType?: AccessType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  status?: string;
}

export class EResourceQueryDto {
  @IsOptional()
  search?: string;

  @IsEnum(ResourceType)
  @IsOptional()
  type?: ResourceType;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(AccessType)
  @IsOptional()
  accessType?: AccessType;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// SETTINGS DTOs
// =============================================================================

export class UpdateSettingsDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  finePerDay?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10000)
  maxFineAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(60)
  loanPeriodDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30)
  renewalPeriodDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  maxRenewals?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(14)
  reservationDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(7)
  gracePeriodDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  lostBookMultiplier?: number;
}
