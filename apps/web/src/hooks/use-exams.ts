'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  examsApi,
  examResultsApi,
  type Exam,
  type ExamListParams,
  type CreateExamInput,
  type UpdateExamInput,
  type ExamStats,
  type ExamResult,
  type CreateExamResultInput,
  type UpdateExamResultInput,
  type BulkCreateExamResultInput,
  type BulkExamResultResponse,
  type ExamResultsByExam,
  type ExamResultsByStudent,
  type SemesterResult,
} from '@/lib/api';

// Query keys
export const examKeys = {
  all: ['exams'] as const,
  lists: () => [...examKeys.all, 'list'] as const,
  list: (tenantId: string, params?: ExamListParams) => [...examKeys.lists(), tenantId, params] as const,
  details: () => [...examKeys.all, 'detail'] as const,
  detail: (tenantId: string, id: string) => [...examKeys.details(), tenantId, id] as const,
  stats: (tenantId: string) => [...examKeys.all, 'stats', tenantId] as const,
  upcoming: (tenantId: string) => [...examKeys.all, 'upcoming', tenantId] as const,
  bySubject: (tenantId: string, subjectId: string) => [...examKeys.all, 'bySubject', tenantId, subjectId] as const,
};

export const examResultKeys = {
  all: ['exam-results'] as const,
  byExam: (tenantId: string, examId: string) => [...examResultKeys.all, 'byExam', tenantId, examId] as const,
  byStudent: (tenantId: string, studentId: string) => [...examResultKeys.all, 'byStudent', tenantId, studentId] as const,
  semester: (tenantId: string, studentId: string, semester: number) =>
    [...examResultKeys.all, 'semester', tenantId, studentId, semester] as const,
  cgpa: (tenantId: string, studentId: string) => [...examResultKeys.all, 'cgpa', tenantId, studentId] as const,
  predictions: (tenantId: string, studentId: string) => [...examResultKeys.all, 'predictions', tenantId, studentId] as const,
};

// === EXAM QUERIES ===

export function useExams(tenantId: string, params?: ExamListParams) {
  return useQuery({
    queryKey: examKeys.list(tenantId, params),
    queryFn: () => examsApi.list(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useExam(tenantId: string, id: string) {
  return useQuery({
    queryKey: examKeys.detail(tenantId, id),
    queryFn: () => examsApi.get(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useExamStats(tenantId: string) {
  return useQuery({
    queryKey: examKeys.stats(tenantId),
    queryFn: () => examsApi.stats(tenantId),
    enabled: !!tenantId,
  });
}

export function useUpcomingExams(tenantId: string) {
  return useQuery({
    queryKey: examKeys.upcoming(tenantId),
    queryFn: () => examsApi.upcoming(tenantId),
    enabled: !!tenantId,
  });
}

export function useExamsBySubject(tenantId: string, subjectId: string) {
  return useQuery({
    queryKey: examKeys.bySubject(tenantId, subjectId),
    queryFn: () => examsApi.bySubject(tenantId, subjectId),
    enabled: !!tenantId && !!subjectId,
  });
}

// === EXAM MUTATIONS ===

export function useCreateExam(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamInput) => examsApi.create(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.stats(tenantId) });
      queryClient.invalidateQueries({ queryKey: examKeys.upcoming(tenantId) });
    },
  });
}

export function useUpdateExam(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExamInput }) =>
      examsApi.update(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.detail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: examKeys.stats(tenantId) });
      queryClient.invalidateQueries({ queryKey: examKeys.upcoming(tenantId) });
    },
  });
}

export function useDeleteExam(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => examsApi.delete(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.stats(tenantId) });
      queryClient.invalidateQueries({ queryKey: examKeys.upcoming(tenantId) });
    },
  });
}

// === EXAM RESULT QUERIES ===

export function useExamResultsByExam(tenantId: string, examId: string) {
  return useQuery({
    queryKey: examResultKeys.byExam(tenantId, examId),
    queryFn: () => examResultsApi.byExam(tenantId, examId),
    enabled: !!tenantId && !!examId,
  });
}

export function useExamResultsByStudent(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: examResultKeys.byStudent(tenantId, studentId),
    queryFn: () => examResultsApi.byStudent(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

export function useSemesterResults(tenantId: string, studentId: string, semester: number) {
  return useQuery({
    queryKey: examResultKeys.semester(tenantId, studentId, semester),
    queryFn: () => examResultsApi.semesterResults(tenantId, studentId, semester),
    enabled: !!tenantId && !!studentId && semester > 0,
  });
}

export function useStudentCGPA(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: examResultKeys.cgpa(tenantId, studentId),
    queryFn: () => examResultsApi.cgpa(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

export function useExamPredictions(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: examResultKeys.predictions(tenantId, studentId),
    queryFn: () => examResultsApi.predictions(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

// === EXAM RESULT MUTATIONS ===

export function useCreateExamResult(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamResultInput) => examResultsApi.create(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: examResultKeys.byExam(tenantId, data.examId) });
      queryClient.invalidateQueries({ queryKey: examResultKeys.byStudent(tenantId, data.studentId) });
    },
  });
}

export function useBulkCreateExamResults(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCreateExamResultInput) => examResultsApi.bulkCreate(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: examResultKeys.byExam(tenantId, data.examId) });
      // Invalidate all student results since multiple students might be affected
      queryClient.invalidateQueries({ queryKey: examResultKeys.all });
    },
  });
}

export function useUpdateExamResult(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExamResultInput }) =>
      examResultsApi.update(tenantId, id, data),
    onSuccess: () => {
      // Invalidate all exam results since we don't know the specific exam/student
      queryClient.invalidateQueries({ queryKey: examResultKeys.all });
    },
  });
}
