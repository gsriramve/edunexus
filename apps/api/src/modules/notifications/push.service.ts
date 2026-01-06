import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../../prisma/prisma.service';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  clickAction?: string;
  data?: Record<string, string>;
}

export interface SendPushDto {
  userId: string;
  tenantId: string;
  notification: PushNotificationPayload;
}

export interface SendBulkPushDto {
  userIds: string[];
  tenantId: string;
  notification: PushNotificationPayload;
}

export interface PushResult {
  success: boolean;
  messageId?: string;
  failedTokens?: string[];
  error?: string;
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private isConfigured = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey || projectId.includes('placeholder')) {
      this.logger.warn('Firebase credentials not configured. Push notifications will be logged but not sent.');
      this.isConfigured = false;
      return;
    }

    try {
      // Check if Firebase is already initialized
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }
      this.isConfigured = true;
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error: any) {
      this.logger.error(`Failed to initialize Firebase: ${error.message}`);
      this.isConfigured = false;
    }
  }

  // ==================== DEVICE TOKEN MANAGEMENT ====================

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
  ): Promise<{ success: boolean; tokenId?: string }> {
    try {
      // Upsert the token (update if exists, create if not)
      const deviceToken = await this.prisma.deviceToken.upsert({
        where: { token },
        update: {
          userId,
          tenantId,
          isActive: true,
          lastUsedAt: new Date(),
          ...deviceInfo,
        },
        create: {
          userId,
          tenantId,
          token,
          deviceType: deviceInfo?.deviceType || 'web',
          deviceName: deviceInfo?.deviceName,
          deviceModel: deviceInfo?.deviceModel,
          appVersion: deviceInfo?.appVersion,
        },
      });

      this.logger.log(`Device token registered for user ${userId}`);
      return { success: true, tokenId: deviceToken.id };
    } catch (error: any) {
      this.logger.error(`Failed to register device token: ${error.message}`);
      return { success: false };
    }
  }

  async unregisterDeviceToken(token: string): Promise<{ success: boolean }> {
    try {
      await this.prisma.deviceToken.update({
        where: { token },
        data: { isActive: false },
      });
      this.logger.log('Device token unregistered');
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to unregister device token: ${error.message}`);
      return { success: false };
    }
  }

  async getActiveTokensForUser(userId: string): Promise<string[]> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: { token: true },
    });
    return tokens.map((t) => t.token);
  }

  async getActiveTokensForUsers(userIds: string[]): Promise<Map<string, string[]>> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: {
        userId: { in: userIds },
        isActive: true,
      },
      select: { userId: true, token: true },
    });

    const tokenMap = new Map<string, string[]>();
    for (const t of tokens) {
      if (!tokenMap.has(t.userId)) {
        tokenMap.set(t.userId, []);
      }
      tokenMap.get(t.userId)!.push(t.token);
    }
    return tokenMap;
  }

  // ==================== PUSH NOTIFICATION SENDING ====================

  async sendPushNotification(dto: SendPushDto): Promise<PushResult> {
    const { userId, notification } = dto;

    // Get active tokens for user
    const tokens = await this.getActiveTokensForUser(userId);

    if (tokens.length === 0) {
      this.logger.debug(`No active tokens for user ${userId}`);
      return { success: true, messageId: 'no-tokens' };
    }

    // Log in development or when not configured
    if (!this.isConfigured || process.env.NODE_ENV === 'development') {
      this.logger.log(`[PUSH] To user: ${userId}`);
      this.logger.log(`[PUSH] Title: ${notification.title}`);
      this.logger.log(`[PUSH] Body: ${notification.body}`);
      this.logger.debug(`[PUSH] Tokens: ${tokens.length}, Data: ${JSON.stringify(notification.data)}`);

      if (!this.isConfigured) {
        return { success: true, messageId: `dev-push-${Date.now()}` };
      }
    }

    return this.sendToTokens(tokens, notification);
  }

  async sendBulkPushNotification(dto: SendBulkPushDto): Promise<PushResult> {
    const { userIds, notification } = dto;

    // Get all tokens for all users
    const tokenMap = await this.getActiveTokensForUsers(userIds);
    const allTokens: string[] = [];
    tokenMap.forEach((tokens) => allTokens.push(...tokens));

    if (allTokens.length === 0) {
      this.logger.debug(`No active tokens for ${userIds.length} users`);
      return { success: true, messageId: 'no-tokens' };
    }

    // Log in development or when not configured
    if (!this.isConfigured || process.env.NODE_ENV === 'development') {
      this.logger.log(`[PUSH BULK] To ${userIds.length} users (${allTokens.length} tokens)`);
      this.logger.log(`[PUSH BULK] Title: ${notification.title}`);
      this.logger.log(`[PUSH BULK] Body: ${notification.body}`);

      if (!this.isConfigured) {
        return { success: true, messageId: `dev-bulk-push-${Date.now()}` };
      }
    }

    return this.sendToTokens(allTokens, notification);
  }

  private async sendToTokens(tokens: string[], notification: PushNotificationPayload): Promise<PushResult> {
    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.image,
        },
        webpush: notification.clickAction
          ? {
              fcmOptions: {
                link: notification.clickAction,
              },
              notification: {
                icon: notification.icon || '/icons/icon-192x192.png',
                badge: notification.badge || '/icons/badge-72x72.png',
              },
            }
          : {
              notification: {
                icon: notification.icon || '/icons/icon-192x192.png',
                badge: notification.badge || '/icons/badge-72x72.png',
              },
            },
        android: {
          notification: {
            icon: notification.icon,
            clickAction: notification.clickAction,
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
            },
          },
        },
        data: notification.data,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      // Handle failed tokens
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          this.logger.warn(`Failed to send to token: ${resp.error?.message}`);
        }
      });

      // Deactivate failed tokens (invalid tokens)
      if (failedTokens.length > 0) {
        await this.deactivateInvalidTokens(failedTokens);
      }

      this.logger.log(`Push sent: ${response.successCount} success, ${response.failureCount} failed`);

      return {
        success: response.successCount > 0,
        messageId: `batch-${Date.now()}`,
        failedTokens: failedTokens.length > 0 ? failedTokens : undefined,
      };
    } catch (error: any) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async deactivateInvalidTokens(tokens: string[]) {
    try {
      await this.prisma.deviceToken.updateMany({
        where: { token: { in: tokens } },
        data: { isActive: false },
      });
      this.logger.log(`Deactivated ${tokens.length} invalid tokens`);
    } catch (error: any) {
      this.logger.error(`Failed to deactivate invalid tokens: ${error.message}`);
    }
  }

  // ==================== CONVENIENCE METHODS ====================

  async sendPaymentSuccessPush(
    userId: string,
    tenantId: string,
    studentName: string,
    amount: number,
    receiptNumber: string,
  ): Promise<PushResult> {
    return this.sendPushNotification({
      userId,
      tenantId,
      notification: {
        title: 'Payment Successful',
        body: `Payment of ₹${amount.toLocaleString('en-IN')} received for ${studentName}. Receipt: ${receiptNumber}`,
        icon: '/icons/payment-success.png',
        clickAction: '/student/fees',
        data: {
          type: 'payment_success',
          receiptNumber,
          amount: amount.toString(),
        },
      },
    });
  }

  async sendFeeReminderPush(
    userId: string,
    tenantId: string,
    studentName: string,
    amount: number,
    dueDate: string,
  ): Promise<PushResult> {
    return this.sendPushNotification({
      userId,
      tenantId,
      notification: {
        title: 'Fee Payment Reminder',
        body: `Reminder: ₹${amount.toLocaleString('en-IN')} is due on ${dueDate} for ${studentName}.`,
        icon: '/icons/fee-reminder.png',
        clickAction: '/student/fees',
        data: {
          type: 'fee_reminder',
          amount: amount.toString(),
          dueDate,
        },
      },
    });
  }

  async sendFeeOverduePush(
    userId: string,
    tenantId: string,
    studentName: string,
    amount: number,
  ): Promise<PushResult> {
    return this.sendPushNotification({
      userId,
      tenantId,
      notification: {
        title: 'Fee Overdue Notice',
        body: `Fee of ₹${amount.toLocaleString('en-IN')} for ${studentName} is overdue. Please pay immediately.`,
        icon: '/icons/fee-overdue.png',
        clickAction: '/student/fees',
        data: {
          type: 'fee_overdue',
          amount: amount.toString(),
        },
      },
    });
  }

  async sendAttendanceAlertPush(
    userId: string,
    tenantId: string,
    studentName: string,
    percentage: number,
  ): Promise<PushResult> {
    return this.sendPushNotification({
      userId,
      tenantId,
      notification: {
        title: 'Low Attendance Alert',
        body: `${studentName}'s attendance has dropped to ${percentage}%. Minimum required is 75%.`,
        icon: '/icons/attendance-alert.png',
        clickAction: '/student/attendance',
        data: {
          type: 'attendance_alert',
          percentage: percentage.toString(),
        },
      },
    });
  }

  async sendExamResultPush(
    userId: string,
    tenantId: string,
    examName: string,
    subjectName: string,
  ): Promise<PushResult> {
    return this.sendPushNotification({
      userId,
      tenantId,
      notification: {
        title: 'Exam Result Published',
        body: `Results for ${examName} (${subjectName}) have been published. Check your marks now.`,
        icon: '/icons/exam-result.png',
        clickAction: '/student/exams',
        data: {
          type: 'exam_result',
          examName,
          subjectName,
        },
      },
    });
  }

  async sendAnnouncementPush(
    userIds: string[],
    tenantId: string,
    title: string,
    message: string,
  ): Promise<PushResult> {
    return this.sendBulkPushNotification({
      userIds,
      tenantId,
      notification: {
        title,
        body: message,
        icon: '/icons/announcement.png',
        clickAction: '/announcements',
        data: {
          type: 'announcement',
        },
      },
    });
  }
}
