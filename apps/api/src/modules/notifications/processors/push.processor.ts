import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PushService, PushNotificationPayload } from '../push.service';

export const PUSH_QUEUE = 'push-queue';

export interface PushJobData {
  type: 'single' | 'bulk' | 'payment_success' | 'fee_reminder' | 'fee_overdue' | 'attendance_alert' | 'exam_result' | 'announcement';
  payload: Record<string, unknown>;
}

@Processor(PUSH_QUEUE)
export class PushProcessor {
  private readonly logger = new Logger(PushProcessor.name);

  constructor(private readonly pushService: PushService) {}

  @Process('send')
  async handleSendPush(job: Job<PushJobData>) {
    this.logger.log(`Processing push job ${job.id}: ${job.data.type}`);

    try {
      switch (job.data.type) {
        case 'single': {
          const data = job.data.payload as {
            userId: string;
            tenantId: string;
            notification: PushNotificationPayload;
          };
          return await this.pushService.sendPushNotification(data);
        }

        case 'bulk': {
          const data = job.data.payload as {
            userIds: string[];
            tenantId: string;
            notification: PushNotificationPayload;
          };
          return await this.pushService.sendBulkPushNotification(data);
        }

        case 'payment_success': {
          const data = job.data.payload as {
            userId: string;
            tenantId: string;
            studentName: string;
            amount: number;
            receiptNumber: string;
          };
          return await this.pushService.sendPaymentSuccessPush(
            data.userId,
            data.tenantId,
            data.studentName,
            data.amount,
            data.receiptNumber,
          );
        }

        case 'fee_reminder': {
          const data = job.data.payload as {
            userId: string;
            tenantId: string;
            studentName: string;
            amount: number;
            dueDate: string;
          };
          return await this.pushService.sendFeeReminderPush(
            data.userId,
            data.tenantId,
            data.studentName,
            data.amount,
            data.dueDate,
          );
        }

        case 'fee_overdue': {
          const data = job.data.payload as {
            userId: string;
            tenantId: string;
            studentName: string;
            amount: number;
          };
          return await this.pushService.sendFeeOverduePush(
            data.userId,
            data.tenantId,
            data.studentName,
            data.amount,
          );
        }

        case 'attendance_alert': {
          const data = job.data.payload as {
            userId: string;
            tenantId: string;
            studentName: string;
            percentage: number;
          };
          return await this.pushService.sendAttendanceAlertPush(
            data.userId,
            data.tenantId,
            data.studentName,
            data.percentage,
          );
        }

        case 'exam_result': {
          const data = job.data.payload as {
            userId: string;
            tenantId: string;
            examName: string;
            subjectName: string;
          };
          return await this.pushService.sendExamResultPush(
            data.userId,
            data.tenantId,
            data.examName,
            data.subjectName,
          );
        }

        case 'announcement': {
          const data = job.data.payload as {
            userIds: string[];
            tenantId: string;
            title: string;
            message: string;
          };
          return await this.pushService.sendAnnouncementPush(
            data.userIds,
            data.tenantId,
            data.title,
            data.message,
          );
        }

        default:
          throw new Error(`Unknown push job type: ${job.data.type}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to process push job ${job.id}: ${error.message}`);
      throw error;
    }
  }
}
