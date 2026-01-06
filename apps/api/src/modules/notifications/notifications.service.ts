import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { EMAIL_QUEUE } from './processors/email.processor';
import { SMS_QUEUE } from './processors/sms.processor';
import { PUSH_QUEUE } from './processors/push.processor';
import type { EmailJobData } from './processors/email.processor';
import type { SmsJobData } from './processors/sms.processor';
import type { PushJobData } from './processors/push.processor';
import { EmailService } from './email.service';
import { SmsService, SendSmsDto, SendBulkSmsDto, SmsResult } from './sms.service';
import { PushService, PushNotificationPayload, PushResult } from './push.service';
import { SmsTemplateType } from './templates/sms-templates';
import {
  SendEmailDto,
  SendBulkEmailDto,
  PaymentNotificationDto,
  FeeReminderDto,
  NotificationResultDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private emailQueueEnabled = false;
  private smsQueueEnabled = false;
  private pushQueueEnabled = false;

  constructor(
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue<EmailJobData>,
    @InjectQueue(SMS_QUEUE) private readonly smsQueue: Queue<SmsJobData>,
    @InjectQueue(PUSH_QUEUE) private readonly pushQueue: Queue<PushJobData>,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
  ) {
    this.checkQueueConnections();
  }

  private async checkQueueConnections() {
    // Check email queue
    try {
      await this.emailQueue.isReady();
      this.emailQueueEnabled = true;
      this.logger.log('Email queue connected to Redis');
    } catch (error) {
      this.emailQueueEnabled = false;
      this.logger.warn('Email queue not available. Emails will be sent synchronously.');
    }

    // Check SMS queue
    try {
      await this.smsQueue.isReady();
      this.smsQueueEnabled = true;
      this.logger.log('SMS queue connected to Redis');
    } catch (error) {
      this.smsQueueEnabled = false;
      this.logger.warn('SMS queue not available. SMS will be sent synchronously.');
    }

    // Check push queue
    try {
      await this.pushQueue.isReady();
      this.pushQueueEnabled = true;
      this.logger.log('Push queue connected to Redis');
    } catch (error) {
      this.pushQueueEnabled = false;
      this.logger.warn('Push queue not available. Push notifications will be sent synchronously.');
    }
  }

  // ==================== EMAIL METHODS ====================

  async queueEmail(dto: SendEmailDto): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.emailQueueEnabled) {
      const result = await this.emailService.sendEmail(dto);
      return { queued: false, jobId: result.messageId };
    }

    const job = await this.emailQueue.add('send', {
      type: 'single',
      payload: dto,
    });

    this.logger.log(`Email queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueBulkEmail(dto: SendBulkEmailDto): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.emailQueueEnabled) {
      await this.emailService.sendBulkEmail(dto);
      return { queued: false };
    }

    const job = await this.emailQueue.add('send', {
      type: 'bulk',
      payload: dto,
    });

    this.logger.log(`Bulk email queued: ${job.id} (${dto.recipients.length} recipients)`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queuePaymentReceipt(dto: PaymentNotificationDto): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.emailQueueEnabled) {
      await this.emailService.sendPaymentReceipt(dto);
      return { queued: false };
    }

    const job = await this.emailQueue.add('send', {
      type: 'payment_receipt',
      payload: dto,
    });

    this.logger.log(`Payment receipt email queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueFeeReminder(dto: FeeReminderDto): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.emailQueueEnabled) {
      await this.emailService.sendFeeReminder(dto);
      return { queued: false };
    }

    const job = await this.emailQueue.add('send', {
      type: 'fee_reminder',
      payload: dto,
    });

    this.logger.log(`Fee reminder email queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueFeeOverdueNotice(dto: FeeReminderDto): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.emailQueueEnabled) {
      await this.emailService.sendFeeOverdueNotice(dto);
      return { queued: false };
    }

    const job = await this.emailQueue.add('send', {
      type: 'fee_overdue',
      payload: dto,
    });

    this.logger.log(`Fee overdue email queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueWelcomeEmail(
    email: string,
    studentName: string,
    collegeName: string,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.emailQueueEnabled) {
      await this.emailService.sendWelcomeEmail(email, studentName, collegeName);
      return { queued: false };
    }

    const job = await this.emailQueue.add('send', {
      type: 'welcome',
      payload: { email, studentName, collegeName },
    });

    this.logger.log(`Welcome email queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueAttendanceAlertEmail(
    parentEmail: string,
    parentName: string,
    studentName: string,
    attendancePercentage: number,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.emailQueueEnabled) {
      await this.emailService.sendAttendanceAlert(parentEmail, parentName, studentName, attendancePercentage);
      return { queued: false };
    }

    const job = await this.emailQueue.add('send', {
      type: 'attendance_alert',
      payload: { parentEmail, parentName, studentName, attendancePercentage },
    });

    this.logger.log(`Attendance alert email queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async scheduleEmail(
    dto: SendEmailDto,
    delay: number,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.emailQueueEnabled) {
      this.logger.warn('Queue not available. Scheduled email will be sent immediately.');
      const result = await this.emailService.sendEmail(dto);
      return { queued: false, jobId: result.messageId };
    }

    const job = await this.emailQueue.add(
      'send-scheduled',
      { type: 'single', payload: dto },
      { delay },
    );

    this.logger.log(`Email scheduled: ${job.id} (delay: ${delay}ms)`);
    return { queued: true, jobId: job.id.toString() };
  }

  // Direct email send (bypass queue)
  async sendEmailNow(dto: SendEmailDto): Promise<NotificationResultDto> {
    return this.emailService.sendEmail(dto);
  }

  async sendPaymentReceiptNow(dto: PaymentNotificationDto): Promise<NotificationResultDto[]> {
    return this.emailService.sendPaymentReceipt(dto);
  }

  async sendFeeReminderNow(dto: FeeReminderDto): Promise<NotificationResultDto[]> {
    return this.emailService.sendFeeReminder(dto);
  }

  // ==================== SMS METHODS ====================

  async queueSms(dto: SendSmsDto): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.smsQueueEnabled) {
      const result = await this.smsService.sendSms(dto);
      return { queued: false, jobId: result.messageId };
    }

    const job = await this.smsQueue.add('send', {
      type: 'single',
      payload: dto,
    });

    this.logger.log(`SMS queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueBulkSms(dto: SendBulkSmsDto): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.smsQueueEnabled) {
      await this.smsService.sendBulkSms(dto);
      return { queued: false };
    }

    const job = await this.smsQueue.add('send', {
      type: 'bulk',
      payload: dto,
    });

    this.logger.log(`Bulk SMS queued: ${job.id} (${dto.recipients.length} recipients)`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queuePaymentConfirmationSms(
    phone: string,
    studentName: string,
    amount: number,
    feeType: string,
    receiptNumber: string,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.smsQueueEnabled) {
      await this.smsService.sendPaymentConfirmation(phone, studentName, amount, feeType, receiptNumber);
      return { queued: false };
    }

    const job = await this.smsQueue.add('send', {
      type: 'payment_confirmation',
      payload: { phone, studentName, amount, feeType, receiptNumber },
    });

    this.logger.log(`Payment confirmation SMS queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueFeeReminderSms(
    phone: string,
    studentName: string,
    amount: number,
    feeType: string,
    dueDate: string,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.smsQueueEnabled) {
      await this.smsService.sendFeeReminder(phone, studentName, amount, feeType, dueDate);
      return { queued: false };
    }

    const job = await this.smsQueue.add('send', {
      type: 'fee_reminder',
      payload: { phone, studentName, amount, feeType, dueDate },
    });

    this.logger.log(`Fee reminder SMS queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueFeeOverdueSms(
    phone: string,
    studentName: string,
    amount: number,
    feeType: string,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.smsQueueEnabled) {
      await this.smsService.sendFeeOverdue(phone, studentName, amount, feeType);
      return { queued: false };
    }

    const job = await this.smsQueue.add('send', {
      type: 'fee_overdue',
      payload: { phone, studentName, amount, feeType },
    });

    this.logger.log(`Fee overdue SMS queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueAttendanceAlertSms(
    phone: string,
    studentName: string,
    attendancePercentage: number,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.smsQueueEnabled) {
      await this.smsService.sendAttendanceAlert(phone, studentName, attendancePercentage);
      return { queued: false };
    }

    const job = await this.smsQueue.add('send', {
      type: 'attendance_alert',
      payload: { phone, studentName, attendancePercentage },
    });

    this.logger.log(`Attendance alert SMS queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueOtpSms(phone: string, otp: string): Promise<{ queued: boolean; jobId?: string }> {
    // OTP should be sent immediately, not queued
    const result = await this.smsService.sendOtp(phone, otp);
    return { queued: false, jobId: result.messageId };
  }

  async queueWelcomeSms(
    phone: string,
    studentName: string,
    collegeName: string,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.smsQueueEnabled) {
      await this.smsService.sendWelcome(phone, studentName, collegeName);
      return { queued: false };
    }

    const job = await this.smsQueue.add('send', {
      type: 'welcome',
      payload: { phone, studentName, collegeName },
    });

    this.logger.log(`Welcome SMS queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  // Direct SMS send (bypass queue)
  async sendSmsNow(dto: SendSmsDto): Promise<SmsResult> {
    return this.smsService.sendSms(dto);
  }

  async sendOtpNow(phone: string, otp: string): Promise<SmsResult> {
    return this.smsService.sendOtp(phone, otp);
  }

  // ==================== COMBINED NOTIFICATIONS ====================

  // Send both email and SMS for payment confirmation
  async notifyPaymentSuccess(
    email: string,
    phone: string,
    studentName: string,
    amount: number,
    feeType: string,
    receiptNumber: string,
    parentEmail?: string,
    parentName?: string,
  ): Promise<{ email: { queued: boolean }; sms: { queued: boolean } }> {
    const [emailResult, smsResult] = await Promise.all([
      this.queuePaymentReceipt({
        studentId: '',
        studentName,
        studentEmail: email,
        parentEmail,
        parentName,
        amount,
        feeType,
        receiptNumber,
      }),
      this.queuePaymentConfirmationSms(phone, studentName, amount, feeType, receiptNumber),
    ]);

    return { email: emailResult, sms: smsResult };
  }

  // Send both email and SMS for fee reminder
  async notifyFeeReminder(
    email: string,
    phone: string,
    studentName: string,
    parentName: string,
    amount: number,
    feeType: string,
    dueDate: string,
  ): Promise<{ email: { queued: boolean }; sms: { queued: boolean } }> {
    const [emailResult, smsResult] = await Promise.all([
      this.queueFeeReminder({
        studentId: '',
        studentName,
        parentEmail: email,
        parentName,
        amount,
        feeType,
        dueDate,
      }),
      this.queueFeeReminderSms(phone, studentName, amount, feeType, dueDate),
    ]);

    return { email: emailResult, sms: smsResult };
  }

  // ==================== PUSH NOTIFICATION METHODS ====================

  async registerDeviceToken(
    userId: string,
    tenantId: string,
    token: string,
    deviceInfo?: {
      deviceType?: string;
      deviceName?: string;
      deviceModel?: string;
      appVersion?: string;
    },
  ) {
    return this.pushService.registerDeviceToken(userId, tenantId, token, deviceInfo);
  }

  async unregisterDeviceToken(token: string) {
    return this.pushService.unregisterDeviceToken(token);
  }

  async queuePushNotification(
    userId: string,
    tenantId: string,
    notification: PushNotificationPayload,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.pushQueueEnabled) {
      const result = await this.pushService.sendPushNotification({ userId, tenantId, notification });
      return { queued: false, jobId: result.messageId };
    }

    const job = await this.pushQueue.add('send', {
      type: 'single',
      payload: { userId, tenantId, notification },
    });

    this.logger.log(`Push notification queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueBulkPushNotification(
    userIds: string[],
    tenantId: string,
    notification: PushNotificationPayload,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.pushQueueEnabled) {
      const result = await this.pushService.sendBulkPushNotification({ userIds, tenantId, notification });
      return { queued: false, jobId: result.messageId };
    }

    const job = await this.pushQueue.add('send', {
      type: 'bulk',
      payload: { userIds, tenantId, notification },
    });

    this.logger.log(`Bulk push notification queued: ${job.id} (${userIds.length} users)`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queuePaymentSuccessPush(
    userId: string,
    tenantId: string,
    studentName: string,
    amount: number,
    receiptNumber: string,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.pushQueueEnabled) {
      await this.pushService.sendPaymentSuccessPush(userId, tenantId, studentName, amount, receiptNumber);
      return { queued: false };
    }

    const job = await this.pushQueue.add('send', {
      type: 'payment_success',
      payload: { userId, tenantId, studentName, amount, receiptNumber },
    });

    this.logger.log(`Payment success push queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueFeeReminderPush(
    userId: string,
    tenantId: string,
    studentName: string,
    amount: number,
    dueDate: string,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.pushQueueEnabled) {
      await this.pushService.sendFeeReminderPush(userId, tenantId, studentName, amount, dueDate);
      return { queued: false };
    }

    const job = await this.pushQueue.add('send', {
      type: 'fee_reminder',
      payload: { userId, tenantId, studentName, amount, dueDate },
    });

    this.logger.log(`Fee reminder push queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueFeeOverduePush(
    userId: string,
    tenantId: string,
    studentName: string,
    amount: number,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.pushQueueEnabled) {
      await this.pushService.sendFeeOverduePush(userId, tenantId, studentName, amount);
      return { queued: false };
    }

    const job = await this.pushQueue.add('send', {
      type: 'fee_overdue',
      payload: { userId, tenantId, studentName, amount },
    });

    this.logger.log(`Fee overdue push queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueAttendanceAlertPush(
    userId: string,
    tenantId: string,
    studentName: string,
    percentage: number,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.pushQueueEnabled) {
      await this.pushService.sendAttendanceAlertPush(userId, tenantId, studentName, percentage);
      return { queued: false };
    }

    const job = await this.pushQueue.add('send', {
      type: 'attendance_alert',
      payload: { userId, tenantId, studentName, percentage },
    });

    this.logger.log(`Attendance alert push queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueExamResultPush(
    userId: string,
    tenantId: string,
    examName: string,
    subjectName: string,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.pushQueueEnabled) {
      await this.pushService.sendExamResultPush(userId, tenantId, examName, subjectName);
      return { queued: false };
    }

    const job = await this.pushQueue.add('send', {
      type: 'exam_result',
      payload: { userId, tenantId, examName, subjectName },
    });

    this.logger.log(`Exam result push queued: ${job.id}`);
    return { queued: true, jobId: job.id.toString() };
  }

  async queueAnnouncementPush(
    userIds: string[],
    tenantId: string,
    title: string,
    message: string,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.pushQueueEnabled) {
      await this.pushService.sendAnnouncementPush(userIds, tenantId, title, message);
      return { queued: false };
    }

    const job = await this.pushQueue.add('send', {
      type: 'announcement',
      payload: { userIds, tenantId, title, message },
    });

    this.logger.log(`Announcement push queued: ${job.id} (${userIds.length} users)`);
    return { queued: true, jobId: job.id.toString() };
  }

  // Direct push send (bypass queue)
  async sendPushNow(
    userId: string,
    tenantId: string,
    notification: PushNotificationPayload,
  ): Promise<PushResult> {
    return this.pushService.sendPushNotification({ userId, tenantId, notification });
  }

  // ==================== QUEUE STATISTICS ====================

  async getQueueStats() {
    const stats: any = {
      email: { enabled: false },
      sms: { enabled: false },
      push: { enabled: false },
    };

    if (this.emailQueueEnabled) {
      const [waiting, active, completed, failed] = await Promise.all([
        this.emailQueue.getWaitingCount(),
        this.emailQueue.getActiveCount(),
        this.emailQueue.getCompletedCount(),
        this.emailQueue.getFailedCount(),
      ]);
      stats.email = { enabled: true, waiting, active, completed, failed };
    }

    if (this.smsQueueEnabled) {
      const [waiting, active, completed, failed] = await Promise.all([
        this.smsQueue.getWaitingCount(),
        this.smsQueue.getActiveCount(),
        this.smsQueue.getCompletedCount(),
        this.smsQueue.getFailedCount(),
      ]);
      stats.sms = { enabled: true, waiting, active, completed, failed };
    }

    if (this.pushQueueEnabled) {
      const [waiting, active, completed, failed] = await Promise.all([
        this.pushQueue.getWaitingCount(),
        this.pushQueue.getActiveCount(),
        this.pushQueue.getCompletedCount(),
        this.pushQueue.getFailedCount(),
      ]);
      stats.push = { enabled: true, waiting, active, completed, failed };
    }

    return stats;
  }

  async getSmsBalance() {
    return this.smsService.getBalance();
  }
}
