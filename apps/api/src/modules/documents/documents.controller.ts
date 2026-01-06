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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { S3Service } from './s3.service';
import {
  CreateFolderDto,
  UpdateFolderDto,
  UploadDocumentDto,
  UpdateDocumentDto,
  DocumentQueryDto,
  CreateShareDto,
  UpdateShareDto,
  AccessLogQueryDto,
  UpdateDocumentSettingsDto,
  VerifyDocumentDto,
  BulkDeleteDto,
  BulkMoveDto,
  BulkUpdateVisibilityDto,
  GetUploadUrlDto,
} from './dto/documents.dto';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly s3Service: S3Service,
  ) {}

  // ==================== Statistics ====================

  @Get('stats')
  async getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.getStats(tenantId);
  }

  // ==================== Settings ====================

  @Get('settings')
  async getSettings(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.getOrCreateSettings(tenantId);
  }

  @Patch('settings')
  async updateSettings(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: UpdateDocumentSettingsDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.updateSettings(tenantId, dto);
  }

  // ==================== Folder Operations ====================

  @Post('folders')
  async createFolder(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateFolderDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.createFolder(tenantId, dto);
  }

  @Get('folders')
  async getFolders(
    @Headers('x-tenant-id') tenantId: string,
    @Query('parentId') parentId?: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.getFolders(tenantId, parentId);
  }

  @Get('folders/:id')
  async getFolderById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.getFolderById(tenantId, id);
  }

  @Get('folders/:id/breadcrumb')
  async getFolderBreadcrumb(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.getFolderBreadcrumb(tenantId, id);
  }

  @Patch('folders/:id')
  async updateFolder(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFolderDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.updateFolder(tenantId, id, dto);
  }

  @Delete('folders/:id')
  async deleteFolder(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.deleteFolder(tenantId, id);
  }

  // ==================== Document Operations ====================

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  }))
  async uploadDocument(
    @Headers('x-tenant-id') tenantId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    if (!file) throw new BadRequestException('File is required');
    return this.documentsService.uploadDocument(tenantId, file, dto);
  }

  @Get()
  async getDocuments(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: DocumentQueryDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.getDocuments(tenantId, query);
  }

  @Get('user/:userId')
  async getUserDocuments(
    @Headers('x-tenant-id') tenantId: string,
    @Param('userId') userId: string,
    @Query('userType') userType: string = 'student',
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.getUserDocuments(tenantId, userId, userType);
  }

  @Get(':id')
  async getDocumentById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.getDocumentById(tenantId, id);
  }

  @Patch(':id')
  async updateDocument(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.updateDocument(tenantId, id, dto);
  }

  @Patch(':id/verify')
  async verifyDocument(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: VerifyDocumentDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.verifyDocument(tenantId, id, dto);
  }

  @Delete(':id')
  async deleteDocument(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Query('hard') hard?: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.deleteDocument(tenantId, id, hard === 'true');
  }

  // ==================== Download/View URLs ====================

  @Get(':id/download')
  async getDownloadUrl(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('userName') userName: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    if (!userId) throw new BadRequestException('User ID required');
    return this.documentsService.getDownloadUrl(tenantId, id, userId, userName || 'Unknown');
  }

  @Get(':id/view')
  async getViewUrl(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('userName') userName: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    if (!userId) throw new BadRequestException('User ID required');
    return this.documentsService.getViewUrl(tenantId, id, userId, userName || 'Unknown');
  }

  // ==================== Presigned Upload URL ====================

  @Post('upload-url')
  async getUploadUrl(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: GetUploadUrlDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    const key = this.s3Service.generateKey(tenantId, dto.category, dto.filename);
    const result = await this.s3Service.getUploadUrl(key, dto.contentType, dto.expiresIn);
    return { ...result, key };
  }

  // ==================== Share Operations ====================

  @Post('shares')
  async createShare(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateShareDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.createShare(tenantId, dto);
  }

  @Patch('shares/:id')
  async updateShare(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateShareDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.updateShare(tenantId, id, dto);
  }

  @Delete('shares/:id')
  async deleteShare(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.deleteShare(tenantId, id);
  }

  // ==================== Public Share Access (no tenant required) ====================

  @Get('shared/:token')
  async getSharedDocument(@Param('token') token: string) {
    return this.documentsService.getShareByToken(token);
  }

  @Post('shared/:token/access')
  async accessSharedDocument(
    @Param('token') token: string,
    @Body('password') password?: string,
  ) {
    return this.documentsService.accessSharedDocument(token, password);
  }

  // ==================== Access Logs ====================

  @Get('logs')
  async getAccessLogs(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: AccessLogQueryDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.getAccessLogs(tenantId, query);
  }

  // ==================== Bulk Operations ====================

  @Post('bulk/delete')
  async bulkDelete(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: BulkDeleteDto,
    @Query('hard') hard?: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.bulkDelete(tenantId, dto, hard === 'true');
  }

  @Post('bulk/move')
  async bulkMove(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: BulkMoveDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.bulkMove(tenantId, dto);
  }

  @Post('bulk/visibility')
  async bulkUpdateVisibility(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: BulkUpdateVisibilityDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    return this.documentsService.bulkUpdateVisibility(tenantId, dto);
  }
}
