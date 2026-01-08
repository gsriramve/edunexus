import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import {
  SendEmailDto,
  SendBulkEmailDto,
  EmailTemplateType,
  NotificationResultDto,
  PaymentNotificationDto,
  FeeReminderDto,
} from './dto/notification.dto';
import {
  paymentReceiptTemplate,
  feeReminderTemplate,
  feeOverdueTemplate,
  welcomeTemplate,
  attendanceAlertTemplate,
  principalInvitationTemplate,
  invitationTemplate,
  getPlainTextVersion,
  EmailTemplateData,
} from './templates/email-templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly isConfigured: boolean;
  private readonly resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    this.fromName = process.env.RESEND_FROM_NAME || 'EduNexus';

    if (apiKey && !apiKey.includes('placeholder')) {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
      this.logger.log('Resend email service configured successfully');
    } else {
      this.isConfigured = false;
      this.logger.warn('Resend API key not configured. Emails will be logged but not sent.');
    }
  }

  private getTemplate(type: EmailTemplateType, data: EmailTemplateData): { html: string; text: string } {
    switch (type) {
      case EmailTemplateType.PAYMENT_RECEIPT:
        return {
          html: paymentReceiptTemplate(data),
          text: getPlainTextVersion('payment_receipt', data),
        };
      case EmailTemplateType.FEE_REMINDER:
        return {
          html: feeReminderTemplate(data),
          text: getPlainTextVersion('fee_reminder', data),
        };
      case EmailTemplateType.FEE_OVERDUE:
        return {
          html: feeOverdueTemplate(data),
          text: getPlainTextVersion('fee_reminder', data),
        };
      case EmailTemplateType.WELCOME:
        return {
          html: welcomeTemplate(data),
          text: getPlainTextVersion('welcome', data),
        };
      case EmailTemplateType.ATTENDANCE_ALERT:
        return {
          html: attendanceAlertTemplate(data),
          text: getPlainTextVersion('attendance_alert', data),
        };
      case EmailTemplateType.INVITATION:
        return {
          html: invitationTemplate(data),
          text: getPlainTextVersion('invitation', data),
        };
      default:
        return {
          html: '<p>No template available</p>',
          text: 'No template available',
        };
    }
  }

  async sendEmail(dto: SendEmailDto): Promise<NotificationResultDto> {
    const { to, subject, templateType, templateData, customHtml, customText } = dto;

    // Get template content
    let html: string;
    let text: string;

    if (customHtml) {
      html = customHtml;
      text = customText || 'Please view this email in an HTML-compatible email client.';
    } else {
      const template = this.getTemplate(templateType, templateData as EmailTemplateData || {});
      html = template.html;
      text = template.text;
    }

    // Log email details in development
    if (!this.isConfigured || process.env.NODE_ENV === 'development') {
      this.logger.log(`[EMAIL] To: ${to}`);
      this.logger.log(`[EMAIL] Subject: ${subject}`);
      this.logger.log(`[EMAIL] Template: ${templateType}`);
      this.logger.debug(`[EMAIL] Data: ${JSON.stringify(templateData)}`);

      if (!this.isConfigured) {
        return {
          success: true,
          messageId: `dev-${Date.now()}`,
        };
      }
    }

    try {
      const response = await this.resend!.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [to],
        subject,
        html,
        text,
      });

      if (response.error) {
        this.logger.error(`Failed to send email to ${to}: ${response.error.message}`);
        return {
          success: false,
          error: response.error.message,
        };
      }

      this.logger.log(`Email sent successfully to ${to}`);
      return {
        success: true,
        messageId: response.data?.id,
      };
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendBulkEmail(dto: SendBulkEmailDto): Promise<NotificationResultDto[]> {
    const { recipients, subject, templateType, templateData } = dto;
    const results: NotificationResultDto[] = [];

    for (const recipient of recipients) {
      const result = await this.sendEmail({
        to: recipient,
        subject,
        templateType,
        templateData,
      });
      results.push(result);
    }

    const successCount = results.filter((r) => r.success).length;
    this.logger.log(`Bulk email sent: ${successCount}/${recipients.length} successful`);

    return results;
  }

  // Send invitation email to new users (principal, staff, etc.)
  async sendInvitationEmail(
    email: string,
    recipientName: string,
    role: string,
    collegeName: string,
    inviteUrl: string,
    inviterName?: string,
  ): Promise<NotificationResultDto> {
    return this.sendEmail({
      to: email,
      subject: `You're invited to join ${collegeName} on EduNexus`,
      templateType: EmailTemplateType.INVITATION,
      templateData: {
        recipientName,
        role,
        collegeName,
        inviteUrl,
        inviterName: inviterName || 'EduNexus Admin',
        expiryDays: '7',
      },
    });
  }

  // Convenience methods for common notification types

  async sendPaymentReceipt(dto: PaymentNotificationDto): Promise<NotificationResultDto[]> {
    const results: NotificationResultDto[] = [];
    const templateData: EmailTemplateData = {
      studentName: dto.studentName,
      amount: dto.amount,
      feeType: dto.feeType,
      paymentId: dto.paymentId,
      receiptNumber: dto.receiptNumber,
      paymentMethod: dto.paymentMethod,
      transactionDate: new Date().toLocaleDateString('en-IN'),
      currency: '₹',
    };

    // Send to student
    const studentResult = await this.sendEmail({
      to: dto.studentEmail,
      subject: `Payment Receipt - ${dto.feeType}`,
      templateType: EmailTemplateType.PAYMENT_RECEIPT,
      templateData,
    });
    results.push(studentResult);

    // Send to parent if email provided
    if (dto.parentEmail) {
      const parentData = { ...templateData, parentName: dto.parentName };
      const parentResult = await this.sendEmail({
        to: dto.parentEmail,
        subject: `Payment Receipt for ${dto.studentName} - ${dto.feeType}`,
        templateType: EmailTemplateType.PAYMENT_RECEIPT,
        templateData: parentData,
      });
      results.push(parentResult);
    }

    return results;
  }

  async sendFeeReminder(dto: FeeReminderDto): Promise<NotificationResultDto[]> {
    const results: NotificationResultDto[] = [];
    const templateData: EmailTemplateData = {
      studentName: dto.studentName,
      parentName: dto.parentName,
      amount: dto.amount,
      feeType: dto.feeType,
      dueDate: dto.dueDate,
      semester: dto.semester,
      currency: '₹',
    };

    // Send to parent
    const parentResult = await this.sendEmail({
      to: dto.parentEmail,
      subject: `Fee Payment Reminder - ${dto.feeType}`,
      templateType: EmailTemplateType.FEE_REMINDER,
      templateData,
    });
    results.push(parentResult);

    // Optionally send to student
    if (dto.studentEmail) {
      const studentResult = await this.sendEmail({
        to: dto.studentEmail,
        subject: `Fee Payment Reminder - ${dto.feeType}`,
        templateType: EmailTemplateType.FEE_REMINDER,
        templateData: { ...templateData, parentName: undefined },
      });
      results.push(studentResult);
    }

    return results;
  }

  async sendFeeOverdueNotice(dto: FeeReminderDto): Promise<NotificationResultDto[]> {
    const results: NotificationResultDto[] = [];
    const templateData: EmailTemplateData = {
      studentName: dto.studentName,
      parentName: dto.parentName,
      amount: dto.amount,
      feeType: dto.feeType,
      dueDate: dto.dueDate,
      currency: '₹',
    };

    // Send to parent
    const parentResult = await this.sendEmail({
      to: dto.parentEmail,
      subject: `Urgent: Fee Payment Overdue - ${dto.feeType}`,
      templateType: EmailTemplateType.FEE_OVERDUE,
      templateData,
    });
    results.push(parentResult);

    // Send to student
    if (dto.studentEmail) {
      const studentResult = await this.sendEmail({
        to: dto.studentEmail,
        subject: `Urgent: Fee Payment Overdue - ${dto.feeType}`,
        templateType: EmailTemplateType.FEE_OVERDUE,
        templateData: { ...templateData, parentName: undefined },
      });
      results.push(studentResult);
    }

    return results;
  }

  async sendWelcomeEmail(email: string, studentName: string, collegeName: string): Promise<NotificationResultDto> {
    return this.sendEmail({
      to: email,
      subject: `Welcome to ${collegeName} - EduNexus`,
      templateType: EmailTemplateType.WELCOME,
      templateData: {
        studentName,
        collegeName,
      },
    });
  }

  async sendAttendanceAlert(
    parentEmail: string,
    parentName: string,
    studentName: string,
    attendancePercentage: number,
  ): Promise<NotificationResultDto> {
    return this.sendEmail({
      to: parentEmail,
      subject: `Attendance Alert for ${studentName}`,
      templateType: EmailTemplateType.ATTENDANCE_ALERT,
      templateData: {
        parentName,
        studentName,
        attendancePercentage: attendancePercentage.toString(),
      },
    });
  }
}
