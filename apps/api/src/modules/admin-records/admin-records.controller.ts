import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { AdminRecordsService } from './admin-records.service';

@Controller('admin-records')
export class AdminRecordsController {
  constructor(private readonly adminRecordsService: AdminRecordsService) {}

  @Get('stats')
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.adminRecordsService.getStats(tenantId);
  }

  @Get('students')
  getStudents(
    @Headers('x-tenant-id') tenantId: string,
    @Query('search') search?: string,
    @Query('branch') branch?: string,
    @Query('semester') semester?: string,
    @Query('status') status?: string,
    @Query('batch') batch?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.adminRecordsService.getStudents(tenantId, {
      search,
      branch,
      semester: semester ? parseInt(semester, 10) : undefined,
      status,
      batch,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('students/:id')
  getStudentDetails(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') studentId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.adminRecordsService.getStudentDetails(tenantId, studentId);
  }

  @Get('certificate-types')
  getCertificateTypes(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.adminRecordsService.getCertificateTypes(tenantId);
  }

  @Get('certificate-requests')
  getCertificateRequests(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.adminRecordsService.getCertificateRequests(tenantId, {
      status,
      type,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post('certificate-requests')
  createCertificateRequest(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { studentId: string; certificateTypeId: string; purpose: string },
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.adminRecordsService.createCertificateRequest(tenantId, body);
  }

  @Patch('certificate-requests/:id/status')
  updateCertificateStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') requestId: string,
    @Body() body: { status: string; remarks?: string },
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.adminRecordsService.updateCertificateStatus(tenantId, requestId, {
      status: body.status,
      processedBy: userId,
      remarks: body.remarks,
    });
  }
}
