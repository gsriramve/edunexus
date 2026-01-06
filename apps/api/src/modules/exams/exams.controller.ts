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
import { ExamsService } from './exams.service';
import { CreateExamDto, UpdateExamDto, ExamQueryDto } from './dto/exam.dto';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createExamDto: CreateExamDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examsService.create(tenantId, createExamDto);
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: ExamQueryDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examsService.findAll(tenantId, query);
  }

  @Get('stats')
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examsService.getStats(tenantId);
  }

  @Get('upcoming')
  getUpcoming(
    @Headers('x-tenant-id') tenantId: string,
    @Query('studentId') studentId?: string,
    @Query('days') days?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.examsService.getUpcoming(tenantId, studentId, daysNum);
  }

  @Get('subject/:subjectId')
  getBySubject(
    @Headers('x-tenant-id') tenantId: string,
    @Param('subjectId') subjectId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examsService.getBySubject(tenantId, subjectId);
  }

  @Get(':id')
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateExamDto: UpdateExamDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examsService.update(tenantId, id, updateExamDto);
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
    return this.examsService.remove(tenantId, id);
  }
}
