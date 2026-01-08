import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QueryMaterialsDto,
  QueryFoldersDto,
  CreateFolderDto,
  UpdateFolderDto,
  CreateMaterialDto,
  UpdateMaterialDto,
  MaterialStatsDto,
  FolderDto,
  MaterialDto,
  MaterialsResponseDto,
  FoldersResponseDto,
} from './dto/teacher-materials.dto';

@Injectable()
export class TeacherMaterialsService {
  constructor(private prisma: PrismaService) {}

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  private async getTeacherSubjectIds(
    tenantId: string,
    staffId: string,
  ): Promise<string[]> {
    const subjects = await this.prisma.teacherSubject.findMany({
      where: { tenantId, staffId },
      select: { id: true },
    });
    return subjects.map((s) => s.id);
  }

  private async verifyTeacherSubjectAccess(
    tenantId: string,
    staffId: string,
    teacherSubjectId: string,
  ): Promise<void> {
    const subject = await this.prisma.teacherSubject.findFirst({
      where: {
        id: teacherSubjectId,
        tenantId,
        staffId,
      },
    });
    if (!subject) {
      throw new ForbiddenException('You do not have access to this subject');
    }
  }

  async getStats(tenantId: string, staffId: string): Promise<MaterialStatsDto> {
    const teacherSubjectIds = await this.getTeacherSubjectIds(tenantId, staffId);

    const [materials, folders] = await Promise.all([
      this.prisma.material.findMany({
        where: {
          tenantId,
          teacherSubjectId: { in: teacherSubjectIds },
        },
        select: {
          fileSize: true,
          fileType: true,
          downloads: true,
        },
      }),
      this.prisma.materialFolder.count({
        where: {
          tenantId,
          teacherSubjectId: { in: teacherSubjectIds },
        },
      }),
    ]);

    const totalSizeBytes = materials.reduce((sum, m) => sum + m.fileSize, 0);
    const totalDownloads = materials.reduce((sum, m) => sum + m.downloads, 0);

    const fileTypeBreakdown: Record<string, number> = {};
    materials.forEach((m) => {
      fileTypeBreakdown[m.fileType] = (fileTypeBreakdown[m.fileType] || 0) + 1;
    });

    return {
      totalFiles: materials.length,
      totalFolders: folders,
      totalSizeBytes,
      totalSizeFormatted: this.formatFileSize(totalSizeBytes),
      totalDownloads,
      fileTypeBreakdown,
    };
  }

