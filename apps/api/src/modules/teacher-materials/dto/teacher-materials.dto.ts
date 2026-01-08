import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============ Query DTOs ============

export class QueryMaterialsDto {
  @IsOptional()
  @IsString()
  subjectCode?: string;

  @IsOptional()
  @IsString()
  folderId?: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class QueryFoldersDto {
  @IsOptional()
  @IsString()
  subjectCode?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

// ============ Create/Update DTOs ============

export class CreateFolderDto {
  @IsString()
  teacherSubjectId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateFolderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateMaterialDto {
  @IsString()
  teacherSubjectId: string;

  @IsOptional()
  @IsString()
  folderId?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  fileUrl: string;

  @IsString()
  fileType: string;

  @IsNumber()
  @Min(0)
  fileSize: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateMaterialDto {
  @IsOptional()
  @IsString()
  folderId?: string | null;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

// ============ Response DTOs ============

export class MaterialStatsDto {
  totalFiles: number;
  totalFolders: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  totalDownloads: number;
  fileTypeBreakdown: Record<string, number>;
}

export class FolderDto {
  id: string;
  name: string;
  description: string | null;
  teacherSubjectId: string;
  subjectCode: string;
  subjectName: string;
  section: string | null;
  fileCount: number;
  totalSize: number;
  lastModified: string;
  createdAt: string;
}

export class MaterialDto {
  id: string;
  name: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  fileSizeFormatted: string;
  mimeType: string | null;
  downloads: number;
  isPublished: boolean;
  folderId: string | null;
  folderName: string | null;
  teacherSubjectId: string;
  subjectCode: string;
  subjectName: string;
  section: string | null;
  createdAt: string;
  updatedAt: string;
}

export class MaterialsResponseDto {
  stats: MaterialStatsDto;
  materials: MaterialDto[];
  total: number;
}

export class FoldersResponseDto {
  folders: FolderDto[];
  total: number;
}
