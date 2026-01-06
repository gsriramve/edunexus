import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  getSmsTemplate,
  SmsTemplateType,
  SmsTemplateData,
  validateIndianPhone,
  DLT_TEMPLATE_IDS,
} from './templates/sms-templates';

export interface SendSmsDto {
  to: string; // Phone number
  templateType: SmsTemplateType;
  templateData: SmsTemplateData;
}

export interface SendBulkSmsDto {
  recipients: string[];
  templateType: SmsTemplateType;
  templateData: SmsTemplateData;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly authKey: string;
  private readonly senderId: string;
  private readonly route: string;
  private readonly isConfigured: boolean;

  // MSG91 API endpoints
  private readonly MSG91_SEND_URL = 'https://api.msg91.com/api/v5/flow/';
  private readonly MSG91_SEND_SMS_URL = 'https://api.msg91.com/api/sendhttp.php';

  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY || '';
    this.senderId = process.env.MSG91_SENDER_ID || 'EDUNEX';
    this.route = process.env.MSG91_ROUTE || '4'; // 4 = Transactional

    if (this.authKey && !this.authKey.includes('placeholder')) {
      this.isConfigured = true;
      this.logger.log('MSG91 SMS service configured successfully');
    } else {
      this.isConfigured = false;
      this.logger.warn('MSG91 API key not configured. SMS will be logged but not sent.');
    }
  }

  async sendSms(dto: SendSmsDto): Promise<SmsResult> {
    const { to, templateType, templateData } = dto;

    // Validate phone number
    const { valid, formatted } = validateIndianPhone(to);
    if (!valid) {
      this.logger.warn(`Invalid phone number: ${to}`);
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    // Get message content
    const message = getSmsTemplate(templateType, templateData);
    const dltTemplateId = DLT_TEMPLATE_IDS[templateType];

    // Log in development mode
    if (!this.isConfigured || process.env.NODE_ENV === 'development') {
      this.logger.log(`[SMS] To: ${formatted}`);
      this.logger.log(`[SMS] Template: ${templateType}`);
      this.logger.log(`[SMS] Message: ${message}`);
      this.logger.debug(`[SMS] Data: ${JSON.stringify(templateData)}`);

      if (!this.isConfigured) {
        return {
          success: true,
          messageId: `dev-sms-${Date.now()}`,
        };
      }
    }

    try {
      // Using MSG91 HTTP API
      const response = await axios.get(this.MSG91_SEND_SMS_URL, {
        params: {
          authkey: this.authKey,
          mobiles: formatted,
          message: message,
          sender: this.senderId,
          route: this.route,
          country: '91',
          DLT_TE_ID: dltTemplateId,
        },
      });

      // MSG91 returns request ID on success
      if (response.data && !response.data.includes('error')) {
        this.logger.log(`SMS sent successfully to ${formatted}`);
        return {
          success: true,
          messageId: response.data,
        };
      } else {
        throw new Error(response.data || 'Unknown error');
      }
    } catch (error: any) {
      this.logger.error(`Failed to send SMS to ${formatted}: ${error.message}`);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async sendBulkSms(dto: SendBulkSmsDto): Promise<SmsResult[]> {
    const { recipients, templateType, templateData } = dto;
    const results: SmsResult[] = [];

    // For bulk SMS, MSG91 supports batch sending
    // For simplicity, we'll send individual messages
    // In production, consider using MSG91's bulk API

    for (const recipient of recipients) {
      const result = await this.sendSms({
        to: recipient,
        templateType,
        templateData,
      });
      results.push(result);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const successCount = results.filter((r) => r.success).length;
    this.logger.log(`Bulk SMS sent: ${successCount}/${recipients.length} successful`);

    return results;
  }

  // Convenience methods for common notifications

  async sendPaymentConfirmation(
    phone: string,
    studentName: string,
    amount: number,
    feeType: string,
    receiptNumber: string,
  ): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      templateType: SmsTemplateType.PAYMENT_CONFIRMATION,
      templateData: {
        studentName,
        amount,
        feeType,
        receiptNumber,
      },
    });
  }

  async sendFeeReminder(
    phone: string,
    studentName: string,
    amount: number,
    feeType: string,
    dueDate: string,
  ): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      templateType: SmsTemplateType.FEE_REMINDER,
      templateData: {
        studentName,
        amount,
        feeType,
        dueDate,
      },
    });
  }

  async sendFeeOverdue(
    phone: string,
    studentName: string,
    amount: number,
    feeType: string,
  ): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      templateType: SmsTemplateType.FEE_OVERDUE,
      templateData: {
        studentName,
        amount,
        feeType,
      },
    });
  }

  async sendAttendanceAlert(
    phone: string,
    studentName: string,
    attendancePercentage: number,
  ): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      templateType: SmsTemplateType.ATTENDANCE_ALERT,
      templateData: {
        studentName,
        attendancePercentage,
      },
    });
  }

  async sendOtp(phone: string, otp: string): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      templateType: SmsTemplateType.OTP,
      templateData: { otp },
    });
  }

  async sendWelcome(
    phone: string,
    studentName: string,
    collegeName: string,
  ): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      templateType: SmsTemplateType.WELCOME,
      templateData: {
        studentName,
        collegeName,
      },
    });
  }

  // Get SMS balance (useful for monitoring)
  async getBalance(): Promise<{ success: boolean; balance?: number; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      const response = await axios.get('https://api.msg91.com/api/balance.php', {
        params: {
          authkey: this.authKey,
          type: this.route,
        },
      });

      return {
        success: true,
        balance: parseInt(response.data, 10),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
