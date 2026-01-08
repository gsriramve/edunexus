import { Module } from '@nestjs/common';
import { AccreditationController } from './accreditation.controller';
import { AccreditationService } from './accreditation.service';
import { FrameworkCalculatorService } from './framework-calculator.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccreditationController],
  providers: [AccreditationService, FrameworkCalculatorService],
  exports: [AccreditationService, FrameworkCalculatorService],
})
export class AccreditationModule {}
