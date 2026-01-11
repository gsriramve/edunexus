import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from '../../prisma/prisma.module';
import { DocumentsModule } from '../documents/documents.module';
import { AlumniController } from './alumni.controller';
import { AlumniService } from './alumni.service';
import { MentorshipService } from './mentorship.service';
import { EventsService } from './events.service';
import { ContributionsService } from './contributions.service';

@Module({
  imports: [
    PrismaModule,
    DocumentsModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max for profile photos
      },
    }),
  ],
  controllers: [AlumniController],
  providers: [
    AlumniService,
    MentorshipService,
    EventsService,
    ContributionsService,
  ],
  exports: [
    AlumniService,
    MentorshipService,
    EventsService,
    ContributionsService,
  ],
})
export class AlumniModule {}
