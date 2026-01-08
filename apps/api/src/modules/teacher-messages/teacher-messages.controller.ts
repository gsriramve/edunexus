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
import { TeacherMessagesService } from './teacher-messages.service';
import {
  SendMessageDto,
  ReplyMessageDto,
  MessageQueryDto,
  MarkReadDto,
  BulkActionDto,
} from './dto/teacher-messages.dto';

@Controller('teacher/messages')
export class TeacherMessagesController {
  constructor(private readonly teacherMessagesService: TeacherMessagesService) {}

  private getTenantId(headers: Record<string, string>): string {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return tenantId;
  }

  private getUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return userId;
  }

  // =============================================================================
  // INBOX
  // =============================================================================

  @Get('inbox')
  getInbox(
    @Headers() headers: Record<string, string>,
    @Query() query: MessageQueryDto,
  ) {
    return this.teacherMessagesService.getInbox(
      this.getTenantId(headers),
      this.getUserId(headers),
      query,
    );
  }

  // =============================================================================
  // SENT
  // =============================================================================

  @Get('sent')
  getSent(
    @Headers() headers: Record<string, string>,
    @Query() query: MessageQueryDto,
  ) {
    return this.teacherMessagesService.getSent(
      this.getTenantId(headers),
      this.getUserId(headers),
      query,
    );
  }

  // =============================================================================
  // GET MESSAGE BY ID
  // =============================================================================

  @Get(':id')
  getMessageById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.teacherMessagesService.getMessageById(
      this.getTenantId(headers),
      this.getUserId(headers),
      id,
    );
  }

  // =============================================================================
  // SEND MESSAGE
  // =============================================================================

  @Post('send')
  sendMessage(
    @Headers() headers: Record<string, string>,
    @Body() dto: SendMessageDto,
  ) {
    return this.teacherMessagesService.sendMessage(
      this.getTenantId(headers),
      this.getUserId(headers),
      dto,
    );
  }

  // =============================================================================
  // REPLY
  // =============================================================================

  @Post('reply')
  replyToMessage(
    @Headers() headers: Record<string, string>,
    @Body() dto: ReplyMessageDto,
  ) {
    return this.teacherMessagesService.replyToMessage(
      this.getTenantId(headers),
      this.getUserId(headers),
      dto,
    );
  }

  // =============================================================================
  // MARK AS READ
  // =============================================================================

  @Post('read')
  markAsRead(
    @Headers() headers: Record<string, string>,
    @Body() dto: MarkReadDto,
  ) {
    return this.teacherMessagesService.markAsRead(
      this.getTenantId(headers),
      this.getUserId(headers),
      dto.messageIds,
    );
  }

  // =============================================================================
  // TOGGLE STAR
  // =============================================================================

  @Patch(':id/star')
  toggleStar(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.teacherMessagesService.toggleStar(
      this.getTenantId(headers),
      this.getUserId(headers),
      id,
    );
  }

  // =============================================================================
  // ARCHIVE
  // =============================================================================

  @Post('archive')
  archiveMessages(
    @Headers() headers: Record<string, string>,
    @Body() dto: BulkActionDto,
  ) {
    return this.teacherMessagesService.archiveMessages(
      this.getTenantId(headers),
      this.getUserId(headers),
      dto.messageIds,
    );
  }

  // =============================================================================
  // DELETE
  // =============================================================================

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  deleteMessages(
    @Headers() headers: Record<string, string>,
    @Body() dto: BulkActionDto,
  ) {
    return this.teacherMessagesService.deleteMessages(
      this.getTenantId(headers),
      this.getUserId(headers),
      dto.messageIds,
    );
  }

  // =============================================================================
  // STATS
  // =============================================================================

  @Get('stats/overview')
  getStats(@Headers() headers: Record<string, string>) {
    return this.teacherMessagesService.getStats(
      this.getTenantId(headers),
      this.getUserId(headers),
    );
  }

  // =============================================================================
  // CLASSES (for compose dropdown)
  // =============================================================================

  @Get('recipients/classes')
  getTeacherClasses(@Headers() headers: Record<string, string>) {
    return this.teacherMessagesService.getTeacherClasses(
      this.getTenantId(headers),
      this.getUserId(headers),
    );
  }

  // =============================================================================
  // SEARCH RECIPIENTS
  // =============================================================================

  @Get('recipients/search')
  searchRecipients(
    @Headers() headers: Record<string, string>,
    @Query('q') search: string,
    @Query('type') type?: string,
  ) {
    return this.teacherMessagesService.searchRecipients(
      this.getTenantId(headers),
      this.getUserId(headers),
      search || '',
      type,
    );
  }
}
