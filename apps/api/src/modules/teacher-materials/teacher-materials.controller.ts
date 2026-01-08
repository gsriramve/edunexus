import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { TeacherMaterialsService } from './teacher-materials.service';
import {
  QueryMaterialsDto,
  QueryFoldersDto,
  CreateFolderDto,
  UpdateFolderDto,
  CreateMaterialDto,
  UpdateMaterialDto,
} from './dto/teacher-materials.dto';

@Controller('teacher-materials')
export class TeacherMaterialsController {
  constructor(private readonly materialsService: TeacherMaterialsService) {}

  private getTenantAndUser(
    tenantIdHeader: string,
    userIdHeader: string,
  ): { tenantId: string; staffId: string } {
    if (!tenantIdHeader) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    if (!userIdHeader) {
      throw new BadRequestException('x-user-id header is required');
    }
    return { tenantId: tenantIdHeader, staffId: userIdHeader };
  }

  // ==================== Stats ====================

  @Get('stats')
  async getStats(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.materialsService.getStats(tid, staffId);
  }

  // ==================== Subjects ====================

  @Get('subjects')
  async getSubjects(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.materialsService.getTeacherSubjects(tid, staffId);
  }

  // ==================== Folders ====================

  @Get('folders')
  async getFolders(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryFoldersDto,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.materialsService.getFolders(tid, staffId, query);
  }

  @Post('folders')
  async createFolder(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateFolderDto,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.materialsService.createFolder(tid, staffId, data);
  }

  @Patch('folders/:id')
  async updateFolder(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') folderId: string,
    @Body() data: UpdateFolderDto,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.materialsService.updateFolder(tid, staffId, folderId, data);
  }

  @Delete('folders/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFolder(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') folderId: string,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    await this.materialsService.deleteFolder(tid, staffId, folderId);
  }

  // ==================== Materials ====================

  @Get()
  async getMaterials(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryMaterialsDto,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.materialsService.getMaterials(tid, staffId, query);
  }

  @Get(':id')
  async getMaterial(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') materialId: string,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.materialsService.getMaterial(tid, staffId, materialId);
  }

  @Post()
  async createMaterial(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateMaterialDto,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.materialsService.createMaterial(tid, staffId, data);
  }

  @Patch(':id')
  async updateMaterial(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') materialId: string,
    @Body() data: UpdateMaterialDto,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.materialsService.updateMaterial(tid, staffId, materialId, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMaterial(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') materialId: string,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    await this.materialsService.deleteMaterial(tid, staffId, materialId);
  }

  // ==================== Download Tracking ====================

  @Post(':id/download')
  @HttpCode(HttpStatus.OK)
  async trackDownload(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') materialId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    await this.materialsService.incrementDownload(tenantId, materialId);
    return { success: true };
  }
}
