import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
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

export enum AnnouncementType {
  GENERAL = 'general',
  ACADEMIC = 'academic',
  EVENT = 'event',
  URGENT = 'urgent',
  HOLIDAY = 'holiday',
  EXAM = 'exam',
  FEE = 'fee',
  PLACEMENT = 'placement',
}

export enum AnnouncementPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AnnouncementAudience {
  ALL = 'all',
  STUDENTS = 'students',
  STAFF = 'staff',
  PARENTS = 'parents',
  DEPARTMENT = 'department',
  COURSE = 'course',
  BATCH = 'batch',
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum MessageType {
  SMS = 'sms',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
}

export enum TemplateCategory {
  FEE_REMINDER = 'fee_reminder',
  ATTENDANCE_ALERT = 'attendance_alert',
  EXAM_NOTIFICATION = 'exam_notification',
  RESULT_NOTIFICATION = 'result_notification',
  EVENT_INVITATION = 'event_invitation',
  GENERAL = 'general',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
}

export enum CommunicationStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

// =============================================================================
// ANNOUNCEMENT DTOs
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

export class AudienceFiltersDto {
  @IsArray()
  @IsOptional()
  departmentIds?: string[];

  @IsArray()
  @IsOptional()
  courseIds?: string[];

  @IsArray()
  @IsOptional()
  batchYears?: number[];

  @IsArray()
  @IsOptional()
  roles?: string[];
}

export class CreateAnnouncementDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsEnum(AnnouncementType)
  type: AnnouncementType;

  @IsEnum(AnnouncementPriority)
  @IsOptional()
  priority?: AnnouncementPriority;

  @IsEnum(AnnouncementAudience)
  audience: AnnouncementAudience;

  @IsObject()
  @IsOptional()
  audienceFilters?: AudienceFiltersDto;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @IsBoolean()
  @IsOptional()
  allowComments?: boolean;

  @IsString()
  createdById: string;

  @IsEnum(AnnouncementStatus)
  @IsOptional()
  status?: AnnouncementStatus;
}

export class UpdateAnnouncementDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  content?: string;

  @IsEnum(AnnouncementType)
  @IsOptional()
  type?: AnnouncementType;

  @IsEnum(AnnouncementPriority)
  @IsOptional()
  priority?: AnnouncementPriority;

  @IsEnum(AnnouncementAudience)
  @IsOptional()
  audience?: AnnouncementAudience;

  @IsObject()
  @IsOptional()
  audienceFilters?: AudienceFiltersDto;

  @IsArray()
  @IsOptional()
  attachments?: AttachmentDto[];

  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @IsBoolean()
  @IsOptional()
  allowComments?: boolean;

  @IsEnum(AnnouncementStatus)
  @IsOptional()
  status?: AnnouncementStatus;
}

export class AnnouncementQueryDto {
  @IsOptional()
  search?: string;

  @IsEnum(AnnouncementType)
  @IsOptional()
  type?: AnnouncementType;

  @IsEnum(AnnouncementAudience)
  @IsOptional()
  audience?: AnnouncementAudience;

  @IsEnum(AnnouncementStatus)
  @IsOptional()
  status?: AnnouncementStatus;

  @IsEnum(AnnouncementPriority)
  @IsOptional()
  priority?: AnnouncementPriority;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  pinnedOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  activeOnly?: boolean;

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
// ANNOUNCEMENT RECIPIENT DTOs
// =============================================================================

export class MarkAnnouncementReadDto {
  @IsString()
  announcementId: string;

  @IsString()
  userId: string;

  @IsString()
  userType: string;
}

export class AcknowledgeAnnouncementDto {
  @IsString()
  announcementId: string;

  @IsString()
  userId: string;
}

// =============================================================================
// ANNOUNCEMENT COMMENT DTOs
// =============================================================================

export class CreateCommentDto {
  @IsString()
  announcementId: string;

  @IsString()
  userId: string;

  @IsString()
  userType: string;

  @IsString()
  userName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

// =============================================================================
// MESSAGE TEMPLATE DTOs
// =============================================================================

export class TemplateVariableDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateTemplateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsEnum(TemplateCategory)
  category: TemplateCategory;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TemplateVariableDto)
  variables?: TemplateVariableDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  content?: string;

  @IsArray()
  @IsOptional()
  variables?: TemplateVariableDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class TemplateQueryDto {
  @IsOptional()
  search?: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsEnum(TemplateCategory)
  @IsOptional()
  category?: TemplateCategory;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  activeOnly?: boolean;

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
// BULK COMMUNICATION DTOs
// =============================================================================

export class BulkCommunicationFiltersDto {
  @IsArray()
  @IsOptional()
  departmentIds?: string[];

  @IsArray()
  @IsOptional()
  courseIds?: string[];

  @IsArray()
  @IsOptional()
  batchYears?: number[];

  @IsBoolean()
  @IsOptional()
  feeDefaulters?: boolean;

  @IsBoolean()
  @IsOptional()
  lowAttendance?: boolean;

  @IsArray()
  @IsOptional()
  studentIds?: string[];
}

export class CreateBulkCommunicationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsString()
  audience: string; // all, students, staff, parents, custom

  @IsObject()
  @IsOptional()
  audienceFilters?: BulkCommunicationFiltersDto;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  createdById: string;
}

export class UpdateBulkCommunicationDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  content?: string;

  @IsObject()
  @IsOptional()
  audienceFilters?: BulkCommunicationFiltersDto;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsEnum(CommunicationStatus)
  @IsOptional()
  status?: CommunicationStatus;
}

export class BulkCommunicationQueryDto {
  @IsOptional()
  search?: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsEnum(CommunicationStatus)
  @IsOptional()
  status?: CommunicationStatus;

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
// COMMUNICATION LOG DTOs
// =============================================================================

export class CreateCommunicationLogDto {
  @IsString()
  @IsOptional()
  bulkCommunicationId?: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsString()
  @IsOptional()
  recipientId?: string;

  @IsString()
  @IsOptional()
  recipientType?: string;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsString()
  recipientContact: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  content: string;

  @IsObject()
  @IsOptional()
  variables?: Record<string, string>;
}

export class CommunicationLogQueryDto {
  @IsString()
  @IsOptional()
  bulkCommunicationId?: string;

  @IsString()
  @IsOptional()
  recipientId?: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsEnum(MessageStatus)
  @IsOptional()
  status?: MessageStatus;

  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
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

// =============================================================================
// SEND MESSAGE DTOs
// =============================================================================

export class SendSingleMessageDto {
  @IsEnum(MessageType)
  type: MessageType;

  @IsString()
  recipientContact: string;

  @IsString()
  @IsOptional()
  recipientId?: string;

  @IsString()
  @IsOptional()
  recipientType?: string;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsString()
  @IsOptional()
  templateCode?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsObject()
  @IsOptional()
  variables?: Record<string, string>;
}

export class SendBulkDto {
  @IsString()
  bulkCommunicationId: string;
}
