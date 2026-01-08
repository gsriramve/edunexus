import { IsEmail, IsString, IsOptional, IsObject, IsEnum, IsNumber } from 'class-validator';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WHATSAPP = 'whatsapp',
}

export enum EmailTemplateType {
  PAYMENT_RECEIPT = 'payment_receipt',
  FEE_REMINDER = 'fee_reminder',
  FEE_OVERDUE = 'fee_overdue',
  WELCOME = 'welcome',
  ATTENDANCE_ALERT = 'attendance_alert',
  EXAM_SCHEDULE = 'exam_schedule',
  RESULT_PUBLISHED = 'result_published',
  INVITATION = 'invitation',
  CUSTOM = 'custom',
}

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsEnum(EmailTemplateType)
  templateType: EmailTemplateType;

  @IsObject()
  @IsOptional()
  templateData?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  customHtml?: string;

  @IsString()
  @IsOptional()
  customText?: string;
}

export class SendBulkEmailDto {
  @IsEmail({}, { each: true })
  recipients: string[];

  @IsString()
  subject: string;

  @IsEnum(EmailTemplateType)
  templateType: EmailTemplateType;

  @IsObject()
  @IsOptional()
  templateData?: Record<string, unknown>;
}

export class PaymentNotificationDto {
  @IsString()
  studentId: string;

  @IsString()
  studentName: string;

  @IsEmail()
  studentEmail: string;

  @IsEmail()
  @IsOptional()
  parentEmail?: string;

  @IsString()
  @IsOptional()
  parentName?: string;

  @IsNumber()
  amount: number;

  @IsString()
  feeType: string;

  @IsString()
  @IsOptional()
  paymentId?: string;

  @IsString()
  @IsOptional()
  receiptNumber?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}

export class FeeReminderDto {
  @IsString()
  studentId: string;

  @IsString()
  studentName: string;

  @IsEmail()
  @IsOptional()
  studentEmail?: string;

  @IsEmail()
  parentEmail: string;

  @IsString()
  parentName: string;

  @IsNumber()
  amount: number;

  @IsString()
  feeType: string;

  @IsString()
  dueDate: string;

  @IsString()
  @IsOptional()
  semester?: string;
}

export class NotificationResultDto {
  success: boolean;
  messageId?: string;
  error?: string;
}
