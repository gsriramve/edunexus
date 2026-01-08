'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  tenantsApi,
  departmentsApi,
  staffApi,
  studentsApi,
  paymentsApi,
  platformApi,
  idCardsApi,
  type Tenant,
  type Department,
  type Staff,
  type Student,
  type CreateTenantInput,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
  type CreateStaffInput,
  type UpdateStaffInput,
  type CreateStudentInput,
  type UpdateStudentInput,
  type StaffListParams,
  type StudentListParams,
  type CreatePaymentOrderInput,
  type VerifyPaymentInput,
  type PlatformTenant,
  type PlatformStats,
  type PlatformAuditLog,
  type CreatePlatformTenantInput,
  type InvitePrincipalInput,
  type ExtendTrialInput,
  type TenantStatusInput,
  type TenantQueryParams,
  type PlatformAuditLogQueryParams,
  type IdCard,
  type IdCardStats,
  type IdCardQueryParams,
  type GenerateIdCardInput,
  type BulkGenerateIdCardsInput,
} from '@/lib/api';

// ============ Tenants Hooks ============

export function useTenants(params?: { status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['tenants', params],
    queryFn: () => tenantsApi.list(params),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantsApi.get(id),
    enabled: !!id,
  });
}

export function useTenantStats() {
  return useQuery({
    queryKey: ['tenants', 'stats'],
    queryFn: () => tenantsApi.stats(),
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTenantInput) => tenantsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
}

export function useTenantByDomain(domain: string | null) {
  return useQuery({
    queryKey: ['tenant', 'domain', domain],
    queryFn: () => tenantsApi.getByDomain(domain!),
    enabled: !!domain,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useUpdateTenantSettings(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: {
      displayName?: string;
      logo?: string;
      theme?: {
        primaryColor?: string;
        secondaryColor?: string;
      };
      config?: Record<string, any>;
    }) => tenantsApi.updateSettings(tenantId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant', 'domain'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
}

// ============ Departments Hooks ============

export function useDepartments(
  tenantId: string,
  params?: { search?: string; limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: ['departments', tenantId, params],
    queryFn: () => departmentsApi.list(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useDepartment(tenantId: string, id: string) {
  return useQuery({
    queryKey: ['department', tenantId, id],
    queryFn: () => departmentsApi.get(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useDepartmentStats(tenantId: string) {
  return useQuery({
    queryKey: ['departments', 'stats', tenantId],
    queryFn: () => departmentsApi.stats(tenantId),
    enabled: !!tenantId,
  });
}

export function useCreateDepartment(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentInput) => departmentsApi.create(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['departments', 'stats', tenantId] });
    },
  });
}

export function useUpdateDepartment(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentInput }) =>
      departmentsApi.update(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['departments', 'stats', tenantId] });
    },
  });
}

export function useDeleteDepartment(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsApi.delete(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['departments', 'stats', tenantId] });
    },
  });
}

// ============ Staff Hooks ============

export function useStaff(tenantId: string, params?: StaffListParams) {
  return useQuery({
    queryKey: ['staff', tenantId, params],
    queryFn: () => staffApi.list(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useStaffMember(tenantId: string, id: string) {
  return useQuery({
    queryKey: ['staff', tenantId, id],
    queryFn: () => staffApi.get(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useStaffStats(tenantId: string) {
  return useQuery({
    queryKey: ['staff', 'stats', tenantId],
    queryFn: () => staffApi.stats(tenantId),
    enabled: !!tenantId,
  });
}

export function useTeachers(tenantId: string, departmentId?: string) {
  return useQuery({
    queryKey: ['staff', 'teachers', tenantId, departmentId],
    queryFn: () => staffApi.teachers(tenantId, departmentId),
    enabled: !!tenantId,
  });
}

export function useCreateStaff(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffInput) => staffApi.create(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'stats', tenantId] });
    },
  });
}

export function useUpdateStaff(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffInput }) =>
      staffApi.update(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'stats', tenantId] });
    },
  });
}

export function useDeleteStaff(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffApi.delete(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'stats', tenantId] });
    },
  });
}

// ============ Students Hooks ============

export function useStudents(tenantId: string, params?: StudentListParams) {
  return useQuery({
    queryKey: ['students', tenantId, params],
    queryFn: () => studentsApi.list(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useStudent(tenantId: string, id: string) {
  return useQuery({
    queryKey: ['student', tenantId, id],
    queryFn: () => studentsApi.get(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useStudentByUserId(tenantId: string, userId: string) {
  return useQuery({
    queryKey: ['student', 'user', tenantId, userId],
    queryFn: () => studentsApi.getByUserId(tenantId, userId),
    enabled: !!tenantId && !!userId,
  });
}

export function useStudentStats(tenantId: string) {
  return useQuery({
    queryKey: ['students', 'stats', tenantId],
    queryFn: () => studentsApi.stats(tenantId),
    enabled: !!tenantId,
  });
}

export function useStudentDashboard(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: ['student', 'dashboard', tenantId, studentId],
    queryFn: () => studentsApi.dashboard(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

export function useStudentAcademics(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: ['student', 'academics', tenantId, studentId],
    queryFn: () => studentsApi.academics(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

export function useCreateStudent(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentInput) => studentsApi.create(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['students', 'stats', tenantId] });
    },
  });
}

export function useUpdateStudent(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentInput }) =>
      studentsApi.update(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['students', 'stats', tenantId] });
    },
  });
}

export function useDeleteStudent(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentsApi.delete(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['students', 'stats', tenantId] });
    },
  });
}

