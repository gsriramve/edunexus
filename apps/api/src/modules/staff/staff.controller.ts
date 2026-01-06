import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto, StaffRole } from './dto/create-staff.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createStaffDto: CreateStaffDto,
  ) {
    return this.staffService.create(tenantId, createStaffDto);
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('role') role?: StaffRole,
    @Query('status') status?: 'active' | 'inactive',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.staffService.findAll(tenantId, {
      search,
      departmentId,
      role,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('stats')
  getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.staffService.getStats(tenantId);
  }

  @Get('teachers')
  getTeachers(
    @Headers('x-tenant-id') tenantId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.staffService.getTeachers(tenantId, departmentId);
  }

  @Get(':id')
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.staffService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    return this.staffService.update(tenantId, id, updateStaffDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.staffService.remove(tenantId, id);
  }
}
