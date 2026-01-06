import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { StaffModule } from './modules/staff/staff.module';
import { StudentsModule } from './modules/students/students.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    TenantsModule,
    DepartmentsModule,
    StaffModule,
    StudentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
