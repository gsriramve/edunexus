import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { StaffModule } from './modules/staff/staff.module';
import { StudentsModule } from './modules/students/students.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ExamsModule } from './modules/exams/exams.module';
import { ExamResultsModule } from './modules/exam-results/exam-results.module';
import { TransportModule } from './modules/transport/transport.module';
import { HostelModule } from './modules/hostel/hostel.module';
import { LibraryModule } from './modules/library/library.module';
import { SportsClubsModule } from './modules/sports-clubs/sports-clubs.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ImportExportModule } from './modules/import-export/import-export.module';
import { AuditModule } from './modules/audit/audit.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    TenantsModule,
    DepartmentsModule,
    StaffModule,
    StudentsModule,
    PaymentsModule,
    NotificationsModule,
    ExamsModule,
    ExamResultsModule,
    TransportModule,
    HostelModule,
    LibraryModule,
    SportsClubsModule,
    CommunicationModule,
    DocumentsModule,
    ImportExportModule,
    AuditModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
