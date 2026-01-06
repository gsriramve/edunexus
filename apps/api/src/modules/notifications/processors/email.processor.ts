import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { EmailService } from '../email.service';
import type {
  SendEmailDto,
  SendBulkEmailDto,
  PaymentNotificationDto,
  FeeReminderDto,
} from '../dto/notification.dto';

export const EMAIL_QUEUE = 'email-queue';

export interface EmailJobData {
  type: 'single' | 'bulk' | 'payment_receipt' | 'fee_reminder' | 'fee_overdue' | 'welcome' | 'attendance_alert';
  payload: SendEmailDto | SendBulkEmailDto | PaymentNotificationDto | FeeReminderDto | Record<string, unknown>;
}

@Processor(EMAIL_QUEUE)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('send')
  async handleSendEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processing email job ${job.id}: ${job.data.type}`);

    try {
      switch (job.data.type) {
        case 'single':
          return await this.emailService.sendEmail(job.data.payload as SendEmailDto);

        case 'bulk':
          return await this.emailService.sendBulkEmail(job.data.payload as SendBulkEmailDto);

        case 'payment_receipt':
          return await this.emailService.sendPaymentReceipt(job.data.payload as PaymentNotificationDto);

        case 'fee_reminder':
          return await this.emailService.sendFeeReminder(job.data.payload as FeeReminderDto);

        case 'fee_overdue':
          return await this.emailService.sendFeeOverdueNotice(job.data.payload as FeeReminderDto);

        case 'welcome': {
          const welcomeData = job.data.payload as { email: string; studentName: string; collegeName: string };
          return await this.emailService.sendWelcomeEmail(
            welcomeData.email,
            welcomeData.studentName,
            welcomeData.collegeName,
          );
        }

        case 'attendance_alert': {
          const alertData = job.data.payload as {
            parentEmail: string;
            parentName: string;
            studentName: string;
            attendancePercentage: number;
          };
          return await this.emailService.sendAttendanceAlert(
            alertData.parentEmail,
            alertData.parentName,
            alertData.studentName,
            alertData.attendancePercentage,
          );
        }

        default:
          throw new Error(`Unknown email job type: ${job.data.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process email job ${job.id}: ${error.message}`);
      throw error;
    }
  }

  @Process('send-scheduled')
  async handleScheduledEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processing scheduled email job ${job.id}`);
    return this.handleSendEmail(job);
  }
}