  async getFolders(
    tenantId: string,
    staffId: string,
    query: QueryFoldersDto,
  ): Promise<FoldersResponseDto> {
    const teacherSubjectIds = await this.getTeacherSubjectIds(tenantId, staffId);

    const where: any = {
      tenantId,
      teacherSubjectId: { in: teacherSubjectIds },
    };

    if (query.subjectCode) {
      const subjects = await this.prisma.teacherSubject.findMany({
        where: {
          tenantId,
          staffId,
          subject: { code: query.subjectCode },
        },
        select: { id: true },
      });
      where.teacherSubjectId = { in: subjects.map((s) => s.id) };
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const folders = await this.prisma.materialFolder.findMany({
      where,
      include: {
        teacherSubject: {
          include: {
            subject: true,
          },
        },
        materials: {
          select: {
            id: true,
            fileSize: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formattedFolders: FolderDto[] = folders.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      teacherSubjectId: f.teacherSubjectId,
      subjectCode: f.teacherSubject.subject.code,
      subjectName: f.teacherSubject.subject.name,
      section: f.teacherSubject.section,
      fileCount: f.materials.length,
      totalSize: f.materials.reduce((sum, m) => sum + m.fileSize, 0),
      lastModified:
        f.materials.length > 0
          ? f.materials.reduce((latest, m) =>
              m.updatedAt > latest ? m.updatedAt : latest,
              f.materials[0].updatedAt,
            ).toISOString()
          : f.updatedAt.toISOString(),
      createdAt: f.createdAt.toISOString(),
    }));

    return {
      folders: formattedFolders,
      total: formattedFolders.length,
    };
  }

  async getMaterials(
    tenantId: string,
    staffId: string,
    query: QueryMaterialsDto,
  ): Promise<MaterialsResponseDto> {
    const teacherSubjectIds = await this.getTeacherSubjectIds(tenantId, staffId);

    const where: any = {
      tenantId,
      teacherSubjectId: { in: teacherSubjectIds },
    };

    if (query.subjectCode) {
      const subjects = await this.prisma.teacherSubject.findMany({
        where: {
          tenantId,
          staffId,
          subject: { code: query.subjectCode },
        },
        select: { id: true },
      });
      where.teacherSubjectId = { in: subjects.map((s) => s.id) };
    }

    if (query.folderId) {
      where.folderId = query.folderId;
    }

    if (query.fileType) {
      where.fileType = query.fileType;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [materials, total, stats] = await Promise.all([
      this.prisma.material.findMany({
        where,
        include: {
          folder: true,
          teacherSubject: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.material.count({ where }),
      this.getStats(tenantId, staffId),
    ]);

    const formattedMaterials: MaterialDto[] = materials.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      fileUrl: m.fileUrl,
      fileType: m.fileType,
      fileSize: m.fileSize,
      fileSizeFormatted: this.formatFileSize(m.fileSize),
      mimeType: m.mimeType,
      downloads: m.downloads,
      isPublished: m.isPublished,
      folderId: m.folderId,
      folderName: m.folder?.name || null,
      teacherSubjectId: m.teacherSubjectId,
      subjectCode: m.teacherSubject.subject.code,
      subjectName: m.teacherSubject.subject.name,
      section: m.teacherSubject.section,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));

    return {
      stats,
      materials: formattedMaterials,
      total,
    };
  }

  async getMaterial(
    tenantId: string,
    staffId: string,
    materialId: string,
  ): Promise<MaterialDto> {
    const material = await this.prisma.material.findFirst({
      where: { id: materialId, tenantId },
      include: {
        folder: true,
        teacherSubject: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    // Verify access
    await this.verifyTeacherSubjectAccess(
      tenantId,
      staffId,
      material.teacherSubjectId,
    );

    return {
      id: material.id,
      name: material.name,
      description: material.description,
      fileUrl: material.fileUrl,
      fileType: material.fileType,
      fileSize: material.fileSize,
      fileSizeFormatted: this.formatFileSize(material.fileSize),
      mimeType: material.mimeType,
      downloads: material.downloads,
      isPublished: material.isPublished,
      folderId: material.folderId,
      folderName: material.folder?.name || null,
      teacherSubjectId: material.teacherSubjectId,
      subjectCode: material.teacherSubject.subject.code,
      subjectName: material.teacherSubject.subject.name,
      section: material.teacherSubject.section,
      createdAt: material.createdAt.toISOString(),
      updatedAt: material.updatedAt.toISOString(),
    };
  }

  async createFolder(
    tenantId: string,
    staffId: string,
    data: CreateFolderDto,
  ): Promise<FolderDto> {
    await this.verifyTeacherSubjectAccess(tenantId, staffId, data.teacherSubjectId);

    const folder = await this.prisma.materialFolder.create({
      data: {
        tenantId,
        teacherSubjectId: data.teacherSubjectId,
        name: data.name,
        description: data.description,
      },
      include: {
        teacherSubject: {
          include: {
            subject: true,
          },
        },
      },
    });

    return {
      id: folder.id,
      name: folder.name,
      description: folder.description,
      teacherSubjectId: folder.teacherSubjectId,
      subjectCode: folder.teacherSubject.subject.code,
      subjectName: folder.teacherSubject.subject.name,
      section: folder.teacherSubject.section,
      fileCount: 0,
      totalSize: 0,
      lastModified: folder.updatedAt.toISOString(),
      createdAt: folder.createdAt.toISOString(),
    };
  }

  async updateFolder(
    tenantId: string,
    staffId: string,
    folderId: string,
    data: UpdateFolderDto,
  ): Promise<FolderDto> {
    const folder = await this.prisma.materialFolder.findFirst({
      where: { id: folderId, tenantId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.verifyTeacherSubjectAccess(tenantId, staffId, folder.teacherSubjectId);

    const updated = await this.prisma.materialFolder.update({
      where: { id: folderId },
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        teacherSubject: {
          include: {
            subject: true,
          },
        },
        materials: {
          select: {
            id: true,
            fileSize: true,
            updatedAt: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      teacherSubjectId: updated.teacherSubjectId,
      subjectCode: updated.teacherSubject.subject.code,
      subjectName: updated.teacherSubject.subject.name,
      section: updated.teacherSubject.section,
      fileCount: updated.materials.length,
      totalSize: updated.materials.reduce((sum, m) => sum + m.fileSize, 0),
      lastModified:
        updated.materials.length > 0
          ? updated.materials.reduce((latest, m) =>
              m.updatedAt > latest ? m.updatedAt : latest,
              updated.materials[0].updatedAt,
            ).toISOString()
          : updated.updatedAt.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async deleteFolder(
    tenantId: string,
    staffId: string,
    folderId: string,
  ): Promise<void> {
    const folder = await this.prisma.materialFolder.findFirst({
      where: { id: folderId, tenantId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.verifyTeacherSubjectAccess(tenantId, staffId, folder.teacherSubjectId);

    // Move materials to root (set folderId to null) before deleting folder
    await this.prisma.material.updateMany({
      where: { folderId },
      data: { folderId: null },
    });

    await this.prisma.materialFolder.delete({
      where: { id: folderId },
    });
  }

  async createMaterial(
    tenantId: string,
    staffId: string,
    data: CreateMaterialDto,
  ): Promise<MaterialDto> {
    await this.verifyTeacherSubjectAccess(tenantId, staffId, data.teacherSubjectId);

    // Verify folder belongs to same teacher subject if provided
    if (data.folderId) {
      const folder = await this.prisma.materialFolder.findFirst({
        where: {
          id: data.folderId,
          teacherSubjectId: data.teacherSubjectId,
        },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found or does not belong to this subject');
      }
    }

    const material = await this.prisma.material.create({
      data: {
        tenantId,
        teacherSubjectId: data.teacherSubjectId,
        folderId: data.folderId,
        name: data.name,
        description: data.description,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        isPublished: data.isPublished ?? true,
      },
      include: {
        folder: true,
        teacherSubject: {
          include: {
            subject: true,
          },
        },
      },
    });

    return {
      id: material.id,
      name: material.name,
      description: material.description,
      fileUrl: material.fileUrl,
      fileType: material.fileType,
      fileSize: material.fileSize,
      fileSizeFormatted: this.formatFileSize(material.fileSize),
      mimeType: material.mimeType,
      downloads: material.downloads,
      isPublished: material.isPublished,
      folderId: material.folderId,
      folderName: material.folder?.name || null,
      teacherSubjectId: material.teacherSubjectId,
      subjectCode: material.teacherSubject.subject.code,
      subjectName: material.teacherSubject.subject.name,
      section: material.teacherSubject.section,
      createdAt: material.createdAt.toISOString(),
      updatedAt: material.updatedAt.toISOString(),
    };
  }

  async updateMaterial(
    tenantId: string,
    staffId: string,
    materialId: string,
    data: UpdateMaterialDto,
  ): Promise<MaterialDto> {
    const material = await this.prisma.material.findFirst({
      where: { id: materialId, tenantId },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    await this.verifyTeacherSubjectAccess(tenantId, staffId, material.teacherSubjectId);

    // Verify new folder if changing
    if (data.folderId !== undefined && data.folderId !== null) {
      const folder = await this.prisma.materialFolder.findFirst({
        where: {
          id: data.folderId,
          teacherSubjectId: material.teacherSubjectId,
        },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found or does not belong to this subject');
      }
    }

    const updated = await this.prisma.material.update({
      where: { id: materialId },
      data: {
        folderId: data.folderId,
        name: data.name,
        description: data.description,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        isPublished: data.isPublished,
      },
      include: {
        folder: true,
        teacherSubject: {
          include: {
            subject: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      fileUrl: updated.fileUrl,
      fileType: updated.fileType,
      fileSize: updated.fileSize,
      fileSizeFormatted: this.formatFileSize(updated.fileSize),
      mimeType: updated.mimeType,
      downloads: updated.downloads,
      isPublished: updated.isPublished,
      folderId: updated.folderId,
      folderName: updated.folder?.name || null,
      teacherSubjectId: updated.teacherSubjectId,
      subjectCode: updated.teacherSubject.subject.code,
      subjectName: updated.teacherSubject.subject.name,
      section: updated.teacherSubject.section,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async deleteMaterial(
    tenantId: string,
    staffId: string,
    materialId: string,
  ): Promise<void> {
    const material = await this.prisma.material.findFirst({
      where: { id: materialId, tenantId },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    await this.verifyTeacherSubjectAccess(tenantId, staffId, material.teacherSubjectId);

    await this.prisma.material.delete({
      where: { id: materialId },
    });
  }

  async incrementDownload(
    tenantId: string,
    materialId: string,
  ): Promise<void> {
    const material = await this.prisma.material.findFirst({
      where: { id: materialId, tenantId, isPublished: true },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    await this.prisma.material.update({
      where: { id: materialId },
      data: { downloads: { increment: 1 } },
    });
  }

  async getTeacherSubjects(
    tenantId: string,
    staffId: string,
  ): Promise<
    {
      id: string;
      subjectId: string;
      subjectCode: string;
      subjectName: string;
      section: string | null;
      semester: number;
    }[]
  > {
    const subjects = await this.prisma.teacherSubject.findMany({
      where: { tenantId, staffId },
      include: {
        subject: true,
      },
      orderBy: { subject: { name: 'asc' } },
    });

    return subjects.map((ts) => ({
      id: ts.id,
      subjectId: ts.subjectId,
      subjectCode: ts.subject.code,
      subjectName: ts.subject.name,
      section: ts.section,
      semester: ts.subject.semester,
    }));
  }
}
