import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto/student.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createStudentDto: CreateStudentDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.studentsService.create(tenantId, createStudentDto);
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: StudentQueryDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.studentsService.findAll(tenantId, query);
  }

  @Get('stats')
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.studentsService.getStats(tenantId);
  }

  @Get(':id')
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.studentsService.findOne(tenantId, id);
  }

  @Get('user/:userId')
  findByUserId(
    @Headers('x-tenant-id') tenantId: string,
    @Param('userId') userId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.studentsService.findByUserId(tenantId, userId);
  }

  @Get(':id/dashboard')
  getDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.studentsService.getDashboard(tenantId, id);
  }

  @Get(':id/academics')
  getAcademics(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.studentsService.getAcademics(tenantId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.studentsService.update(tenantId, id, updateStudentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.studentsService.remove(tenantId, id);
  }
}
