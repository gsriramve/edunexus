"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthContext, getApiBaseUrl } from "@/lib/api";


// Types
export interface RecordsStats {
  totalStudents: number;
  activeStudents: number;
  graduatedStudents: number;
  droppedOut: number;
  pendingCertificates: number;
  pendingTCs: number;
  profilesIncomplete: number;
}

export interface StudentRecord {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string | null;
  photo: string;
  branch: string;
  branchName: string;
  semester: number;
  section: string;
  batch: string;
  status: string;
  cgpa: number;
  attendance: number;
  feeStatus: string;
  profileComplete: number;
}

export interface StudentDetails {
  id: string;
  rollNo: string;
  semester: number;
  section: string | null;
  batch: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  department: {
    id: string;
    name: string;
    code: string;
  };
  parent?: Array<{
    user: {
      name: string;
      phone: string | null;
    };
  }>;
}

export interface CertificateType {
  id: string;
  code: string;
  name: string;
  fee: number;
}

export interface CertificateRequest {
  id: string;
  studentId: string;
  rollNo: string;
  name: string;
  type: string;
  typeCode: string;
  purpose: string;
  requestDate: string;
  status: string;
  certificateNumber: string | null;
}

export interface StudentQueryParams {
  search?: string;
  branch?: string;
  semester?: number;
  status?: string;
  batch?: string;
  page?: number;
  limit?: number;
}

export interface CertificateRequestParams {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper function for API calls
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const authContext = getAuthContext();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authContext?.tenantId) {
    headers['x-tenant-id'] = authContext.tenantId;
  }
  if (authContext?.userId) {
    headers['x-user-id'] = authContext.userId;
  }
  if (authContext?.role) {
    headers['x-user-role'] = authContext.role;
  }

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Hooks
export function useRecordsStats() {
  return useQuery<RecordsStats>({
    queryKey: ["admin-records", "stats"],
    queryFn: () => fetchApi<RecordsStats>("/admin-records/stats"),
  });
}

export function useStudentRecords(params: StudentQueryParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.branch && params.branch !== "all") queryParams.append("branch", params.branch);
  if (params.semester) queryParams.append("semester", params.semester.toString());
  if (params.status && params.status !== "all") queryParams.append("status", params.status);
  if (params.batch && params.batch !== "all") queryParams.append("batch", params.batch);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  return useQuery<PaginatedResponse<StudentRecord>>({
    queryKey: ["admin-records", "students", params],
    queryFn: () => fetchApi<PaginatedResponse<StudentRecord>>(
      `/admin-records/students${queryString ? `?${queryString}` : ''}`
    ),
  });
}

export function useStudentDetails(studentId: string | null) {
  return useQuery<StudentDetails>({
    queryKey: ["admin-records", "student", studentId],
    queryFn: () => fetchApi<StudentDetails>(`/admin-records/students/${studentId}`),
    enabled: !!studentId,
  });
}

export function useCertificateTypes() {
  return useQuery<CertificateType[]>({
    queryKey: ["admin-records", "certificate-types"],
    queryFn: () => fetchApi<CertificateType[]>("/admin-records/certificate-types"),
  });
}

export function useCertificateRequests(params: CertificateRequestParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.status && params.status !== "all") queryParams.append("status", params.status);
  if (params.type && params.type !== "all") queryParams.append("type", params.type);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  return useQuery<PaginatedResponse<CertificateRequest>>({
    queryKey: ["admin-records", "certificate-requests", params],
    queryFn: () => fetchApi<PaginatedResponse<CertificateRequest>>(
      `/admin-records/certificate-requests${queryString ? `?${queryString}` : ''}`
    ),
  });
}

export function useCreateCertificateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { studentId: string; certificateTypeId: string; purpose: string }) =>
      fetchApi("/admin-records/certificate-requests", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-records", "certificate-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-records", "stats"] });
    },
  });
}

export function useUpdateCertificateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, status, remarks }: { requestId: string; status: string; remarks?: string }) =>
      fetchApi(`/admin-records/certificate-requests/${requestId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, remarks }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-records", "certificate-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-records", "stats"] });
    },
  });
}
