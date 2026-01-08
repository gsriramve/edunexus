import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { StudentJourneyController } from './student-journey.controller';
import { StudentJourneyService } from './student-journey.service';
import { MilestoneTrackerService } from './milestone-tracker.service';
import { SnapshotGeneratorService } from './snapshot-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentJourneyController],
  providers: [
    StudentJourneyService,
    MilestoneTrackerService,
    SnapshotGeneratorService,
  ],
  exports: [
    StudentJourneyService,
    MilestoneTrackerService,
    SnapshotGeneratorService,
  ],
})
export class StudentJourneyModule {}
