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
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ImportExportService } from './import-export.service';
import {
  CreateImportJobDto,
  UpdateImportJobDto,
  ImportJobQueryDto,
  CreateExportJobDto,
  ExportJobQueryDto,
  CreateImportTemplateDto,
  UpdateImportTemplateDto,
  ImportTemplateQueryDto,
  EntityType,
} from './dto/import-export.dto';

@Controller('import-export')
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  private getTenantId(headers: Record<string, string>): string {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return tenantId;
  }

  // =============================================================================
  // ENTITY FIELDS
  // =============================================================================

  @Get('fields/:entityType')
  getEntityFields(@Param('entityType') entityType: string) {
    const fields = this.importExportService.getEntityFields(entityType);
    if (fields.length === 0) {
      throw new BadRequestException(`Unknown entity type: ${entityType}`);
    }
    return { entityType, fields };
  }

  @Get('entity-types')
  getEntityTypes() {
    return {
      types: Object.values(EntityType).map((type) => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '),
        fields: this.importExportService.getEntityFields(type),
      })),
    };
  }

  // =============================================================================
  // SAMPLE TEMPLATES
  // =============================================================================

  @Get('sample-template/:entityType')
  async downloadSampleTemplate(
    @Param('entityType') entityType: string,
    @Res() res: Response,
  ) {
    const buffer = await this.importExportService.generateSampleTemplate(entityType);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${entityType}_template.xlsx`);
    res.send(buffer);
  }

  // =============================================================================
  // IMPORT JOBS
  // =============================================================================

  @Post('import')
  createImportJob(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateImportJobDto,
  ) {
    return this.importExportService.createImportJob(this.getTenantId(headers), dto);
  }

  @Get('import')
  findAllImportJobs(
    @Headers() headers: Record<string, string>,
    @Query() query: ImportJobQueryDto,
  ) {
    return this.importExportService.findAllImportJobs(this.getTenantId(headers), query);
  }

  @Get('import/:id')
  findImportJobById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.importExportService.findImportJobById(this.getTenantId(headers), id);
  }

  @Patch('import/:id')
  updateImportJob(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateImportJobDto,
  ) {
    return this.importExportService.updateImportJob(this.getTenantId(headers), id, dto);
  }

  @Post('import/:id/cancel')
  cancelImportJob(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.importExportService.cancelImportJob(this.getTenantId(headers), id);
  }

  @Delete('import/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteImportJob(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.importExportService.deleteImportJob(this.getTenantId(headers), id);
  }

  @Post('import/:id/validate')
  @UseInterceptors(FileInterceptor('file'))
  async validateImportFile(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.importExportService.validateImportData(
      this.getTenantId(headers),
      id,
      file.buffer,
    );
  }

  @Post('import/:id/process')
  @UseInterceptors(FileInterceptor('file'))
  async processImportJob(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.importExportService.processImportJob(
      this.getTenantId(headers),
      id,
      file.buffer,
    );
  }

  @Post('import/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndValidate(
    @Headers() headers: Record<string, string>,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { entityType: string; createdById: string },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const tenantId = this.getTenantId(headers);

    // Create job
    const job = await this.importExportService.createImportJob(tenantId, {
      entityType: body.entityType as EntityType,
      fileName: file.originalname,
      fileSize: file.size,
      createdById: body.createdById,
    });

    // Validate
    const validation = await this.importExportService.validateImportData(
      tenantId,
      job.id,
      file.buffer,
    );

    return {
      job,
      validation,
    };
  }

  @Post('import/quick')
  @UseInterceptors(FileInterceptor('file'))
  async quickImport(
    @Headers() headers: Record<string, string>,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { entityType: string; createdById: string; updateExisting?: string },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const tenantId = this.getTenantId(headers);
    const updateExisting = body.updateExisting === 'true';

    // Create job
    const job = await this.importExportService.createImportJob(tenantId, {
      entityType: body.entityType as EntityType,
      fileName: file.originalname,
      fileSize: file.size,
      createdById: body.createdById,
      options: { updateExisting },
    });

    // Process directly
    const result = await this.importExportService.processImportJob(
      tenantId,
      job.id,
      file.buffer,
    );

    const finalJob = await this.importExportService.findImportJobById(tenantId, job.id);

    return {
      job: finalJob,
      result,
    };
  }

  // =============================================================================
  // EXPORT JOBS
  // =============================================================================

  @Post('export')
  createExportJob(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateExportJobDto,
  ) {
    return this.importExportService.createExportJob(this.getTenantId(headers), dto);
  }

  @Get('export')
  findAllExportJobs(
    @Headers() headers: Record<string, string>,
    @Query() query: ExportJobQueryDto,
  ) {
    return this.importExportService.findAllExportJobs(this.getTenantId(headers), query);
  }

  @Get('export/:id')
  findExportJobById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.importExportService.findExportJobById(this.getTenantId(headers), id);
  }

  @Post('export/:id/process')
  async processExportJob(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const tenantId = this.getTenantId(headers);
    const job = await this.importExportService.findExportJobById(tenantId, id);
    const buffer = await this.importExportService.processExportJob(tenantId, id);

    await this.importExportService.incrementDownloadCount(tenantId, id);

    const contentType =
      job.format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${job.fileName}`);
    res.send(buffer);
  }

  @Get('export/:id/download')
  async downloadExport(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const tenantId = this.getTenantId(headers);
    const job = await this.importExportService.findExportJobById(tenantId, id);

    if (job.status !== 'completed') {
      throw new BadRequestException('Export is not ready for download');
    }

    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      throw new BadRequestException('Export download link has expired');
    }

    // Re-process to generate file (in production, would fetch from S3)
    const buffer = await this.importExportService.processExportJob(tenantId, id);
    await this.importExportService.incrementDownloadCount(tenantId, id);

    const contentType =
      job.format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${job.fileName}`);
    res.send(buffer);
  }

  @Post('export/quick')
  async quickExport(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateExportJobDto,
    @Res() res: Response,
  ) {
    const tenantId = this.getTenantId(headers);

    // Create job
    const job = await this.importExportService.createExportJob(tenantId, dto);

    // Process and download
    const buffer = await this.importExportService.processExportJob(tenantId, job.id);

    const contentType =
      (dto.format || 'xlsx') === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${job.fileName}`);
    res.send(buffer);
  }

  // =============================================================================
  // IMPORT TEMPLATES
  // =============================================================================

  @Post('templates')
  createImportTemplate(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateImportTemplateDto,
  ) {
    return this.importExportService.createImportTemplate(this.getTenantId(headers), dto);
  }

  @Get('templates')
  findAllImportTemplates(
    @Headers() headers: Record<string, string>,
    @Query() query: ImportTemplateQueryDto,
  ) {
    return this.importExportService.findAllImportTemplates(this.getTenantId(headers), query);
  }

  @Get('templates/:id')
  findImportTemplateById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.importExportService.findImportTemplateById(this.getTenantId(headers), id);
  }

  @Patch('templates/:id')
  updateImportTemplate(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateImportTemplateDto,
  ) {
    return this.importExportService.updateImportTemplate(this.getTenantId(headers), id, dto);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteImportTemplate(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.importExportService.deleteImportTemplate(this.getTenantId(headers), id);
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  @Get('stats')
  getStats(@Headers() headers: Record<string, string>) {
    return this.importExportService.getStats(this.getTenantId(headers));
  }
}
