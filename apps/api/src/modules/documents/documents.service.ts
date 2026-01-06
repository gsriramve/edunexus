import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from './s3.service';
import {
  CreateFolderDto,
  UpdateFolderDto,
  UploadDocumentDto,
  UpdateDocumentDto,
  DocumentQueryDto,
  CreateShareDto,
  UpdateShareDto,
  CreateAccessLogDto,
  AccessLogQueryDto,
  UpdateDocumentSettingsDto,
  VerifyDocumentDto,
  BulkDeleteDto,
  BulkMoveDto,
  BulkUpdateVisibilityDto,
  DocumentStatus,
} from './dto/documents.dto';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  // ==================== Folder Operations ====================

  async createFolder(tenantId: string, dto: CreateFolderDto) {
    // Generate path
    let folderPath = `/${dto.name.toLowerCase().replace(/\s+/g, '-')}`;
    let depth = 0;

    if (dto.parentId) {
      const parent = await this.prisma.documentFolder.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent folder not found');
      }
      folderPath = `${parent.path}/${dto.name.toLowerCase().replace(/\s+/g, '-')}`;
      depth = parent.depth + 1;
    }

    // Check for duplicate path
    const existing = await this.prisma.documentFolder.findFirst({
      where: { tenantId, path: folderPath },
    });
    if (existing) {
      throw new BadRequestException('A folder with this name already exists at this location');
    }

    return this.prisma.documentFolder.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        parentId: dto.parentId,
        ownerId: dto.ownerId,
        ownerType: dto.ownerType,
        color: dto.color,
        icon: dto.icon,
        visibility: dto.visibility || 'private',
        path: folderPath,
        depth,
      },
    });
  }

  async updateFolder(tenantId: string, id: string, dto: UpdateFolderDto) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id, tenantId },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    // If name is changed, update path
    let newPath = folder.path;
    if (dto.name && dto.name !== folder.name) {
      const pathParts = folder.path.split('/');
      pathParts[pathParts.length - 1] = dto.name.toLowerCase().replace(/\s+/g, '-');
      newPath = pathParts.join('/');

      // Check for duplicate path
      const existing = await this.prisma.documentFolder.findFirst({
        where: { tenantId, path: newPath, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException('A folder with this name already exists at this location');
      }
    }

    return this.prisma.documentFolder.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
        visibility: dto.visibility,
        path: newPath,
      },
    });
  }

  async deleteFolder(tenantId: string, id: string) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id, tenantId },
      include: { documents: true, children: true },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (folder.documents.length > 0 || folder.children.length > 0) {
      throw new BadRequestException('Cannot delete folder with contents. Move or delete items first.');
    }

    return this.prisma.documentFolder.delete({ where: { id } });
  }

  async getFolders(tenantId: string, parentId?: string) {
    return this.prisma.documentFolder.findMany({
      where: {
        tenantId,
        parentId: parentId || null,
      },
      include: {
        _count: {
          select: { documents: true, children: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getFolderById(tenantId: string, id: string) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id, tenantId },
      include: {
        parent: true,
        children: {
          include: {
            _count: { select: { documents: true, children: true } },
          },
        },
        documents: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { documents: true, children: true },
        },
      },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    return folder;
  }

  async getFolderBreadcrumb(tenantId: string, id: string) {
    const breadcrumb: Array<{ id: string; name: string; path: string }> = [];
    let currentFolder = await this.prisma.documentFolder.findFirst({
      where: { id, tenantId },
      include: { parent: true },
    });

    while (currentFolder) {
      breadcrumb.unshift({
        id: currentFolder.id,
        name: currentFolder.name,
        path: currentFolder.path,
      });
      if (currentFolder.parent) {
        currentFolder = await this.prisma.documentFolder.findFirst({
          where: { id: currentFolder.parentId!, tenantId },
          include: { parent: true },
        });
      } else {
        break;
      }
    }

    return breadcrumb;
  }

  // ==================== Document Operations ====================

  async uploadDocument(
    tenantId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ) {
    // Get settings
    const settings = await this.getOrCreateSettings(tenantId);

    // Validate file size
    if (file.size > settings.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed (${Math.round(settings.maxFileSize / 1048576)}MB)`,
      );
    }

    // Validate mime type
    if (!settings.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    // Validate extension
    const extension = path.extname(file.originalname).toLowerCase().slice(1);
    if (settings.blockedExtensions.includes(extension)) {
      throw new BadRequestException('File extension is blocked');
    }

    // Upload to S3
    const uploadResult = await this.s3Service.upload(tenantId, dto.category, file);

    // Create document record
    const document = await this.prisma.document.create({
      data: {
        tenantId,
        folderId: dto.folderId,
        name: dto.name,
        originalName: file.originalname,
        description: dto.description,
        s3Key: uploadResult.key,
        s3Bucket: uploadResult.bucket,
        s3Region: uploadResult.region,
        mimeType: file.mimetype,
        fileSize: file.size,
        extension,
        checksum: uploadResult.checksum,
        category: dto.category,
        subcategory: dto.subcategory,
        tags: dto.tags || [],
        uploadedById: dto.uploadedById,
        uploadedByType: dto.uploadedByType,
        uploadedByName: dto.uploadedByName,
        visibility: dto.visibility || 'private',
        studentId: dto.studentId,
        staffId: dto.staffId,
        departmentId: dto.departmentId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    // Update storage usage
    await this.updateStorageUsage(tenantId, file.size);

    this.logger.log(`Document uploaded: ${document.id} (${document.name})`);

    return document;
  }

  async updateDocument(tenantId: string, id: string, dto: UpdateDocumentDto) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        folderId: dto.folderId,
        category: dto.category,
        subcategory: dto.subcategory,
        tags: dto.tags,
        visibility: dto.visibility,
        status: dto.status,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async verifyDocument(tenantId: string, id: string, dto: VerifyDocumentDto) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        isVerified: dto.isVerified,
        verifiedById: dto.verifiedById,
        verifiedAt: dto.isVerified ? new Date() : null,
      },
    });
  }

  async deleteDocument(tenantId: string, id: string, hardDelete = false) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (hardDelete) {
      // Delete from S3
      await this.s3Service.delete(document.s3Key);

      // Delete from database
      await this.prisma.document.delete({ where: { id } });

      // Update storage usage
      await this.updateStorageUsage(tenantId, -document.fileSize);

      this.logger.log(`Document hard deleted: ${id}`);
    } else {
      // Soft delete - mark as deleted
      await this.prisma.document.update({
        where: { id },
        data: { status: DocumentStatus.DELETED },
      });

      this.logger.log(`Document soft deleted: ${id}`);
    }

    return { success: true };
  }

  async getDocuments(tenantId: string, query: DocumentQueryDto) {
    const where: any = {
      tenantId,
      status: query.status || { not: DocumentStatus.DELETED },
    };

    if (query.folderId) where.folderId = query.folderId;
    if (query.category) where.category = query.category;
    if (query.visibility) where.visibility = query.visibility;
    if (query.uploadedById) where.uploadedById = query.uploadedById;
    if (query.studentId) where.studentId = query.studentId;
    if (query.staffId) where.staffId = query.staffId;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.isVerified !== undefined) where.isVerified = query.isVerified;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { originalName: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.tags && query.tags.length > 0) {
      where.tags = { hasSome: query.tags };
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const orderBy: any = {};
    orderBy[query.sortBy || 'createdAt'] = query.sortOrder || 'desc';

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          folder: { select: { id: true, name: true, path: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getDocumentById(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
      include: {
        folder: true,
        shares: {
          orderBy: { createdAt: 'desc' },
        },
        versions: {
          take: 5,
          orderBy: { version: 'desc' },
        },
      },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async getDownloadUrl(tenantId: string, id: string, userId: string, userName: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Get presigned URL
    const { url, expiresIn } = await this.s3Service.getDownloadUrl(document.s3Key);

    // Log access
    await this.createAccessLog(tenantId, {
      documentId: id,
      userId,
      userName,
      userType: 'user',
      action: 'download',
    });

    // Update download count
    await this.prisma.document.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    return { url, expiresIn, filename: document.originalName };
  }

  async getViewUrl(tenantId: string, id: string, userId: string, userName: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Get presigned URL
    const { url, expiresIn } = await this.s3Service.getDownloadUrl(document.s3Key, 1800);

    // Log access
    await this.createAccessLog(tenantId, {
      documentId: id,
      userId,
      userName,
      userType: 'user',
      action: 'view',
    });

    // Update view count
    await this.prisma.document.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    return { url, expiresIn, filename: document.originalName, mimeType: document.mimeType };
  }

  // ==================== Share Operations ====================

  async createShare(tenantId: string, dto: CreateShareDto) {
    const document = await this.prisma.document.findFirst({
      where: { id: dto.documentId, tenantId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Generate share token if public link
    let shareToken: string | null = null;
    if (dto.isPublicLink) {
      shareToken = crypto.randomBytes(32).toString('hex');
    }

    return this.prisma.documentShare.create({
      data: {
        tenantId,
        documentId: dto.documentId,
        sharedWithUserId: dto.sharedWithUserId,
        sharedWithRole: dto.sharedWithRole,
        sharedWithDeptId: dto.sharedWithDeptId,
        permission: dto.permission,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        password: dto.password,
        maxDownloads: dto.maxDownloads,
        shareToken,
        isPublicLink: dto.isPublicLink || false,
        sharedById: dto.sharedById,
        sharedByName: dto.sharedByName,
      },
    });
  }

  async updateShare(tenantId: string, id: string, dto: UpdateShareDto) {
    const share = await this.prisma.documentShare.findFirst({
      where: { id, tenantId },
    });
    if (!share) {
      throw new NotFoundException('Share not found');
    }

    return this.prisma.documentShare.update({
      where: { id },
      data: {
        permission: dto.permission,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        maxDownloads: dto.maxDownloads,
      },
    });
  }

  async deleteShare(tenantId: string, id: string) {
    const share = await this.prisma.documentShare.findFirst({
      where: { id, tenantId },
    });
    if (!share) {
      throw new NotFoundException('Share not found');
    }

    return this.prisma.documentShare.delete({ where: { id } });
  }

  async getShareByToken(shareToken: string) {
    const share = await this.prisma.documentShare.findUnique({
      where: { shareToken },
      include: { document: true },
    });

    if (!share) {
      throw new NotFoundException('Share link not found');
    }

    // Check expiry
    if (share.expiresAt && new Date() > share.expiresAt) {
      throw new ForbiddenException('Share link has expired');
    }

    // Check download limit
    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      throw new ForbiddenException('Download limit reached');
    }

    return share;
  }

  async accessSharedDocument(shareToken: string, password?: string) {
    const share = await this.getShareByToken(shareToken);

    // Check password
    if (share.password && share.password !== password) {
      throw new ForbiddenException('Invalid password');
    }

    // Get download URL
    const { url } = await this.s3Service.getDownloadUrl(share.document.s3Key);

    // Increment download count
    await this.prisma.documentShare.update({
      where: { id: share.id },
      data: { downloadCount: { increment: 1 } },
    });

    return {
      url,
      document: {
        name: share.document.name,
        originalName: share.document.originalName,
        mimeType: share.document.mimeType,
        fileSize: share.document.fileSize,
      },
    };
  }

  // ==================== Access Log Operations ====================

  async createAccessLog(tenantId: string, dto: CreateAccessLogDto) {
    return this.prisma.documentAccessLog.create({
      data: {
        tenantId,
        documentId: dto.documentId,
        userId: dto.userId,
        userName: dto.userName,
        userType: dto.userType,
        action: dto.action,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        details: dto.details as any,
      },
    });
  }

  async getAccessLogs(tenantId: string, query: AccessLogQueryDto) {
    const where: any = { tenantId };

    if (query.documentId) where.documentId = query.documentId;
    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = query.action;

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.documentAccessLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          document: { select: { id: true, name: true } },
        },
      }),
      this.prisma.documentAccessLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== Settings Operations ====================

  async getOrCreateSettings(tenantId: string) {
    let settings = await this.prisma.documentSettings.findUnique({
      where: { tenantId },
    });

    if (!settings) {
      settings = await this.prisma.documentSettings.create({
        data: { tenantId },
      });
    }

    // Convert BigInt values to numbers for JSON serialization
    return {
      ...settings,
      totalStorageQuota: Number(settings.totalStorageQuota),
      usedStorage: Number(settings.usedStorage),
      studentQuota: Number(settings.studentQuota),
      staffQuota: Number(settings.staffQuota),
    };
  }

  async updateSettings(tenantId: string, dto: UpdateDocumentSettingsDto) {
    await this.getOrCreateSettings(tenantId);

    const settings = await this.prisma.documentSettings.update({
      where: { tenantId },
      data: {
        totalStorageQuota: dto.totalStorageQuota ? BigInt(dto.totalStorageQuota) : undefined,
        studentQuota: dto.studentQuota ? BigInt(dto.studentQuota) : undefined,
        staffQuota: dto.staffQuota ? BigInt(dto.staffQuota) : undefined,
        maxFileSize: dto.maxFileSize,
        allowedMimeTypes: dto.allowedMimeTypes,
        blockedExtensions: dto.blockedExtensions,
        autoDeleteDays: dto.autoDeleteDays,
        archiveAfterDays: dto.archiveAfterDays,
        versioningEnabled: dto.versioningEnabled,
        maxVersions: dto.maxVersions,
        publicSharingEnabled: dto.publicSharingEnabled,
        externalSharingEnabled: dto.externalSharingEnabled,
      },
    });

    // Convert BigInt values to numbers for JSON serialization
    return {
      ...settings,
      totalStorageQuota: Number(settings.totalStorageQuota),
      usedStorage: Number(settings.usedStorage),
      studentQuota: Number(settings.studentQuota),
      staffQuota: Number(settings.staffQuota),
    };
  }

  private async updateStorageUsage(tenantId: string, sizeChange: number) {
    const rawSettings = await this.prisma.documentSettings.findUnique({
      where: { tenantId },
    });
    if (!rawSettings) return;

    const newUsage = BigInt(Number(rawSettings.usedStorage) + sizeChange);

    await this.prisma.documentSettings.update({
      where: { tenantId },
      data: { usedStorage: newUsage > 0n ? newUsage : 0n },
    });
  }

  // ==================== Bulk Operations ====================

  async bulkDelete(tenantId: string, dto: BulkDeleteDto, hardDelete = false) {
    const results = await Promise.allSettled(
      dto.documentIds.map((id) => this.deleteDocument(tenantId, id, hardDelete)),
    );

    const success = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { success, failed, total: dto.documentIds.length };
  }

  async bulkMove(tenantId: string, dto: BulkMoveDto) {
    // Verify target folder exists
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id: dto.targetFolderId, tenantId },
    });
    if (!folder) {
      throw new NotFoundException('Target folder not found');
    }

    await this.prisma.document.updateMany({
      where: {
        id: { in: dto.documentIds },
        tenantId,
      },
      data: { folderId: dto.targetFolderId },
    });

    return { success: true, count: dto.documentIds.length };
  }

  async bulkUpdateVisibility(tenantId: string, dto: BulkUpdateVisibilityDto) {
    await this.prisma.document.updateMany({
      where: {
        id: { in: dto.documentIds },
        tenantId,
      },
      data: { visibility: dto.visibility },
    });

    return { success: true, count: dto.documentIds.length };
  }

  // ==================== Statistics ====================

  async getStats(tenantId: string) {
    const settings = await this.getOrCreateSettings(tenantId);

    const [
      totalDocuments,
      documentsByCategory,
      documentsByStatus,
      recentUploads,
      topUploaders,
    ] = await Promise.all([
      this.prisma.document.count({ where: { tenantId, status: { not: 'deleted' } } }),
      this.prisma.document.groupBy({
        by: ['category'],
        where: { tenantId, status: { not: 'deleted' } },
        _count: { _all: true },
      }),
      this.prisma.document.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { _all: true },
      }),
      this.prisma.document.findMany({
        where: { tenantId, status: { not: 'deleted' } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          category: true,
          fileSize: true,
          uploadedByName: true,
          createdAt: true,
        },
      }),
      this.prisma.document.groupBy({
        by: ['uploadedById', 'uploadedByName'],
        where: { tenantId, status: { not: 'deleted' } },
        _count: { _all: true },
        orderBy: { _count: { uploadedById: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalDocuments,
      storage: {
        used: Number(settings.usedStorage),
        quota: Number(settings.totalStorageQuota),
        percentage: Math.round((Number(settings.usedStorage) / Number(settings.totalStorageQuota)) * 100),
      },
      byCategory: documentsByCategory.map((c) => ({
        category: c.category,
        count: c._count._all,
      })),
      byStatus: documentsByStatus.map((s) => ({
        status: s.status,
        count: s._count._all,
      })),
      recentUploads,
      topUploaders: topUploaders.map((u) => ({
        userId: u.uploadedById,
        name: u.uploadedByName,
        count: u._count._all,
      })),
    };
  }

  async getUserDocuments(tenantId: string, userId: string, userType: string) {
    const where: any = {
      tenantId,
      status: { not: 'deleted' },
    };

    if (userType === 'student') {
      where.OR = [
        { uploadedById: userId },
        { studentId: userId },
        { visibility: { in: ['college', 'public'] } },
      ];
    } else if (userType === 'staff') {
      where.OR = [
        { uploadedById: userId },
        { staffId: userId },
        { visibility: { in: ['department', 'college', 'public'] } },
      ];
    } else {
      where.uploadedById = userId;
    }

    return this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        folder: { select: { id: true, name: true, path: true } },
      },
    });
  }
}
