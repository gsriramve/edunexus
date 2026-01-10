'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export interface MaterialStats {
  totalFiles: number;
  totalFolders: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  totalDownloads: number;
  fileTypeBreakdown: Record<string, number>;
}

export interface MaterialFolder {
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

export interface Material {
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

export interface MaterialsResponse {
  stats: MaterialStats;
  materials: Material[];
  total: number;
}

export interface FoldersResponse {
  folders: MaterialFolder[];
  total: number;
}

export interface TeacherSubject {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  section: string | null;
  semester: number;
}

export interface QueryMaterialsParams {
  subjectCode?: string;
  folderId?: string;
  fileType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface QueryFoldersParams {
  subjectCode?: string;
  search?: string;
}

export interface CreateFolderInput {
  teacherSubjectId: string;
  name: string;
  description?: string;
}

export interface UpdateFolderInput {
  name?: string;
  description?: string;
}

export interface CreateMaterialInput {
  teacherSubjectId: string;
  folderId?: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType?: string;
  isPublished?: boolean;
}

export interface UpdateMaterialInput {
  folderId?: string | null;
  name?: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  mimeType?: string;
  isPublished?: boolean;
}

// ============ API Client ============

async function teacherMaterialsApi<T>(
  endpoint: string,
  tenantId: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { method = 'GET', body } = options;
  const authContext = getAuthContext();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
  };

  if (authContext) {
    if (authContext.userId) headers['x-user-id'] = authContext.userId;
    if (authContext.role) headers['x-user-role'] = authContext.role;
    if (authContext.tenantId) headers['x-user-tenant-id'] = authContext.tenantId;
  }

  const response = await fetch(`${getApiBaseUrl()}/teacher-materials${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

// ============ Query Keys ============

export const teacherMaterialsKeys = {
  all: ['teacher-materials'] as const,
  stats: (tenantId: string) =>
    [...teacherMaterialsKeys.all, 'stats', tenantId] as const,
  materials: (tenantId: string, params?: QueryMaterialsParams) =>
    [...teacherMaterialsKeys.all, 'materials', tenantId, params] as const,
  material: (tenantId: string, materialId: string) =>
    [...teacherMaterialsKeys.all, 'material', tenantId, materialId] as const,
  folders: (tenantId: string, params?: QueryFoldersParams) =>
    [...teacherMaterialsKeys.all, 'folders', tenantId, params] as const,
  subjects: (tenantId: string) =>
    [...teacherMaterialsKeys.all, 'subjects', tenantId] as const,
};

// ============ Query Hooks ============

/**
 * Get material stats for the current teacher
 */
export function useMaterialStats(tenantId: string) {
  return useQuery({
    queryKey: teacherMaterialsKeys.stats(tenantId),
    queryFn: () => teacherMaterialsApi<MaterialStats>('/stats', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get all materials with stats
 */
export function useTeacherMaterials(
  tenantId: string,
  params?: QueryMaterialsParams
) {
  const queryParams = new URLSearchParams();
  if (params?.subjectCode) queryParams.set('subjectCode', params.subjectCode);
  if (params?.folderId) queryParams.set('folderId', params.folderId);
  if (params?.fileType) queryParams.set('fileType', params.fileType);
  if (params?.search) queryParams.set('search', params.search);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: teacherMaterialsKeys.materials(tenantId, params),
    queryFn: () =>
      teacherMaterialsApi<MaterialsResponse>(
        query ? `?${query}` : '',
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get a single material
 */
export function useMaterialDetail(tenantId: string, materialId: string) {
  return useQuery({
    queryKey: teacherMaterialsKeys.material(tenantId, materialId),
    queryFn: () => teacherMaterialsApi<Material>(`/${materialId}`, tenantId),
    enabled: !!tenantId && !!materialId,
  });
}

/**
 * Get all folders
 */
export function useTeacherFolders(
  tenantId: string,
  params?: QueryFoldersParams
) {
  const queryParams = new URLSearchParams();
  if (params?.subjectCode) queryParams.set('subjectCode', params.subjectCode);
  if (params?.search) queryParams.set('search', params.search);
  const query = queryParams.toString();

  return useQuery({
    queryKey: teacherMaterialsKeys.folders(tenantId, params),
    queryFn: () =>
      teacherMaterialsApi<FoldersResponse>(
        `/folders${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get teacher's subjects for material creation dropdown
 */
export function useTeacherSubjectsForMaterials(tenantId: string) {
  return useQuery({
    queryKey: teacherMaterialsKeys.subjects(tenantId),
    queryFn: () => teacherMaterialsApi<TeacherSubject[]>('/subjects', tenantId),
    enabled: !!tenantId,
  });
}

// ============ Mutation Hooks ============

/**
 * Create a new folder
 */
export function useCreateFolder(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFolderInput) =>
      teacherMaterialsApi<MaterialFolder>('/folders', tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherMaterialsKeys.all });
    },
  });
}

/**
 * Update a folder
 */
export function useUpdateFolder(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderInput }) =>
      teacherMaterialsApi<MaterialFolder>(`/folders/${id}`, tenantId, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherMaterialsKeys.all });
    },
  });
}

/**
 * Delete a folder
 */
export function useDeleteFolder(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      teacherMaterialsApi<void>(`/folders/${id}`, tenantId, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherMaterialsKeys.all });
    },
  });
}

/**
 * Create a new material
 */
export function useCreateMaterial(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMaterialInput) =>
      teacherMaterialsApi<Material>('', tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherMaterialsKeys.all });
    },
  });
}

/**
 * Update a material
 */
export function useUpdateMaterial(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialInput }) =>
      teacherMaterialsApi<Material>(`/${id}`, tenantId, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherMaterialsKeys.all });
    },
  });
}

/**
 * Delete a material
 */
export function useDeleteMaterial(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      teacherMaterialsApi<void>(`/${id}`, tenantId, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherMaterialsKeys.all });
    },
  });
}

/**
 * Track material download
 */
export function useTrackDownload(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (materialId: string) =>
      teacherMaterialsApi<{ success: boolean }>(`/${materialId}/download`, tenantId, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherMaterialsKeys.all });
    },
  });
}
