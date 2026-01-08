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
} from '@nestjs/common';
import type { Response } from 'express';
import { IdCardsService } from './id-cards.service';
import {
  GenerateIdCardDto,
  BulkGenerateIdCardsDto,
  RevokeIdCardDto,
  IdCardQueryDto,
} from './dto/id-cards.dto';

@Controller('id-cards')
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
  getStats(@Headers() headers: Record<string, string>) {
    return this.idCardsService.getStats(this.getTenantId(headers));
  }

  // =============================================================================
  // ID CARD GENERATION
  // =============================================================================

  @Post('generate/:studentId')
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

  @Post('bulk-generate')
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
  listIdCards(
    @Headers() headers: Record<string, string>,
    @Query() query: IdCardQueryDto,
  ) {
    return this.idCardsService.listIdCards(this.getTenantId(headers), query);
  }

  @Get('student/:studentId')
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
  // =============================================================================

  @Get('verify/:token')
  verifyIdCard(@Param('token') token: string) {
    return this.idCardsService.verifyIdCard(token);
  }

  // =============================================================================
  // ID CARD MANAGEMENT
  // =============================================================================

  @Patch(':id/revoke')
  revokeIdCard(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: RevokeIdCardDto,
  ) {
    return this.idCardsService.revokeIdCard(this.getTenantId(headers), id, dto);
  }
}
