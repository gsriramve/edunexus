import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SendMessageDto,
  ReplyMessageDto,
  MessageQueryDto,
  RecipientType,
  MessageType,
} from './dto/teacher-messages.dto';

@Injectable()
export class TeacherMessagesService {
  constructor(private prisma: PrismaService) {}

  // =============================================================================
  // GET TEACHER INFO
  // =============================================================================

  private async getTeacherInfo(tenantId: string, userId: string) {
    // First try to find user by database ID
    let user = await this.prisma.user.findFirst({
      where: { tenantId, id: userId },
      include: {
        staff: {
          include: {
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    // If not found, try by Clerk ID (for backwards compatibility)
    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { tenantId, clerkUserId: userId },
        include: {
          staff: {
            include: {
              department: { select: { id: true, name: true, code: true } },
            },
          },
        },
      });
    }

    if (!user?.staff) {
      throw new NotFoundException('Teacher not found');
    }

    return {
      staffId: user.staff.id,
      userId: user.id,
      name: user.name || 'Unknown',
      email: user.email || '',
      departmentId: user.staff.departmentId,
      departmentName: user.staff.department?.name,
    };
  }

  // =============================================================================
  // INBOX (Messages received)
  // =============================================================================

  async getInbox(tenantId: string, userId: string, query: MessageQueryDto) {
    const teacher = await this.getTeacherInfo(tenantId, userId);
    const { search, messageType, unreadOnly, starredOnly, archivedOnly, fromDate, toDate, limit = 50, offset = 0 } = query;

    const where: any = {
      tenantId,
      isDeleted: false,
      OR: [
        // Direct messages to this user
        {
          recipientType: RecipientType.INDIVIDUAL,
          recipientId: userId,
        },
        // Messages via receipts (group messages)
        {
          receipts: {
            some: {
              recipientId: userId,
              isDeleted: false,
            },
          },
        },
      ],
    };

    // Exclude own sent messages from inbox
    where.NOT = { senderId: userId };

    if (search) {
      where.AND = [
        {
          OR: [
            { subject: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
            { senderName: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (messageType) where.messageType = messageType;
    if (unreadOnly) where.isRead = false;
    if (starredOnly) where.isStarred = true;
    if (archivedOnly) {
      where.isArchived = true;
    } else {
      where.isArchived = false;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [messages, total] = await Promise.all([
      this.prisma.directMessage.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { replies: true } },
        },
      }),
      this.prisma.directMessage.count({ where }),
    ]);

    return {
      messages: messages.map((msg) => ({
        id: msg.id,
        from: {
          id: msg.senderId,
          name: msg.senderName,
          type: msg.senderType,
        },
        subject: msg.subject,
        preview: msg.content.substring(0, 150) + (msg.content.length > 150 ? '...' : ''),
        content: msg.content,
        messageType: msg.messageType,
        attachments: msg.attachments,
        isRead: msg.isRead,
        isStarred: msg.isStarred,
        isArchived: msg.isArchived,
        replyCount: msg._count.replies,
        createdAt: msg.createdAt,
      })),
      total,
      limit,
      offset,
    };
  }

  // =============================================================================
  // SENT MESSAGES
  // =============================================================================

  async getSent(tenantId: string, userId: string, query: MessageQueryDto) {
    const { search, messageType, fromDate, toDate, limit = 50, offset = 0 } = query;

    const where: any = {
      tenantId,
      senderId: userId,
      isDeleted: false,
      parentId: null, // Only get root messages, not replies
    };

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (messageType) where.messageType = messageType;

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [messages, total] = await Promise.all([
      this.prisma.directMessage.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { replies: true, receipts: true } },
          receipts: {
            select: { readAt: true },
          },
        },
      }),
      this.prisma.directMessage.count({ where }),
    ]);

    return {
      messages: messages.map((msg) => ({
        id: msg.id,
        to: {
          id: msg.recipientId,
          name: msg.recipientName,
          type: msg.recipientType,
        },
        subject: msg.subject,
        preview: msg.content.substring(0, 150) + (msg.content.length > 150 ? '...' : ''),
        content: msg.content,
        messageType: msg.messageType,
        attachments: msg.attachments,
        totalRecipients: msg.totalRecipients,
        deliveredCount: msg.deliveredCount,
        readCount: msg.receipts.filter((r) => r.readAt !== null).length,
        replyCount: msg._count.replies,
        createdAt: msg.createdAt,
      })),
      total,
      limit,
      offset,
    };
  }

  // =============================================================================
  // GET MESSAGE BY ID
  // =============================================================================

  async getMessageById(tenantId: string, userId: string, messageId: string) {
    const message = await this.prisma.directMessage.findFirst({
      where: {
        id: messageId,
        tenantId,
        isDeleted: false,
      },
      include: {
        replies: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
        },
        receipts: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user has access to this message
    const hasAccess =
      message.senderId === userId ||
      message.recipientId === userId ||
      message.receipts.some((r) => r.recipientId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this message');
    }

    // Mark as read if recipient
    if (message.recipientId === userId && !message.isRead) {
      await this.prisma.directMessage.update({
        where: { id: messageId },
        data: { isRead: true, readAt: new Date() },
      });
    }

    // Mark receipt as read if group message
    const receipt = message.receipts.find((r) => r.recipientId === userId);
    if (receipt && !receipt.readAt) {
      await this.prisma.messageReceipt.update({
        where: { id: receipt.id },
        data: { readAt: new Date() },
      });

      // Update read count on message
      await this.prisma.directMessage.update({
        where: { id: messageId },
        data: { readCount: { increment: 1 } },
      });
    }

    return {
      id: message.id,
      from: {
        id: message.senderId,
        name: message.senderName,
        type: message.senderType,
      },
      to: {
        id: message.recipientId,
        name: message.recipientName,
        type: message.recipientType,
      },
      subject: message.subject,
      content: message.content,
      messageType: message.messageType,
      attachments: message.attachments,
      isRead: message.isRead,
      isStarred: message.isStarred,
      createdAt: message.createdAt,
      replies: message.replies.map((reply) => ({
        id: reply.id,
        from: {
          id: reply.senderId,
          name: reply.senderName,
          type: reply.senderType,
        },
        content: reply.content,
        attachments: reply.attachments,
        createdAt: reply.createdAt,
      })),
    };
  }

  // =============================================================================
  // SEND MESSAGE
  // =============================================================================

  async sendMessage(tenantId: string, userId: string, dto: SendMessageDto) {
    const teacher = await this.getTeacherInfo(tenantId, userId);

    // Determine recipients and create message
    let totalRecipients = 1;
    let recipientName = dto.recipientName;
    let recipientIds: any = null;

    if (dto.recipientType === RecipientType.CLASS) {
      // Get class students based on teacher's subject and section
      const teacherSubject = await this.prisma.teacherSubject.findFirst({
        where: { id: dto.recipientId, tenantId },
        include: {
          subject: {
            select: { name: true, code: true, courseId: true },
          },
        },
      });

      if (teacherSubject) {
        // Get course to find department
        const course = teacherSubject.subject?.courseId
          ? await this.prisma.course.findUnique({
              where: { id: teacherSubject.subject.courseId },
            })
          : null;

        // Get students in this section
        const students = await this.prisma.student.findMany({
          where: {
            tenantId,
            section: teacherSubject.section,
            ...(course?.departmentId && { departmentId: course.departmentId }),
          },
          include: {
            user: { select: { id: true, name: true } },
          },
        });

        totalRecipients = students.length;
        recipientName = `${teacherSubject.subject?.code || 'Class'}${teacherSubject.section ? ` - Section ${teacherSubject.section}` : ''}`;
        recipientIds = students.map((s) => ({
          id: s.userId,
          name: s.user?.name || 'Unknown',
          type: 'student',
        }));
      }
    } else if (dto.recipientType === RecipientType.CUSTOM && dto.recipients) {
      totalRecipients = dto.recipients.length;
      recipientIds = dto.recipients;
      recipientName = `${totalRecipients} recipients`;
    }

    // Create the message
    const message = await this.prisma.directMessage.create({
      data: {
        tenantId,
        senderId: userId,
        senderType: 'teacher',
        senderName: teacher.name,
        recipientType: dto.recipientType,
        recipientId: dto.recipientId,
        recipientName,
        recipientUserType: dto.recipientUserType,
        recipientIds,
        subject: dto.subject,
        content: dto.content,
        messageType: dto.messageType || MessageType.GENERAL,
        parentId: dto.parentId,
        threadId: dto.parentId ? dto.parentId : undefined,
        attachments: dto.attachments ? (dto.attachments as any) : undefined,
        totalRecipients,
        deliveredCount: totalRecipients,
      },
    });

    // Create receipts for group messages
    if (recipientIds && Array.isArray(recipientIds)) {
      await this.prisma.messageReceipt.createMany({
        data: recipientIds.map((r: any) => ({
          tenantId,
          messageId: message.id,
          recipientId: r.id,
          recipientType: r.type,
          recipientName: r.name,
          deliveredAt: new Date(),
        })),
      });
    }

    return {
      message: 'Message sent successfully',
      id: message.id,
      totalRecipients,
    };
  }

  // =============================================================================
  // REPLY TO MESSAGE
  // =============================================================================

  async replyToMessage(tenantId: string, userId: string, dto: ReplyMessageDto) {
    const teacher = await this.getTeacherInfo(tenantId, userId);

    // Get original message
    const originalMessage = await this.prisma.directMessage.findFirst({
      where: { id: dto.messageId, tenantId, isDeleted: false },
    });

    if (!originalMessage) {
      throw new NotFoundException('Original message not found');
    }

    // Determine reply recipient (sender of original message)
    const recipientId = originalMessage.senderId === userId
      ? originalMessage.recipientId
      : originalMessage.senderId;
    const recipientName = originalMessage.senderId === userId
      ? originalMessage.recipientName
      : originalMessage.senderName;
    const recipientType = originalMessage.senderId === userId
      ? originalMessage.recipientType
      : 'individual';

    // Create reply
    const reply = await this.prisma.directMessage.create({
      data: {
        tenantId,
        senderId: userId,
        senderType: 'teacher',
        senderName: teacher.name,
        recipientType,
        recipientId,
        recipientName,
        subject: `Re: ${originalMessage.subject}`,
        content: dto.content,
        messageType: MessageType.REPLY,
        parentId: dto.messageId,
        threadId: originalMessage.threadId || originalMessage.id,
        attachments: dto.attachments ? (dto.attachments as any) : undefined,
        totalRecipients: 1,
        deliveredCount: 1,
      },
    });

    return {
      message: 'Reply sent successfully',
      id: reply.id,
    };
  }

  // =============================================================================
  // MARK AS READ
  // =============================================================================

  async markAsRead(tenantId: string, userId: string, messageIds: string[]) {
    await this.prisma.directMessage.updateMany({
      where: {
        id: { in: messageIds },
        tenantId,
        OR: [
          { recipientId: userId },
          { receipts: { some: { recipientId: userId } } },
        ],
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Also update receipts
    await this.prisma.messageReceipt.updateMany({
      where: {
        messageId: { in: messageIds },
        recipientId: userId,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { message: 'Messages marked as read', count: messageIds.length };
  }

  // =============================================================================
  // TOGGLE STAR
  // =============================================================================

  async toggleStar(tenantId: string, userId: string, messageId: string) {
    const message = await this.prisma.directMessage.findFirst({
      where: { id: messageId, tenantId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await this.prisma.directMessage.update({
      where: { id: messageId },
      data: { isStarred: !message.isStarred },
    });

    return { message: 'Star toggled', isStarred: !message.isStarred };
  }

  // =============================================================================
  // ARCHIVE MESSAGES
  // =============================================================================

  async archiveMessages(tenantId: string, userId: string, messageIds: string[]) {
    await this.prisma.directMessage.updateMany({
      where: {
        id: { in: messageIds },
        tenantId,
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
      },
      data: { isArchived: true },
    });

    return { message: 'Messages archived', count: messageIds.length };
  }

  // =============================================================================
  // DELETE MESSAGES (Soft delete)
  // =============================================================================

  async deleteMessages(tenantId: string, userId: string, messageIds: string[]) {
    await this.prisma.directMessage.updateMany({
      where: {
        id: { in: messageIds },
        tenantId,
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: 'Messages deleted', count: messageIds.length };
  }

  // =============================================================================
  // GET STATS
  // =============================================================================

  async getStats(tenantId: string, userId: string) {
    const [unreadCount, totalInbox, totalSent, starredCount] = await Promise.all([
      this.prisma.directMessage.count({
        where: {
          tenantId,
          isDeleted: false,
          isArchived: false,
          isRead: false,
          NOT: { senderId: userId },
          OR: [
            { recipientId: userId },
            { receipts: { some: { recipientId: userId, readAt: null } } },
          ],
        },
      }),
      this.prisma.directMessage.count({
        where: {
          tenantId,
          isDeleted: false,
          isArchived: false,
          NOT: { senderId: userId },
          OR: [
            { recipientId: userId },
            { receipts: { some: { recipientId: userId } } },
          ],
        },
      }),
      this.prisma.directMessage.count({
        where: {
          tenantId,
          senderId: userId,
          isDeleted: false,
          parentId: null,
        },
      }),
      this.prisma.directMessage.count({
        where: {
          tenantId,
          isStarred: true,
          isDeleted: false,
          OR: [
            { senderId: userId },
            { recipientId: userId },
          ],
        },
      }),
    ]);

    return {
      unreadCount,
      totalInbox,
      totalSent,
      starredCount,
    };
  }

  // =============================================================================
  // GET CLASSES (for compose dropdown)
  // =============================================================================

  async getTeacherClasses(tenantId: string, userId: string) {
    const teacher = await this.getTeacherInfo(tenantId, userId);

    const teacherSubjects = await this.prisma.teacherSubject.findMany({
      where: {
        tenantId,
        staff: { userId },
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            course: { select: { departmentId: true } },
          },
        },
      },
    });

    // Get student counts for each section
    const results = await Promise.all(
      teacherSubjects.map(async (ts) => {
        const departmentId = ts.subject?.course?.departmentId;
        const studentCount = departmentId
          ? await this.prisma.student.count({
              where: {
                tenantId,
                section: ts.section,
                departmentId,
              },
            })
          : 0;

        return {
          id: ts.id,
          name: `${ts.subject?.code || 'Unknown'}${ts.section ? ` - Section ${ts.section}` : ''}`,
          subjectName: ts.subject?.name || null,
          subjectCode: ts.subject?.code || null,
          sectionName: ts.section,
          studentCount,
        };
      })
    );

    return results;
  }

  // =============================================================================
  // SEARCH RECIPIENTS
  // =============================================================================

  async searchRecipients(tenantId: string, userId: string, search: string, type?: string) {
    const results: any[] = [];

    // Search students
    if (!type || type === 'student') {
      const students = await this.prisma.student.findMany({
        where: {
          tenantId,
          OR: [
            { rollNo: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
          ],
        },
        take: 10,
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      results.push(
        ...students.map((s) => ({
          id: s.userId,
          name: s.user?.name || 'Unknown',
          type: 'student',
          subtitle: s.rollNo,
        }))
      );
    }

    // Search parents
    if (!type || type === 'parent') {
      const parents = await this.prisma.parent.findMany({
        where: {
          tenantId,
          user: { name: { contains: search, mode: 'insensitive' } },
        },
        take: 10,
        include: {
          user: { select: { id: true, name: true } },
          student: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      });

      results.push(
        ...parents.map((p) => ({
          id: p.userId,
          name: p.user?.name || 'Unknown',
          type: 'parent',
          subtitle: `Parent of ${p.student?.user?.name || 'Unknown'}`,
        }))
      );
    }

    // Search staff
    if (!type || type === 'staff') {
      const staff = await this.prisma.staff.findMany({
        where: {
          tenantId,
          userId: { not: userId }, // Exclude self
          user: { name: { contains: search, mode: 'insensitive' } },
        },
        take: 10,
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      results.push(
        ...staff.map((s) => ({
          id: s.userId,
          name: s.user?.name || 'Unknown',
          type: 'staff',
          subtitle: s.designation,
        }))
      );
    }

    return results;
  }
}
