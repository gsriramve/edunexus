import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Headers,
  BadRequestException,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { IdCardsService } from './id-cards.service';
import {
  GenerateIdCardDto,
  BulkGenerateIdCardsDto,
  RevokeIdCardDto,
  IdCardQueryDto,
} from './dto/id-cards.dto';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('id-cards')
@UseGuards(RolesGuard)
export class IdCardsController {
  constructor(private readonly idCardsService: IdCardsService) {}

  private getTenantId(headers: Record<string, string>): string {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return tenantId;
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  @Get('stats')
  @Roles('admin_staff', 'principal', 'hod')
  getStats(@Headers() headers: Record<string, string>) {
    return this.idCardsService.getStats(this.getTenantId(headers));
  }

  // =============================================================================
  // ID CARD GENERATION
  // =============================================================================

  /**
   * Generate ID card for a specific student (admin use)
   */
  @Post('generate/:studentId')
  @Roles('admin_staff', 'principal', 'hod')
  generateIdCard(
    @Headers() headers: Record<string, string>,
    @Param('studentId') studentId: string,
    @Body() dto: GenerateIdCardDto,
  ) {
    return this.idCardsService.generateIdCard(
      this.getTenantId(headers),
      studentId,
      dto,
    );
  }

  /**
   * Generate ID card for the current student (self-service)
   */
  @Post('generate-my-card')
  @Roles('student')
  async generateMyIdCard(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: GenerateIdCardDto,
  ) {
    // Find the student ID from the user ID
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const student = await prisma.student.findFirst({
        where: { userId, tenantId },
      });
      if (!student) {
        throw new BadRequestException('Student profile not found');
      }
      return this.idCardsService.generateIdCard(tenantId, student.id, dto);
    } finally {
      await prisma.$disconnect();
    }
  }

  @Post('bulk-generate')
  @Roles('admin_staff', 'principal', 'hod')
  bulkGenerateIdCards(
    @Headers() headers: Record<string, string>,
    @Body() dto: BulkGenerateIdCardsDto,
  ) {
    return this.idCardsService.bulkGenerateIdCards(
      this.getTenantId(headers),
      dto,
    );
  }

  // =============================================================================
  // ID CARD RETRIEVAL
  // =============================================================================

  @Get()
  @Roles('admin_staff', 'principal', 'hod')
  listIdCards(
    @Headers() headers: Record<string, string>,
    @Query() query: IdCardQueryDto,
  ) {
    return this.idCardsService.listIdCards(this.getTenantId(headers), query);
  }

  /**
   * Get the current student's ID card
   */
  @Get('my-card')
  @Roles('student')
  async getMyIdCard(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    // Find the student ID from the user ID
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const student = await prisma.student.findFirst({
        where: { userId, tenantId },
      });
      if (!student) {
        return null; // Return null instead of throwing error
      }
      try {
        return await this.idCardsService.getIdCardByStudentId(tenantId, student.id);
      } catch {
        // Return null if no ID card found (instead of 404)
        return null;
      }
    } finally {
      await prisma.$disconnect();
    }
  }

  @Get('student/:studentId')
  @Roles('student', 'admin_staff', 'principal', 'hod', 'teacher')
  getIdCardByStudentId(
    @Headers() headers: Record<string, string>,
    @Param('studentId') studentId: string,
  ) {
    return this.idCardsService.getIdCardByStudentId(
      this.getTenantId(headers),
      studentId,
    );
  }

  @Get(':id')
  @Roles('student', 'admin_staff', 'principal', 'hod', 'teacher')
  getIdCardById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.idCardsService.getIdCardById(this.getTenantId(headers), id);
  }

  // =============================================================================
  // PDF GENERATION
  // =============================================================================

  @Get(':id/pdf')
  @Roles('student', 'admin_staff', 'principal', 'hod', 'teacher')
  async generatePdf(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const tenantId = this.getTenantId(headers);
    const pdfBuffer = await this.idCardsService.generatePdf(tenantId, id);

    // Get card info for filename
    const card = await this.idCardsService.getIdCardById(tenantId, id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="id-card-${card.cardNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }

  // =============================================================================
  // PUBLIC VERIFICATION (No tenant ID required)
  // This endpoint skips role check - it's publicly accessible for QR verification
  // =============================================================================

  @Get('verify/:token')
  verifyIdCard(@Param('token') token: string) {
    return this.idCardsService.verifyIdCard(token);
  }

  // =============================================================================
  // ID CARD MANAGEMENT
  // =============================================================================

  @Patch(':id/revoke')
  @Roles('admin_staff', 'principal', 'hod')
  revokeIdCard(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: RevokeIdCardDto,
  ) {
    return this.idCardsService.revokeIdCard(this.getTenantId(headers), id, dto);
  }
}
