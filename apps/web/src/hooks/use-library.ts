'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  libraryApi,
  type BookCategory,
  type LibraryBook,
  type LibraryCard,
  type BookIssue,
  type BookReservation,
  type EResource,
  type LibrarySettings,
  type LibraryStats,
  type BookQueryParams,
  type CardQueryParams,
  type IssueQueryParams,
  type ReservationQueryParams,
  type EResourceQueryParams,
  type CreateCategoryInput,
  type CreateBookInput,
  type CreateCardInput,
  type IssueBookInput,
  type ReturnBookInput,
  type RenewBookInput,
  type CreateReservationInput,
  type CreateEResourceInput,
  type UpdateSettingsInput,
} from '@/lib/api';

// Local type aliases for update operations
type UpdateCategoryInput = Partial<CreateCategoryInput>;
type UpdateBookInput = Partial<CreateBookInput>;
type UpdateCardInput = Partial<CreateCardInput>;
type UpdateEResourceInput = Partial<CreateEResourceInput>;
type UpdateLibrarySettingsInput = UpdateSettingsInput;

// Query keys
export const libraryKeys = {
  all: ['library'] as const,
  // Categories
  categories: () => [...libraryKeys.all, 'categories'] as const,
  categoryList: (tenantId: string) => [...libraryKeys.categories(), 'list', tenantId] as const,
  categoryDetail: (tenantId: string, id: string) => [...libraryKeys.categories(), 'detail', tenantId, id] as const,
  // Books
  books: () => [...libraryKeys.all, 'books'] as const,
  bookList: (tenantId: string, params?: BookQueryParams) => [...libraryKeys.books(), 'list', tenantId, params] as const,
  bookDetail: (tenantId: string, id: string) => [...libraryKeys.books(), 'detail', tenantId, id] as const,
  // Cards
  cards: () => [...libraryKeys.all, 'cards'] as const,
  cardList: (tenantId: string, params?: CardQueryParams) => [...libraryKeys.cards(), 'list', tenantId, params] as const,
  cardDetail: (tenantId: string, id: string) => [...libraryKeys.cards(), 'detail', tenantId, id] as const,
  studentCard: (tenantId: string, studentId: string) => [...libraryKeys.cards(), 'student', tenantId, studentId] as const,
  // Issues
  issues: () => [...libraryKeys.all, 'issues'] as const,
  issueList: (tenantId: string, params?: IssueQueryParams) => [...libraryKeys.issues(), 'list', tenantId, params] as const,
  issueDetail: (tenantId: string, id: string) => [...libraryKeys.issues(), 'detail', tenantId, id] as const,
  cardIssues: (tenantId: string, cardId: string) => [...libraryKeys.issues(), 'card', tenantId, cardId] as const,
  // Reservations
  reservations: () => [...libraryKeys.all, 'reservations'] as const,
  reservationList: (tenantId: string, params?: ReservationQueryParams) => [...libraryKeys.reservations(), 'list', tenantId, params] as const,
  reservationDetail: (tenantId: string, id: string) => [...libraryKeys.reservations(), 'detail', tenantId, id] as const,
  // E-Resources
  eResources: () => [...libraryKeys.all, 'eResources'] as const,
  eResourceList: (tenantId: string, params?: EResourceQueryParams) => [...libraryKeys.eResources(), 'list', tenantId, params] as const,
  eResourceDetail: (tenantId: string, id: string) => [...libraryKeys.eResources(), 'detail', tenantId, id] as const,
  // Settings
  settings: (tenantId: string) => [...libraryKeys.all, 'settings', tenantId] as const,
  // Stats
  stats: (tenantId: string) => [...libraryKeys.all, 'stats', tenantId] as const,
};

// === CATEGORY QUERIES ===

export function useCategories(tenantId: string) {
  return useQuery({
    queryKey: libraryKeys.categoryList(tenantId),
    queryFn: () => libraryApi.listCategories(tenantId),
    enabled: !!tenantId,
  });
}

export function useCategory(tenantId: string, id: string) {
  return useQuery({
    queryKey: libraryKeys.categoryDetail(tenantId, id),
    queryFn: () => libraryApi.getCategory(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

// === CATEGORY MUTATIONS ===

export function useCreateCategory(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) => libraryApi.createCategory(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.categories() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats(tenantId) });
    },
  });
}

export function useUpdateCategory(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      libraryApi.updateCategory(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.categories() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.categoryDetail(tenantId, id) });
    },
  });
}

export function useDeleteCategory(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => libraryApi.deleteCategory(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.categories() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats(tenantId) });
    },
  });
}

// === BOOK QUERIES ===

export function useBooks(tenantId: string, params?: BookQueryParams) {
  return useQuery({
    queryKey: libraryKeys.bookList(tenantId, params),
    queryFn: () => libraryApi.listBooks(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useBook(tenantId: string, id: string) {
  return useQuery({
    queryKey: libraryKeys.bookDetail(tenantId, id),
    queryFn: () => libraryApi.getBook(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

// === BOOK MUTATIONS ===

export function useCreateBook(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookInput) => libraryApi.createBook(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats(tenantId) });
    },
  });
}

export function useUpdateBook(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookInput }) =>
      libraryApi.updateBook(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.bookDetail(tenantId, id) });
    },
  });
}

