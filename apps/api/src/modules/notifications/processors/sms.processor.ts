import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { SmsService, SendSmsDto, SendBulkSmsDto } from '../sms.service';
import { SmsTemplateType, SmsTemplateData } from '../templates/sms-templates';

export const SMS_QUEUE = 'sms-queue';

export interface SmsJobData {
  type: 'single' | 'bulk' | 'payment_confirmation' | 'fee_reminder' | 'fee_overdue' | 'attendance_alert' | 'otp' | 'welcome';
  payload: SendSmsDto | SendBulkSmsDto | Record<string, unknown>;
}

@Processor(SMS_QUEUE)
export class SmsProcessor {
  private readonly logger = new Logger(SmsProcessor.name);

  constructor(private readonly smsService: SmsService) {}

  @Process('send')
  async handleSendSms(job: Job<SmsJobData>) {
    this.logger.log(`Processing SMS job ${job.id}: ${job.data.type}`);

    try {
      switch (job.data.type) {
        case 'single':
          return await this.smsService.sendSms(job.data.payload as SendSmsDto);

        case 'bulk':
          return await this.smsService.sendBulkSms(job.data.payload as SendBulkSmsDto);

        case 'payment_confirmation': {
          const data = job.data.payload as {
            phone: string;
            studentName: string;
            amount: number;
            feeType: string;
            receiptNumber: string;
          };
          return await this.smsService.sendPaymentConfirmation(
            data.phone,
            data.studentName,
            data.amount,
            data.feeType,
            data.receiptNumber,
          );
        }

        case 'fee_reminder': {
          const data = job.data.payload as {
            phone: string;
            studentName: string;
            amount: number;
            feeType: string;
            dueDate: string;
          };
          return await this.smsService.sendFeeReminder(
            data.phone,
            data.studentName,
            data.amount,
            data.feeType,
            data.dueDate,
          );
        }

        case 'fee_overdue': {
          const data = job.data.payload as {
            phone: string;
            studentName: string;
            amount: number;
            feeType: string;
          };
          return await this.smsService.sendFeeOverdue(
            data.phone,
            data.studentName,
            data.amount,
            data.feeType,
          );
        }

        case 'attendance_alert': {
          const data = job.data.payload as {
            phone: string;
            studentName: string;
            attendancePercentage: number;
          };
          return await this.smsService.sendAttendanceAlert(
            data.phone,
            data.studentName,
            data.attendancePercentage,
          );
        }

        case 'otp': {
          const data = job.data.payload as { phone: string; otp: string };
          return await this.smsService.sendOtp(data.phone, data.otp);
        }

        case 'welcome': {
          const data = job.data.payload as {
            phone: string;
            studentName: string;
            collegeName: string;
          };
          return await this.smsService.sendWelcome(
            data.phone,
            data.studentName,
            data.collegeName,
          );
        }

        default:
          throw new Error(`Unknown SMS job type: ${job.data.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process SMS job ${job.id}: ${error.message}`);
      throw error;
    }
  }
}
