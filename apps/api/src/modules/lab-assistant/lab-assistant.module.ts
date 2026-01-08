import { Module } from '@nestjs/common';
import { LabAssistantController } from './lab-assistant.controller';
import { LabAssistantService } from './lab-assistant.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LabAssistantController],
  providers: [LabAssistantService],
  exports: [LabAssistantService],
})
export class LabAssistantModule {}
