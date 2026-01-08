import { Module } from '@nestjs/common';
import { HodStudentsController } from './hod-students.controller';
import { HodStudentsService } from './hod-students.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HodStudentsController],
  providers: [HodStudentsService],
  exports: [HodStudentsService],
})
export class HodStudentsModule {}
