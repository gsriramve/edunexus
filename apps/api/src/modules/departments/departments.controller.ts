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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/create-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDepartmentDto: CreateDepartmentDto,
  ) {
    return this.departmentsService.create(tenantId, createDepartmentDto);
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.departmentsService.findAll(tenantId, {
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('stats')
  getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.departmentsService.getStats(tenantId);
  }

  @Get(':id')
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.departmentsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(tenantId, id, updateDepartmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.departmentsService.remove(tenantId, id);
  }
}
