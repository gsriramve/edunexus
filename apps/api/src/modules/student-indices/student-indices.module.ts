import { Module } from '@nestjs/common';
import { StudentIndicesController } from './student-indices.controller';
import { StudentIndicesService } from './student-indices.service';
import { SgiCalculatorService } from './sgi-calculator.service';
import { CriCalculatorService } from './cri-calculator.service';

/**
 * Student Indices Module
 *
 * Provides endpoints and services for:
 * - Student Growth Index (SGI) - Monthly holistic development tracking
 * - Career Readiness Index (CRI) - Placement probability prediction
 * - Index Configuration - Customizable weights per institution
 * - Alerts - Low-score notifications for at-risk students
 */
@Module({
  controllers: [StudentIndicesController],
  providers: [
    StudentIndicesService,
    SgiCalculatorService,
    CriCalculatorService,
  ],
  exports: [StudentIndicesService, SgiCalculatorService, CriCalculatorService],
})
export class StudentIndicesModule {}
