import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    DocumentsModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max for profile photos
      },
    }),
  ],
  controllers: [StudentsController],
  providers: [StudentsService, PrismaService],
  exports: [StudentsService],
})
export class StudentsModule {}