// ============ Payments Hooks ============

export function useStudentFees(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: ['payments', 'fees', tenantId, studentId],
    queryFn: () => paymentsApi.getStudentFees(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

export function usePaymentHistory(tenantId: string, studentId: string, params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['payments', 'history', tenantId, studentId, params],
    queryFn: () => paymentsApi.getStudentPaymentHistory(tenantId, studentId, params),
    enabled: !!tenantId && !!studentId,
  });
}

export function usePaymentStatus(tenantId: string, orderId: string) {
  return useQuery({
    queryKey: ['payments', 'status', tenantId, orderId],
    queryFn: () => paymentsApi.getPaymentStatus(tenantId, orderId),
    enabled: !!tenantId && !!orderId,
  });
}

export function useCreatePaymentOrder(tenantId: string, studentId: string) {
  return useMutation({
    mutationFn: (data: CreatePaymentOrderInput) => paymentsApi.createOrder(tenantId, studentId, data),
  });
}

export function useVerifyPayment(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VerifyPaymentInput) => paymentsApi.verifyPayment(tenantId, data),
    onSuccess: (_, variables) => {
      // Invalidate fees and payment history queries
      queryClient.invalidateQueries({ queryKey: ['payments', 'fees', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'history', tenantId] });
    },
  });
}

// ============ Exams Hooks ============
// Re-exported from use-exams.ts for convenience
export {
  // Query hooks
  useExams,
  useExam,
  useExamStats,
  useUpcomingExams,
  useExamsBySubject,
  // Mutation hooks
  useCreateExam,
  useUpdateExam,
  useDeleteExam,
  // Exam result query hooks
  useExamResultsByExam,
  useExamResultsByStudent,
  useSemesterResults,
  useStudentCGPA,
  // Exam result mutation hooks
  useCreateExamResult,
  useBulkCreateExamResults,
  useUpdateExamResult,
  // Query keys
  examKeys,
  examResultKeys,
} from './use-exams';

// ============ Platform Hooks (Super Admin) ============

export const platformKeys = {
  all: ['platform'] as const,
  stats: () => [...platformKeys.all, 'stats'] as const,
  tenants: () => [...platformKeys.all, 'tenants'] as const,
  tenantList: (params?: TenantQueryParams) => [...platformKeys.tenants(), params] as const,
  tenant: (id: string) => [...platformKeys.tenants(), id] as const,
  auditLogs: () => [...platformKeys.all, 'audit-logs'] as const,
  auditLogList: (params?: PlatformAuditLogQueryParams) => [...platformKeys.auditLogs(), params] as const,
  tenantAuditLogs: (tenantId: string, params?: PlatformAuditLogQueryParams) =>
    [...platformKeys.auditLogs(), tenantId, params] as const,
};

// Stats
export function usePlatformStats() {
  return useQuery({
    queryKey: platformKeys.stats(),
    queryFn: () => platformApi.getStats(),
  });
}

// Tenant List
export function usePlatformTenants(params?: TenantQueryParams) {
  return useQuery({
    queryKey: platformKeys.tenantList(params),
    queryFn: () => platformApi.listTenants(params),
  });
}

// Single Tenant
export function usePlatformTenant(id: string) {
  return useQuery({
    queryKey: platformKeys.tenant(id),
    queryFn: () => platformApi.getTenant(id),
    enabled: !!id,
  });
}

// Create Tenant
export function useCreatePlatformTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlatformTenantInput) => platformApi.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: platformKeys.stats() });
    },
  });
}

// Extend Trial
export function useExtendTrial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExtendTrialInput }) =>
      platformApi.extendTrial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: platformKeys.stats() });
    },
  });
}

// Activate Tenant
export function useActivateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: TenantStatusInput }) =>
      platformApi.activateTenant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: platformKeys.stats() });
    },
  });
}

// Suspend Tenant
export function useSuspendTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: TenantStatusInput }) =>
      platformApi.suspendTenant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: platformKeys.stats() });
    },
  });
}

// Reactivate Tenant
export function useReactivateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: TenantStatusInput }) =>
      platformApi.reactivateTenant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: platformKeys.stats() });
    },
  });
}