export function useDeleteBook(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => libraryApi.deleteBook(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats(tenantId) });
    },
  });
}

// === CARD QUERIES ===

export function useLibraryCards(tenantId: string, params?: CardQueryParams) {
  return useQuery({
    queryKey: libraryKeys.cardList(tenantId, params),
    queryFn: () => libraryApi.listCards(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useLibraryCard(tenantId: string, id: string) {
  return useQuery({
    queryKey: libraryKeys.cardDetail(tenantId, id),
    queryFn: () => libraryApi.getCard(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useStudentLibraryCard(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: libraryKeys.studentCard(tenantId, studentId),
    queryFn: () => libraryApi.getStudentCard(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

// === CARD MUTATIONS ===

export function useCreateLibraryCard(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCardInput) => libraryApi.createCard(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.cards() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.studentCard(tenantId, data.studentId) });
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats(tenantId) });
    },
  });
}

export function useUpdateLibraryCard(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCardInput }) =>
      libraryApi.updateCard(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.cards() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.cardDetail(tenantId, id) });
    },
  });
}

// === ISSUE QUERIES ===

export function useBookIssues(tenantId: string, params?: IssueQueryParams) {
  return useQuery({
    queryKey: libraryKeys.issueList(tenantId, params),
    queryFn: () => libraryApi.listIssues(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useBookIssue(tenantId: string, id: string) {
  return useQuery({
    queryKey: libraryKeys.issueDetail(tenantId, id),
    queryFn: () => libraryApi.getIssue(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useCardIssues(tenantId: string, cardId: string) {
  return useQuery({
    queryKey: libraryKeys.cardIssues(tenantId, cardId),
    queryFn: () => libraryApi.getCardIssues(tenantId, cardId),
    enabled: !!tenantId && !!cardId,
  });
}

// === ISSUE MUTATIONS ===

export function useIssueBook(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IssueBookInput) => libraryApi.issueBook(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.issues() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.cardIssues(tenantId, data.cardId) });
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats(tenantId) });
    },
  });
}

export function useReturnBook(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnBookInput }) =>
      libraryApi.returnBook(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.issues() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats(tenantId) });
    },
  });
}

export function useRenewBook(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RenewBookInput }) =>
      libraryApi.renewBook(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.issues() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.issueDetail(tenantId, id) });
    },
  });
}

// === RESERVATION QUERIES ===

export function useReservations(tenantId: string, params?: ReservationQueryParams) {
  return useQuery({
    queryKey: libraryKeys.reservationList(tenantId, params),
    queryFn: () => libraryApi.listReservations(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useReservation(tenantId: string, id: string) {
  return useQuery({
    queryKey: libraryKeys.reservationDetail(tenantId, id),
    queryFn: () => libraryApi.getReservation(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

// === RESERVATION MUTATIONS ===

export function useCreateReservation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationInput) => libraryApi.createReservation(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.reservations() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats(tenantId) });
    },
  });
}

export function useCancelReservation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => libraryApi.cancelReservation(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.reservations() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats(tenantId) });
    },
  });
}

export function useCollectReservation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => libraryApi.collectReservation(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.reservations() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.issues() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats(tenantId) });
    },
  });
}

// === E-RESOURCE QUERIES ===

export function useEResources(tenantId: string, params?: EResourceQueryParams) {
  return useQuery({
    queryKey: libraryKeys.eResourceList(tenantId, params),
    queryFn: () => libraryApi.listEResources(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useEResource(tenantId: string, id: string) {
  return useQuery({
    queryKey: libraryKeys.eResourceDetail(tenantId, id),
    queryFn: () => libraryApi.getEResource(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

// === E-RESOURCE MUTATIONS ===

export function useCreateEResource(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEResourceInput) => libraryApi.createEResource(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.eResources() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats(tenantId) });
    },
  });
}

export function useUpdateEResource(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEResourceInput }) =>
      libraryApi.updateEResource(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.eResources() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.eResourceDetail(tenantId, id) });
    },
  });
}

export function useDeleteEResource(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => libraryApi.deleteEResource(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.eResources() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats(tenantId) });
    },
  });
}

export function useRecordEResourceView(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => libraryApi.recordView(tenantId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.eResourceDetail(tenantId, id) });
    },
  });
}

export function useRecordEResourceDownload(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => libraryApi.recordDownload(tenantId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.eResourceDetail(tenantId, id) });
    },
  });
}

// === SETTINGS QUERIES ===

export function useLibrarySettings(tenantId: string) {
  return useQuery({
    queryKey: libraryKeys.settings(tenantId),
    queryFn: () => libraryApi.getSettings(tenantId),
    enabled: !!tenantId,
  });
}

// === SETTINGS MUTATIONS ===

export function useUpdateLibrarySettings(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLibrarySettingsInput) => libraryApi.updateSettings(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.settings(tenantId) });
    },
  });
}

// === STATS QUERY ===

export function useLibraryStats(tenantId: string) {
  return useQuery({
    queryKey: libraryKeys.stats(tenantId),
    queryFn: () => libraryApi.getStats(tenantId),
    enabled: !!tenantId,
  });
}
