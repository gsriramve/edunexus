import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { EmailProcessor, EMAIL_QUEUE } from './processors/email.processor';
import { SmsProcessor, SMS_QUEUE } from './processors/sms.processor';
import { PushProcessor, PUSH_QUEUE } from './processors/push.processor';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue(
      {
        name: EMAIL_QUEUE,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: SMS_QUEUE,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000, // SMS retries faster
          },
        },
      },
      {
        name: PUSH_QUEUE,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1500,
          },
        },
      },
    ),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    SmsService,
    PushService,
    EmailProcessor,
    SmsProcessor,
    PushProcessor,
  ],
  exports: [NotificationsService, EmailService, SmsService, PushService],
})
export class NotificationsModule {}
