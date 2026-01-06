import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { S3Service } from './s3.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB max
      },
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, S3Service],
  exports: [DocumentsService, S3Service],
})
export class DocumentsModule {}
