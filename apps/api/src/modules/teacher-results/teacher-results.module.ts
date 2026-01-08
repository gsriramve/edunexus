import { Module } from '@nestjs/common';
import { TeacherResultsController } from './teacher-results.controller';
import { TeacherResultsService } from './teacher-results.service';

@Module({
  controllers: [TeacherResultsController],
  providers: [TeacherResultsService],
  exports: [TeacherResultsService],
})
export class TeacherResultsModule {}
