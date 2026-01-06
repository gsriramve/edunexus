import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
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
  getPlainTextVersion,
  EmailTemplateData,
} from './templates/email-templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly isConfigured: boolean;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@edunexus.app';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'EduNexus';

    if (apiKey && !apiKey.includes('placeholder')) {
      sgMail.setApiKey(apiKey);
      this.isConfigured = true;
      this.logger.log('SendGrid configured successfully');
    } else {
      this.isConfigured = false;
      this.logger.warn('SendGrid API key not configured. Emails will be logged but not sent.');
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

    const msg = {
      to,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject,
      text,
      html,
    };

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
      const response = await sgMail.send(msg);
      this.logger.log(`Email sent successfully to ${to}`);

      return {
        success: true,
        messageId: response[0]?.headers?.['x-message-id'],
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

    // SendGrid supports up to 1000 recipients per API call
    // For simplicity, we'll send individual emails
    // In production, consider using SendGrid's bulk send feature

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
