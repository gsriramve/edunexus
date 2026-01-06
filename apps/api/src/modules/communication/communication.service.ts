import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
  CreateCommunicationLogDto,
  CommunicationLogQueryDto,
  SendSingleMessageDto,
  AnnouncementStatus,
  CommunicationStatus,
  MessageStatus,
} from './dto/communication.dto';

@Injectable()
export class CommunicationService {
  constructor(private prisma: PrismaService) {}

  // =============================================================================
  // ANNOUNCEMENTS
  // =============================================================================

  async createAnnouncement(tenantId: string, dto: CreateAnnouncementDto) {
    const data: any = {
      tenantId,
      ...dto,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    };

    // If status is published and no publishedAt, set it now
    if (dto.status === AnnouncementStatus.PUBLISHED && !dto.publishedAt) {
      data.publishedAt = new Date();
    }

    return this.prisma.announcement.create({
      data,
      include: {
        _count: {
          select: { recipients: true },
        },
      },
    });
  }

  async findAllAnnouncements(tenantId: string, query: AnnouncementQueryDto) {
    const { search, type, audience, status, priority, pinnedOnly, activeOnly, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (audience) where.audience = audience;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (pinnedOnly) where.isPinned = true;

    if (activeOnly) {
      where.status = AnnouncementStatus.PUBLISHED;
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ];
    }

    const [announcements, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: { recipients: true },
          },
        },
      }),
      this.prisma.announcement.count({ where }),
    ]);

    return { announcements, total, limit, offset };
  }

  async findAnnouncementById(tenantId: string, id: string) {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id, tenantId },
      include: {
        recipients: {
          take: 100,
          orderBy: { deliveredAt: 'desc' },
        },
        _count: {
          select: { recipients: true },
        },
      },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  async updateAnnouncement(tenantId: string, id: string, dto: UpdateAnnouncementDto) {
    await this.findAnnouncementById(tenantId, id);

    const data: any = { ...dto };
    if (dto.publishedAt) data.publishedAt = new Date(dto.publishedAt);
    if (dto.expiresAt) data.expiresAt = new Date(dto.expiresAt);

    // If changing to published and no publishedAt, set it now
    if (dto.status === AnnouncementStatus.PUBLISHED && !dto.publishedAt) {
      const current = await this.prisma.announcement.findUnique({ where: { id } });
      if (!current?.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    return this.prisma.announcement.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { recipients: true },
        },
      },
    });
  }

  async deleteAnnouncement(tenantId: string, id: string) {
    await this.findAnnouncementById(tenantId, id);

    return this.prisma.announcement.delete({
      where: { id },
    });
  }

  async publishAnnouncement(tenantId: string, id: string) {
    await this.findAnnouncementById(tenantId, id);

    return this.prisma.announcement.update({
      where: { id },
      data: {
        status: AnnouncementStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async archiveAnnouncement(tenantId: string, id: string) {
    await this.findAnnouncementById(tenantId, id);

    return this.prisma.announcement.update({
      where: { id },
      data: {
        status: AnnouncementStatus.ARCHIVED,
      },
    });
  }

  // Get announcements for a specific user (student/staff/parent)
  async getAnnouncementsForUser(tenantId: string, userId: string, userType: string, departmentId?: string, courseId?: string, batchYear?: number) {
    const where: any = {
      tenantId,
      status: AnnouncementStatus.PUBLISHED,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    };

    // Build audience filter based on user type
    const audienceConditions: any[] = [
      { audience: 'all' },
      { audience: userType === 'student' ? 'students' : userType === 'staff' ? 'staff' : 'parents' },
    ];

    // Add department-specific announcements
    if (departmentId) {
      audienceConditions.push({
        audience: 'department',
        audienceFilters: { path: ['departmentIds'], array_contains: departmentId },
      });
    }

    // Add course-specific announcements
    if (courseId) {
      audienceConditions.push({
        audience: 'course',
        audienceFilters: { path: ['courseIds'], array_contains: courseId },
      });
    }

    // Add batch-specific announcements
    if (batchYear) {
      audienceConditions.push({
        audience: 'batch',
        audienceFilters: { path: ['batchYears'], array_contains: batchYear },
      });
    }

    where.AND = [{ OR: audienceConditions }];

    const announcements = await this.prisma.announcement.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: 50,
    });

    // Get read status for this user
    const announcementIds = announcements.map(a => a.id);
    const readStatus = await this.prisma.announcementRecipient.findMany({
      where: {
        announcementId: { in: announcementIds },
        userId,
      },
      select: {
        announcementId: true,
        readAt: true,
        acknowledged: true,
      },
    });

    const readMap = new Map(readStatus.map(r => [r.announcementId, r]));

    return announcements.map(announcement => ({
      ...announcement,
      isRead: readMap.has(announcement.id) && readMap.get(announcement.id)?.readAt !== null,
      isAcknowledged: readMap.get(announcement.id)?.acknowledged || false,
    }));
  }

  // =============================================================================
  // ANNOUNCEMENT RECIPIENTS
  // =============================================================================

  async markAnnouncementRead(tenantId: string, dto: MarkAnnouncementReadDto) {
    const { announcementId, userId, userType } = dto;

    // Upsert recipient record
    return this.prisma.announcementRecipient.upsert({
      where: {
        announcementId_userId: { announcementId, userId },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        tenantId,
        announcementId,
        userId,
        userType,
        readAt: new Date(),
      },
    });
  }

  async acknowledgeAnnouncement(tenantId: string, dto: AcknowledgeAnnouncementDto) {
    const { announcementId, userId } = dto;

    const recipient = await this.prisma.announcementRecipient.findUnique({
      where: {
        announcementId_userId: { announcementId, userId },
      },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient record not found');
    }

    return this.prisma.announcementRecipient.update({
      where: { id: recipient.id },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
      },
    });
  }

  async getAnnouncementRecipients(tenantId: string, announcementId: string, readOnly?: boolean) {
    const where: any = { tenantId, announcementId };
    if (readOnly === true) {
      where.readAt = { not: null };
    } else if (readOnly === false) {
      where.readAt = null;
    }

    return this.prisma.announcementRecipient.findMany({
      where,
      orderBy: { deliveredAt: 'desc' },
    });
  }

  // =============================================================================
  // ANNOUNCEMENT COMMENTS
  // =============================================================================

  async createComment(tenantId: string, dto: CreateCommentDto) {
    // Check if announcement allows comments
    const announcement = await this.prisma.announcement.findFirst({
      where: { id: dto.announcementId, tenantId },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (!announcement.allowComments) {
      throw new BadRequestException('Comments are not allowed on this announcement');
    }

    return this.prisma.announcementComment.create({
      data: {
        tenantId,
        ...dto,
      },
    });
  }

  async getComments(tenantId: string, announcementId: string) {
    return this.prisma.announcementComment.findMany({
      where: { tenantId, announcementId, isHidden: false },
      orderBy: { createdAt: 'asc' },
    });
  }

  async hideComment(tenantId: string, commentId: string) {
    return this.prisma.announcementComment.update({
      where: { id: commentId },
      data: { isHidden: true },
    });
  }

  // =============================================================================
  // MESSAGE TEMPLATES
  // =============================================================================

  async createTemplate(tenantId: string, dto: CreateTemplateDto) {
    // Check for duplicate code
    const existing = await this.prisma.messageTemplate.findFirst({
      where: { tenantId, code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Template with code "${dto.code}" already exists`);
    }

    return this.prisma.messageTemplate.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        type: dto.type,
        category: dto.category,
        subject: dto.subject,
        content: dto.content,
        variables: dto.variables ? (dto.variables as any) : undefined,
        isActive: dto.isActive,
      },
    });
  }

  async findAllTemplates(tenantId: string, query: TemplateQueryDto) {
    const { search, type, category, activeOnly, limit = 50, offset = 0 } = query;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (category) where.category = category;
    if (activeOnly) where.isActive = true;

    const [templates, total] = await Promise.all([
      this.prisma.messageTemplate.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.messageTemplate.count({ where }),
    ]);

    return { templates, total, limit, offset };
  }

  async findTemplateById(tenantId: string, id: string) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async findTemplateByCode(tenantId: string, code: string) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { tenantId, code, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(`Template with code "${code}" not found`);
    }

    return template;
  }

  async updateTemplate(tenantId: string, id: string, dto: UpdateTemplateDto) {
    const template = await this.findTemplateById(tenantId, id);

    // Prevent updating system templates
    if (template.isSystem) {
      throw new BadRequestException('System templates cannot be modified');
    }

    return this.prisma.messageTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        subject: dto.subject,
        content: dto.content,
        variables: dto.variables ? (dto.variables as any) : undefined,
        isActive: dto.isActive,
      },
    });
  }

  async deleteTemplate(tenantId: string, id: string) {
    const template = await this.findTemplateById(tenantId, id);

    if (template.isSystem) {
      throw new BadRequestException('System templates cannot be deleted');
    }

    return this.prisma.messageTemplate.delete({
      where: { id },
    });
  }

  // =============================================================================
  // BULK COMMUNICATION
  // =============================================================================

  async createBulkCommunication(tenantId: string, dto: CreateBulkCommunicationDto) {
    const data: any = {
      tenantId,
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    };

    // Calculate recipient count based on audience
    const recipientCount = await this.calculateRecipientCount(tenantId, dto.audience, dto.audienceFilters);
    data.recipientCount = recipientCount;

    return this.prisma.bulkCommunication.create({
      data,
      include: {
        template: true,
        _count: {
          select: { logs: true },
        },
      },
    });
  }

  async findAllBulkCommunications(tenantId: string, query: BulkCommunicationQueryDto) {
    const { search, type, status, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;

    const [communications, total] = await Promise.all([
      this.prisma.bulkCommunication.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { logs: true },
          },
        },
      }),
      this.prisma.bulkCommunication.count({ where }),
    ]);

    return { communications, total, limit, offset };
  }

  async findBulkCommunicationById(tenantId: string, id: string) {
    const communication = await this.prisma.bulkCommunication.findFirst({
      where: { id, tenantId },
      include: {
        template: true,
        _count: {
          select: { logs: true },
        },
      },
    });

    if (!communication) {
      throw new NotFoundException('Bulk communication not found');
    }

    return communication;
  }

  async updateBulkCommunication(tenantId: string, id: string, dto: UpdateBulkCommunicationDto) {
    const communication = await this.findBulkCommunicationById(tenantId, id);

    // Can only update draft or scheduled communications
    if (!['draft', 'scheduled'].includes(communication.status)) {
      throw new BadRequestException('Cannot update communication that has already been sent');
    }

    const data: any = { ...dto };
    if (dto.scheduledAt) data.scheduledAt = new Date(dto.scheduledAt);

    // Recalculate recipient count if audience filters changed
    if (dto.audienceFilters) {
      data.recipientCount = await this.calculateRecipientCount(
        tenantId,
        communication.audience,
        dto.audienceFilters as any
      );
    }

    return this.prisma.bulkCommunication.update({
      where: { id },
      data,
      include: {
        template: true,
        _count: {
          select: { logs: true },
        },
      },
    });
  }

  async deleteBulkCommunication(tenantId: string, id: string) {
    const communication = await this.findBulkCommunicationById(tenantId, id);

    if (!['draft', 'scheduled'].includes(communication.status)) {
      throw new BadRequestException('Cannot delete communication that has already been sent');
    }

    return this.prisma.bulkCommunication.delete({
      where: { id },
    });
  }

  async cancelBulkCommunication(tenantId: string, id: string) {
    const communication = await this.findBulkCommunicationById(tenantId, id);

    if (!['draft', 'scheduled', 'processing'].includes(communication.status)) {
      throw new BadRequestException('Cannot cancel communication that has already completed');
    }

    return this.prisma.bulkCommunication.update({
      where: { id },
      data: { status: CommunicationStatus.CANCELLED },
    });
  }

  // Start sending bulk communication (this would typically be handled by a queue)
  async startBulkCommunication(tenantId: string, id: string) {
    const communication = await this.findBulkCommunicationById(tenantId, id);

    if (communication.status !== 'draft' && communication.status !== 'scheduled') {
      throw new BadRequestException('Communication has already been processed');
    }

    // Update status to processing
    await this.prisma.bulkCommunication.update({
      where: { id },
      data: {
        status: CommunicationStatus.PROCESSING,
        startedAt: new Date(),
      },
    });

    // In a real implementation, this would add to a queue
    // For now, we'll just mark it as completed
    // The actual sending would be done by a background job

    return { message: 'Bulk communication started', id };
  }

  private async calculateRecipientCount(tenantId: string, audience: string, filters?: any): Promise<number> {
    // This is a simplified calculation - in production you'd have more complex logic
    switch (audience) {
      case 'all':
        const [students, staff, parents] = await Promise.all([
          this.prisma.student.count({ where: { tenantId } }),
          this.prisma.staff.count({ where: { tenantId } }),
          this.prisma.parent.count({ where: { tenantId } }),
        ]);
        return students + staff + parents;

      case 'students':
        return this.prisma.student.count({
          where: {
            tenantId,
            ...(filters?.departmentIds?.length && { departmentId: { in: filters.departmentIds } }),
            ...(filters?.courseIds?.length && { courseId: { in: filters.courseIds } }),
            ...(filters?.batchYears?.length && { batchYear: { in: filters.batchYears } }),
          },
        });

      case 'staff':
        return this.prisma.staff.count({
          where: {
            tenantId,
            ...(filters?.departmentIds?.length && { departmentId: { in: filters.departmentIds } }),
          },
        });

      case 'parents':
        return this.prisma.parent.count({ where: { tenantId } });

      case 'custom':
        return filters?.studentIds?.length || 0;

      default:
        return 0;
    }
  }

  // =============================================================================
  // COMMUNICATION LOGS
  // =============================================================================

  async createLog(tenantId: string, dto: CreateCommunicationLogDto) {
    return this.prisma.communicationLog.create({
      data: {
        tenantId,
        bulkCommunicationId: dto.bulkCommunicationId,
        type: dto.type,
        recipientId: dto.recipientId,
        recipientType: dto.recipientType,
        recipientName: dto.recipientName,
        recipientContact: dto.recipientContact,
        subject: dto.subject,
        content: dto.content,
        variables: dto.variables ? (dto.variables as any) : undefined,
      },
    });
  }

  async findAllLogs(tenantId: string, query: CommunicationLogQueryDto) {
    const { bulkCommunicationId, recipientId, type, status, fromDate, toDate, limit = 50, offset = 0 } = query;

    const where: any = { tenantId };

    if (bulkCommunicationId) where.bulkCommunicationId = bulkCommunicationId;
    if (recipientId) where.recipientId = recipientId;
    if (type) where.type = type;
    if (status) where.status = status;

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.communicationLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          bulkCommunication: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.communicationLog.count({ where }),
    ]);

    return { logs, total, limit, offset };
  }

  async updateLogStatus(tenantId: string, id: string, status: MessageStatus, externalId?: string, errorMessage?: string) {
    const data: any = { status };

    if (status === MessageStatus.SENT || status === MessageStatus.DELIVERED) {
      data.sentAt = new Date();
    }
    if (status === MessageStatus.DELIVERED) {
      data.deliveredAt = new Date();
    }
    if (externalId) data.externalId = externalId;
    if (errorMessage) data.errorMessage = errorMessage;

    return this.prisma.communicationLog.update({
      where: { id },
      data,
    });
  }

  // =============================================================================
  // SEND SINGLE MESSAGE
  // =============================================================================

  async sendSingleMessage(tenantId: string, dto: SendSingleMessageDto) {
    let content = dto.content;
    let subject = dto.subject;

    // If using template, get template content
    if (dto.templateCode) {
      const template = await this.findTemplateByCode(tenantId, dto.templateCode);
      content = template.content;
      subject = template.subject || undefined;

      // Replace variables in template
      if (dto.variables) {
        Object.entries(dto.variables).forEach(([key, value]) => {
          content = content!.replace(new RegExp(`{{${key}}}`, 'g'), value);
          if (subject) {
            subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
          }
        });
      }
    }

    if (!content) {
      throw new BadRequestException('Message content is required');
    }

    // Create log entry
    const log = await this.createLog(tenantId, {
      type: dto.type,
      recipientId: dto.recipientId,
      recipientType: dto.recipientType,
      recipientName: dto.recipientName,
      recipientContact: dto.recipientContact,
      subject,
      content,
      variables: dto.variables,
    });

    // In a real implementation, this would call the notification service
    // For now, we'll just mark it as sent
    await this.updateLogStatus(tenantId, log.id, MessageStatus.SENT);

    return { message: 'Message sent', logId: log.id };
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  async getStats(tenantId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalAnnouncements,
      activeAnnouncements,
      totalTemplates,
      totalBulkCommunications,
      recentMessages,
      messagesByType,
    ] = await Promise.all([
      this.prisma.announcement.count({ where: { tenantId } }),
      this.prisma.announcement.count({
        where: {
          tenantId,
          status: AnnouncementStatus.PUBLISHED,
          OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
        },
      }),
      this.prisma.messageTemplate.count({ where: { tenantId, isActive: true } }),
      this.prisma.bulkCommunication.count({ where: { tenantId } }),
      this.prisma.communicationLog.count({
        where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.communicationLog.groupBy({
        by: ['type'],
        where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
        _count: { type: true },
      }),
    ]);

    return {
      totalAnnouncements,
      activeAnnouncements,
      totalTemplates,
      totalBulkCommunications,
      recentMessages,
      messagesByType: messagesByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
