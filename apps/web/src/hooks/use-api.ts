'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  tenantsApi,
  departmentsApi,
  staffApi,
  studentsApi,
  paymentsApi,
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