// Invite Principal
export function useInvitePrincipal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: InvitePrincipalInput }) =>
      platformApi.invitePrincipal(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.tenants() });
    },
  });
}

// Resend Invitation
export function useResendInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invitationId, message }: { invitationId: string; message?: string }) =>
      platformApi.resendInvitation(invitationId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.tenants() });
    },
  });
}

// Cancel Invitation
export function useCancelInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => platformApi.cancelInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.tenants() });
    },
  });
}

// Audit Logs
export function usePlatformAuditLogs(params?: PlatformAuditLogQueryParams) {
  return useQuery({
    queryKey: platformKeys.auditLogList(params),
    queryFn: () => platformApi.getAuditLogs(params),
  });
}

// Tenant Audit Logs
export function useTenantAuditLogs(tenantId: string, params?: PlatformAuditLogQueryParams) {
  return useQuery({
    queryKey: platformKeys.tenantAuditLogs(tenantId, params),
    queryFn: () => platformApi.getTenantAuditLogs(tenantId, params),
    enabled: !!tenantId,
  });
}

// ============ ID Cards Hooks ============

export const idCardKeys = {
  all: ['id-cards'] as const,
  lists: () => [...idCardKeys.all, 'list'] as const,
  list: (tenantId: string, params?: IdCardQueryParams) => [...idCardKeys.lists(), tenantId, params] as const,
  details: () => [...idCardKeys.all, 'detail'] as const,
  detail: (tenantId: string, id: string) => [...idCardKeys.details(), tenantId, id] as const,
  byStudent: (tenantId: string, studentId: string) => [...idCardKeys.all, 'student', tenantId, studentId] as const,
  stats: (tenantId: string) => [...idCardKeys.all, 'stats', tenantId] as const,
};

export function useStudentIdCard(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: idCardKeys.byStudent(tenantId, studentId),
    queryFn: () => idCardsApi.getByStudentId(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
    retry: false, // Don't retry if student doesn't have an ID card
  });
}

export function useIdCard(tenantId: string, id: string) {
  return useQuery({
    queryKey: idCardKeys.detail(tenantId, id),
    queryFn: () => idCardsApi.get(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useIdCards(tenantId: string, params?: IdCardQueryParams) {
  return useQuery({
    queryKey: idCardKeys.list(tenantId, params),
    queryFn: () => idCardsApi.list(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useIdCardStats(tenantId: string) {
  return useQuery({
    queryKey: idCardKeys.stats(tenantId),
    queryFn: () => idCardsApi.stats(tenantId),
    enabled: !!tenantId,
  });
}

export function useGenerateIdCard(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data?: GenerateIdCardInput }) =>
      idCardsApi.generate(tenantId, studentId, data),
    onSuccess: (newCard, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: idCardKeys.byStudent(tenantId, studentId) });
      queryClient.invalidateQueries({ queryKey: idCardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: idCardKeys.stats(tenantId) });
    },
  });
}

export function useBulkGenerateIdCards(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkGenerateIdCardsInput) => idCardsApi.bulkGenerate(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: idCardKeys.all });
    },
  });
}

export function useDownloadIdCardPdf(tenantId: string) {
  return useMutation({
    mutationFn: async (id: string) => {
      const blob = await idCardsApi.downloadPdf(tenantId, id);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `id-card-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

export function useRevokeIdCard(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      idCardsApi.revoke(tenantId, id, reason),
    onSuccess: (revokedCard) => {
      queryClient.invalidateQueries({ queryKey: idCardKeys.byStudent(tenantId, revokedCard.studentId) });
      queryClient.invalidateQueries({ queryKey: idCardKeys.detail(tenantId, revokedCard.id) });
      queryClient.invalidateQueries({ queryKey: idCardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: idCardKeys.stats(tenantId) });
    },
  });
}

// ============ Parent Hooks ============
// Parent hooks are in a separate file: use-parents.ts
// Re-export them for convenience
export { useParentChildren, useParentProfile, useParentChild, parentKeys } from './use-parents';

// ============ Student Indices Hooks (SGI/CRI) ============
// Student indices hooks are in a separate file: use-student-indices.ts
export {
  // SGI hooks
  useStudentSgi,
  useSgiStats,
  useSgiAlerts,
  useCalculateSgi,
  useBulkCalculateSgi,
  // CRI hooks
  useStudentCri,
  useCriStats,
  useCriAlerts,
  useCalculateCri,
  useBulkCalculateCri,
  // Config hooks
  useIndexConfig,
  useUpdateIndexConfig,
  // Dashboard hooks
  useStudentIndicesDashboard,
  useDepartmentOverview,
  // Query keys
  studentIndicesKeys,
  // Types
  type SgiData,
  type CriData,
  type SgiStats,
  type CriStats,
  type AlertData,
  type IndexConfig,
  type StudentDashboardData,
} from './use-student-indices';
