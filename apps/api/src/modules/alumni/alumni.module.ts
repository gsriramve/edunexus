import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AlumniController } from './alumni.controller';
import { AlumniService } from './alumni.service';
import { MentorshipService } from './mentorship.service';
import { EventsService } from './events.service';
import { ContributionsService } from './contributions.service';

@Module({
  imports: [PrismaModule],
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
