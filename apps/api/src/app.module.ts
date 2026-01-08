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
import { InvitationsModule } from './modules/invitations/invitations.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlatformModule } from './modules/platform/platform.module';
import { IdCardsModule } from './modules/id-cards/id-cards.module';
import { StudentIndicesModule } from './modules/student-indices/student-indices.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { AiGuidanceModule } from './modules/ai-guidance/ai-guidance.module';
import { StudentJourneyModule } from './modules/student-journey/student-journey.module';
import { AlumniModule } from './modules/alumni/alumni.module';
import { AccreditationModule } from './modules/accreditation/accreditation.module';
import { FaceRecognitionModule } from './modules/face-recognition/face-recognition.module';
import { TeacherClassesModule } from './modules/teacher-classes/teacher-classes.module';
import { TeacherAttendanceModule } from './modules/teacher-attendance/teacher-attendance.module';
import { TeacherResultsModule } from './modules/teacher-results/teacher-results.module';
import { HodSubjectsModule } from './modules/hod-subjects/hod-subjects.module';
import { HodAttendanceModule } from './modules/hod-attendance/hod-attendance.module';
import { HodFacultyModule } from './modules/hod-faculty/hod-faculty.module';
import { HodStudentsModule } from './modules/hod-students/hod-students.module';
import { HodDashboardModule } from './modules/hod-dashboard/hod-dashboard.module';
import { HodExamsModule } from './modules/hod-exams/hod-exams.module';
import { HodCurriculumModule } from './modules/hod-curriculum/hod-curriculum.module';
import { HodReportsModule } from './modules/hod-reports/hod-reports.module';
import { TeacherDashboardModule } from './modules/teacher-dashboard/teacher-dashboard.module';
import { TeacherMessagesModule } from './modules/teacher-messages/teacher-messages.module';
import { TeacherAssignmentsModule } from './modules/teacher-assignments/teacher-assignments.module';
import { TeacherMaterialsModule } from './modules/teacher-materials/teacher-materials.module';
import { PrincipalDashboardModule } from './modules/principal-dashboard/principal-dashboard.module';
import { LabAssistantModule } from './modules/lab-assistant/lab-assistant.module';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';
import { ParentDashboardModule } from './modules/parent-dashboard/parent-dashboard.module';
import { StudentCareerModule } from './modules/student-career/student-career.module';
import { StudentInsightsModule } from './modules/student-insights/student-insights.module';

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
    InvitationsModule,
    AuthModule,
    PlatformModule,
    IdCardsModule,
    StudentIndicesModule,
    FeedbackModule,
    AiGuidanceModule,
    StudentJourneyModule,
    AlumniModule,
    AccreditationModule,
    FaceRecognitionModule,
    TeacherClassesModule,
    TeacherAttendanceModule,
    TeacherResultsModule,
    HodSubjectsModule,
    HodAttendanceModule,
    HodFacultyModule,
    HodStudentsModule,
    HodDashboardModule,
    HodExamsModule,
    HodCurriculumModule,
    HodReportsModule,
    TeacherDashboardModule,
    TeacherMessagesModule,
    TeacherAssignmentsModule,
    TeacherMaterialsModule,
    PrincipalDashboardModule,
    LabAssistantModule,
    AdminDashboardModule,
    ParentDashboardModule,
    StudentCareerModule,
    StudentInsightsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
