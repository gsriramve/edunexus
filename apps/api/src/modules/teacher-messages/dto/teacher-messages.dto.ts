import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  MinLength,
  MaxLength,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// =============================================================================
// ENUMS
// =============================================================================

export enum RecipientType {
  INDIVIDUAL = 'individual',
  CLASS = 'class',
  DEPARTMENT = 'department',
  CUSTOM = 'custom',
}

export enum MessageType {
  GENERAL = 'general',
  QUERY = 'query',
  REQUEST = 'request',
  ANNOUNCEMENT = 'announcement',
  REPLY = 'reply',
}

export enum UserType {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  STAFF = 'staff',
  HOD = 'hod',
  PRINCIPAL = 'principal',
}

// =============================================================================
// DTOs
// =============================================================================

export class AttachmentDto {
  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsString()
  type: string;

  @IsNumber()
  @IsOptional()
  size?: number;
}

export class RecipientDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  type: string;
}

export class SendMessageDto {
  @IsEnum(RecipientType)
  recipientType: RecipientType;

  @IsString()
  @IsOptional()
  recipientId?: string;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsString()
  @IsOptional()
  recipientUserType?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients?: RecipientDto[];

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  messageType?: MessageType;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}

export class ReplyMessageDto {
  @IsString()
  messageId: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}

export class MessageQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(MessageType)
  @IsOptional()
  messageType?: MessageType;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  unreadOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  starredOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  archivedOnly?: boolean;

  @IsString()
  @IsOptional()
  fromDate?: string;

  @IsString()
  @IsOptional()
  toDate?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

export class MarkReadDto {
  @IsArray()
  @IsString({ each: true })
  messageIds: string[];
}

export class BulkActionDto {
  @IsArray()
  @IsString({ each: true })
  messageIds: string[];
}
