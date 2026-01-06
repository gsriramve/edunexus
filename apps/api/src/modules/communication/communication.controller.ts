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
import { CommunicationService } from './communication.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementQueryDto,
  MarkAnnouncementReadDto,
  AcknowledgeAnnouncementDto,
  CreateCommentDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateQueryDto,
  CreateBulkCommunicationDto,
  UpdateBulkCommunicationDto,
  BulkCommunicationQueryDto,
  CommunicationLogQueryDto,
  SendSingleMessageDto,
} from './dto/communication.dto';

@Controller('communication')
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  private getTenantId(headers: Record<string, string>): string {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return tenantId;
  }

  // =============================================================================
  // ANNOUNCEMENTS
  // =============================================================================

  @Post('announcements')
  createAnnouncement(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.communicationService.createAnnouncement(this.getTenantId(headers), dto);
  }

  @Get('announcements')
  findAllAnnouncements(
    @Headers() headers: Record<string, string>,
    @Query() query: AnnouncementQueryDto,
  ) {
    return this.communicationService.findAllAnnouncements(this.getTenantId(headers), query);
  }

  @Get('announcements/:id')
  findAnnouncementById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.communicationService.findAnnouncementById(this.getTenantId(headers), id);
  }

  @Patch('announcements/:id')
  updateAnnouncement(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.communicationService.updateAnnouncement(this.getTenantId(headers), id, dto);
  }

  @Delete('announcements/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAnnouncement(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.communicationService.deleteAnnouncement(this.getTenantId(headers), id);
  }

  @Post('announcements/:id/publish')
  publishAnnouncement(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.communicationService.publishAnnouncement(this.getTenantId(headers), id);
  }

  @Post('announcements/:id/archive')
  archiveAnnouncement(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.communicationService.archiveAnnouncement(this.getTenantId(headers), id);
  }

  // Get announcements for current user (students/staff/parents view)
  @Get('announcements/user/:userId')
  getAnnouncementsForUser(
    @Headers() headers: Record<string, string>,
    @Param('userId') userId: string,
    @Query('userType') userType: string,
    @Query('departmentId') departmentId?: string,
    @Query('courseId') courseId?: string,
    @Query('batchYear') batchYear?: string,
  ) {
    return this.communicationService.getAnnouncementsForUser(
      this.getTenantId(headers),
      userId,
      userType,
      departmentId,
      courseId,
      batchYear ? parseInt(batchYear) : undefined,
    );
  }

  // =============================================================================
  // ANNOUNCEMENT RECIPIENTS
  // =============================================================================

  @Post('announcements/read')
  markAnnouncementRead(
    @Headers() headers: Record<string, string>,
    @Body() dto: MarkAnnouncementReadDto,
  ) {
    return this.communicationService.markAnnouncementRead(this.getTenantId(headers), dto);
  }

  @Post('announcements/acknowledge')
  acknowledgeAnnouncement(
    @Headers() headers: Record<string, string>,
    @Body() dto: AcknowledgeAnnouncementDto,
  ) {
    return this.communicationService.acknowledgeAnnouncement(this.getTenantId(headers), dto);
  }

  @Get('announcements/:id/recipients')
  getAnnouncementRecipients(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Query('readOnly') readOnly?: string,
  ) {
    const readOnlyBool = readOnly === 'true' ? true : readOnly === 'false' ? false : undefined;
    return this.communicationService.getAnnouncementRecipients(this.getTenantId(headers), id, readOnlyBool);
  }

  // =============================================================================
  // ANNOUNCEMENT COMMENTS
  // =============================================================================

  @Post('comments')
  createComment(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateCommentDto,
  ) {
    return this.communicationService.createComment(this.getTenantId(headers), dto);
  }

  @Get('announcements/:announcementId/comments')
  getComments(
    @Headers() headers: Record<string, string>,
    @Param('announcementId') announcementId: string,
  ) {
    return this.communicationService.getComments(this.getTenantId(headers), announcementId);
  }

  @Post('comments/:id/hide')
  hideComment(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.communicationService.hideComment(this.getTenantId(headers), id);
  }

  // =============================================================================
  // MESSAGE TEMPLATES
  // =============================================================================

  @Post('templates')
  createTemplate(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.communicationService.createTemplate(this.getTenantId(headers), dto);
  }

  @Get('templates')
  findAllTemplates(
    @Headers() headers: Record<string, string>,
    @Query() query: TemplateQueryDto,
  ) {
    return this.communicationService.findAllTemplates(this.getTenantId(headers), query);
  }

  @Get('templates/:id')
  findTemplateById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.communicationService.findTemplateById(this.getTenantId(headers), id);
  }

  @Get('templates/code/:code')
  findTemplateByCode(
    @Headers() headers: Record<string, string>,
    @Param('code') code: string,
  ) {
    return this.communicationService.findTemplateByCode(this.getTenantId(headers), code);
  }

  @Patch('templates/:id')
  updateTemplate(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.communicationService.updateTemplate(this.getTenantId(headers), id, dto);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTemplate(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.communicationService.deleteTemplate(this.getTenantId(headers), id);
  }

  // =============================================================================
  // BULK COMMUNICATION
  // =============================================================================

  @Post('bulk')
  createBulkCommunication(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateBulkCommunicationDto,
  ) {
    return this.communicationService.createBulkCommunication(this.getTenantId(headers), dto);
  }

  @Get('bulk')
  findAllBulkCommunications(
    @Headers() headers: Record<string, string>,
    @Query() query: BulkCommunicationQueryDto,
  ) {
    return this.communicationService.findAllBulkCommunications(this.getTenantId(headers), query);
  }

  @Get('bulk/:id')
  findBulkCommunicationById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.communicationService.findBulkCommunicationById(this.getTenantId(headers), id);
  }

  @Patch('bulk/:id')
  updateBulkCommunication(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateBulkCommunicationDto,
  ) {
    return this.communicationService.updateBulkCommunication(this.getTenantId(headers), id, dto);
  }

  @Delete('bulk/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBulkCommunication(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.communicationService.deleteBulkCommunication(this.getTenantId(headers), id);
  }

  @Post('bulk/:id/cancel')
  cancelBulkCommunication(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.communicationService.cancelBulkCommunication(this.getTenantId(headers), id);
  }

  @Post('bulk/:id/send')
  startBulkCommunication(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.communicationService.startBulkCommunication(this.getTenantId(headers), id);
  }

  // =============================================================================
  // COMMUNICATION LOGS
  // =============================================================================

  @Get('logs')
  findAllLogs(
    @Headers() headers: Record<string, string>,
    @Query() query: CommunicationLogQueryDto,
  ) {
    return this.communicationService.findAllLogs(this.getTenantId(headers), query);
  }

  // =============================================================================
  // SEND MESSAGE
  // =============================================================================

  @Post('send')
  sendSingleMessage(
    @Headers() headers: Record<string, string>,
    @Body() dto: SendSingleMessageDto,
  ) {
    return this.communicationService.sendSingleMessage(this.getTenantId(headers), dto);
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  @Get('stats')
  getStats(@Headers() headers: Record<string, string>) {
    return this.communicationService.getStats(this.getTenantId(headers));
  }
}
