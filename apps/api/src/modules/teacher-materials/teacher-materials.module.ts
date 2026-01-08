import { Module } from '@nestjs/common';
import { TeacherMaterialsController } from './teacher-materials.controller';
import { TeacherMaterialsService } from './teacher-materials.service';

@Module({
  controllers: [TeacherMaterialsController],
  providers: [TeacherMaterialsService],
  exports: [TeacherMaterialsService],
})
export class TeacherMaterialsModule {}
