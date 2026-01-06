import { Controller, Post, Body, Get, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  SendEmailDto,
  SendBulkEmailDto,
  PaymentNotificationDto,
  FeeReminderDto,
} from './dto/notification.dto';
import { SmsTemplateType } from './templates/sms-templates';
import { PushNotificationPayload } from './push.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==================== QUEUE STATS ====================

  @Get('queue/stats')
  async getQueueStats() {
    return this.notificationsService.getQueueStats();
  }

  @Get('sms/balance')
  async getSmsBalance() {
    return this.notificationsService.getSmsBalance();
  }

  // ==================== EMAIL ENDPOINTS ====================

  @Post('email')
  async sendEmail(@Body() dto: SendEmailDto) {
    return this.notificationsService.queueEmail(dto);
  }

  @Post('email/bulk')
  async sendBulkEmail(@Body() dto: SendBulkEmailDto) {
    return this.notificationsService.queueBulkEmail(dto);
  }

  @Post('email/payment-receipt')
  async sendPaymentReceipt(@Body() dto: PaymentNotificationDto) {
    return this.notificationsService.queuePaymentReceipt(dto);
  }

  @Post('email/fee-reminder')
  async sendFeeReminderEmail(@Body() dto: FeeReminderDto) {
    return this.notificationsService.queueFeeReminder(dto);
  }

  @Post('email/fee-overdue')
  async sendFeeOverdueEmail(@Body() dto: FeeReminderDto) {
    return this.notificationsService.queueFeeOverdueNotice(dto);
  }

  @Post('email/send-now')
  async sendEmailNow(@Body() dto: SendEmailDto) {
    return this.notificationsService.sendEmailNow(dto);
  }

  // ==================== SMS ENDPOINTS ====================

  @Post('sms')
  async sendSms(
    @Body() body: { to: string; templateType: SmsTemplateType; templateData: Record<string, unknown> },
  ) {
    return this.notificationsService.queueSms({
      to: body.to,
      templateType: body.templateType,
      templateData: body.templateData,
    });
  }

  @Post('sms/bulk')
  async sendBulkSms(
    @Body() body: { recipients: string[]; templateType: SmsTemplateType; templateData: Record<string, unknown> },
  ) {
    return this.notificationsService.queueBulkSms({
      recipients: body.recipients,
      templateType: body.templateType,
      templateData: body.templateData,
    });
  }

  @Post('sms/payment-confirmation')
  async sendPaymentConfirmationSms(
    @Body() body: { phone: string; studentName: string; amount: number; feeType: string; receiptNumber: string },
  ) {
    return this.notificationsService.queuePaymentConfirmationSms(
      body.phone,
      body.studentName,
      body.amount,
      body.feeType,
      body.receiptNumber,
    );
  }

  @Post('sms/fee-reminder')
  async sendFeeReminderSms(
    @Body() body: { phone: string; studentName: string; amount: number; feeType: string; dueDate: string },
  ) {
    return this.notificationsService.queueFeeReminderSms(
      body.phone,
      body.studentName,
      body.amount,
      body.feeType,
      body.dueDate,
    );
  }

  @Post('sms/fee-overdue')
  async sendFeeOverdueSms(
    @Body() body: { phone: string; studentName: string; amount: number; feeType: string },
  ) {
    return this.notificationsService.queueFeeOverdueSms(
      body.phone,
      body.studentName,
      body.amount,
      body.feeType,
    );
  }

  @Post('sms/attendance-alert')
  async sendAttendanceAlertSms(
    @Body() body: { phone: string; studentName: string; attendancePercentage: number },
  ) {
    return this.notificationsService.queueAttendanceAlertSms(
      body.phone,
      body.studentName,
      body.attendancePercentage,
    );
  }

  @Post('sms/otp')
  async sendOtp(@Body() body: { phone: string; otp: string }) {
    return this.notificationsService.queueOtpSms(body.phone, body.otp);
  }

  // ==================== COMBINED NOTIFICATIONS ====================

  @Post('notify/payment-success')
  async notifyPaymentSuccess(
    @Body() body: {
      email: string;
      phone: string;
      studentName: string;
      amount: number;
      feeType: string;
      receiptNumber: string;
      parentEmail?: string;
      parentName?: string;
    },
  ) {
    return this.notificationsService.notifyPaymentSuccess(
      body.email,
      body.phone,
      body.studentName,
      body.amount,
      body.feeType,
      body.receiptNumber,
      body.parentEmail,
      body.parentName,
    );
  }

  @Post('notify/fee-reminder')
  async notifyFeeReminder(
    @Body() body: {
      email: string;
      phone: string;
      studentName: string;
      parentName: string;
      amount: number;
      feeType: string;
      dueDate: string;
    },
  ) {
    return this.notificationsService.notifyFeeReminder(
      body.email,
      body.phone,
      body.studentName,
      body.parentName,
      body.amount,
      body.feeType,
      body.dueDate,
    );
  }

  // ==================== TEST ENDPOINTS ====================

  @Post('test/email')
  async sendTestEmail(@Body() body: { email: string }) {
    return this.notificationsService.sendEmailNow({
      to: body.email,
      subject: 'Test Email from EduNexus',
      templateType: 'welcome' as any,
      templateData: {
        studentName: 'Test User',
        collegeName: 'Test College',
      },
    });
  }

  @Post('test/sms')
  async sendTestSms(@Body() body: { phone: string }) {
    return this.notificationsService.sendSmsNow({
      to: body.phone,
      templateType: SmsTemplateType.WELCOME,
      templateData: {
        studentName: 'Test User',
        collegeName: 'Test College',
      },
    });
  }

  // ==================== PUSH NOTIFICATION ENDPOINTS ====================

  @Post('push/register-token')
  async registerDeviceToken(
    @Body() body: {
      userId: string;
      tenantId: string;
      token: string;
      deviceType?: string;
      deviceName?: string;
      deviceModel?: string;
      appVersion?: string;
    },
  ) {
    return this.notificationsService.registerDeviceToken(
      body.userId,
      body.tenantId,
      body.token,
      {
        deviceType: body.deviceType,
        deviceName: body.deviceName,
        deviceModel: body.deviceModel,
        appVersion: body.appVersion,
      },
    );
  }

  @Delete('push/unregister-token')
  async unregisterDeviceToken(@Body() body: { token: string }) {
    return this.notificationsService.unregisterDeviceToken(body.token);
  }

  @Post('push')
  async sendPushNotification(
    @Body() body: { userId: string; tenantId: string; notification: PushNotificationPayload },
  ) {
    return this.notificationsService.queuePushNotification(
      body.userId,
      body.tenantId,
      body.notification,
    );
  }

  @Post('push/bulk')
  async sendBulkPushNotification(
    @Body() body: { userIds: string[]; tenantId: string; notification: PushNotificationPayload },
  ) {
    return this.notificationsService.queueBulkPushNotification(
      body.userIds,
      body.tenantId,
      body.notification,
    );
  }

  @Post('push/payment-success')
  async sendPaymentSuccessPush(
    @Body() body: {
      userId: string;
      tenantId: string;
      studentName: string;
      amount: number;
      receiptNumber: string;
    },
  ) {
    return this.notificationsService.queuePaymentSuccessPush(
      body.userId,
      body.tenantId,
      body.studentName,
      body.amount,
      body.receiptNumber,
    );
  }

  @Post('push/fee-reminder')
  async sendFeeReminderPush(
    @Body() body: {
      userId: string;
      tenantId: string;
      studentName: string;
      amount: number;
      dueDate: string;
    },
  ) {
    return this.notificationsService.queueFeeReminderPush(
      body.userId,
      body.tenantId,
      body.studentName,
      body.amount,
      body.dueDate,
    );
  }

  @Post('push/fee-overdue')
  async sendFeeOverduePush(
    @Body() body: {
      userId: string;
      tenantId: string;
      studentName: string;
      amount: number;
    },
  ) {
    return this.notificationsService.queueFeeOverduePush(
      body.userId,
      body.tenantId,
      body.studentName,
      body.amount,
    );
  }

  @Post('push/attendance-alert')
  async sendAttendanceAlertPush(
    @Body() body: {
      userId: string;
      tenantId: string;
      studentName: string;
      percentage: number;
    },
  ) {
    return this.notificationsService.queueAttendanceAlertPush(
      body.userId,
      body.tenantId,
      body.studentName,
      body.percentage,
    );
  }

  @Post('push/exam-result')
  async sendExamResultPush(
    @Body() body: {
      userId: string;
      tenantId: string;
      examName: string;
      subjectName: string;
    },
  ) {
    return this.notificationsService.queueExamResultPush(
      body.userId,
      body.tenantId,
      body.examName,
      body.subjectName,
    );
  }

  @Post('push/announcement')
  async sendAnnouncementPush(
    @Body() body: {
      userIds: string[];
      tenantId: string;
      title: string;
      message: string;
    },
  ) {
    return this.notificationsService.queueAnnouncementPush(
      body.userIds,
      body.tenantId,
      body.title,
      body.message,
    );
  }

  @Post('test/push')
  async sendTestPush(@Body() body: { userId: string; tenantId: string }) {
    return this.notificationsService.sendPushNow(body.userId, body.tenantId, {
      title: 'Test Push from EduNexus',
      body: 'This is a test push notification. If you see this, push notifications are working!',
      icon: '/icons/icon-192x192.png',
      clickAction: '/student',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    });
  }
}
