'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export interface MessageSender {
  id: string;
  name: string;
  type: string;
}

export interface MessageRecipient {
  id: string | null;
  name: string | null;
  type: string;
}

export interface InboxMessage {
  id: string;
  from: MessageSender;
  subject: string;
  preview: string;
  content: string;
  messageType: string;
  attachments: any[] | null;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  replyCount: number;
  createdAt: string;
}

export interface SentMessage {
  id: string;
  to: MessageRecipient;
  subject: string;
  preview: string;
  content: string;
  messageType: string;
  attachments: any[] | null;
  totalRecipients: number;
  deliveredCount: number;
  readCount: number;
  replyCount: number;
  createdAt: string;
}

export interface MessageReply {
  id: string;
  from: MessageSender;
  content: string;
  attachments: any[] | null;
  createdAt: string;
}

export interface MessageDetail {
  id: string;
  from: MessageSender;
  to: MessageRecipient;
  subject: string;
  content: string;
  messageType: string;
  attachments: any[] | null;
  isRead: boolean;
  isStarred: boolean;
  createdAt: string;
  replies: MessageReply[];
}

export interface MessageStats {
  unreadCount: number;
  totalInbox: number;
  totalSent: number;
  starredCount: number;
}

export interface TeacherClass {
  id: string;
  name: string;
  subjectName: string | null;
  subjectCode: string | null;
  sectionName: string | null;
  studentCount: number;
}

export interface SearchRecipient {
  id: string;
  name: string;
  type: string;
  subtitle: string | null;
}

export interface InboxResponse {
  messages: InboxMessage[];
  total: number;
  limit: number;
  offset: number;
}

export interface SentResponse {
  messages: SentMessage[];
  total: number;
  limit: number;
  offset: number;
}

export interface MessageQueryParams {
  search?: string;
  messageType?: string;
  unreadOnly?: boolean;
  starredOnly?: boolean;
  archivedOnly?: boolean;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export interface SendMessageParams {
  recipientType: 'individual' | 'class' | 'department' | 'custom';
  recipientId?: string;
  recipientName?: string;
  recipientUserType?: string;
  recipients?: { id: string; name: string; type: string }[];
  subject: string;
  content: string;
  messageType?: string;
  parentId?: string;
  attachments?: { name: string; url: string; type: string; size?: number }[];
}

export interface ReplyMessageParams {
  messageId: string;
  content: string;
  attachments?: { name: string; url: string; type: string; size?: number }[];
}

// ============ API Helper ============

async function teacherMessagesApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/api/teacher/messages${endpoint}`, {
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

// ============ API Functions ============

async function fetchInbox(tenantId: string, params: MessageQueryParams = {}): Promise<InboxResponse> {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.messageType) queryParams.append('messageType', params.messageType);
  if (params.unreadOnly) queryParams.append('unreadOnly', 'true');
  if (params.starredOnly) queryParams.append('starredOnly', 'true');
  if (params.archivedOnly) queryParams.append('archivedOnly', 'true');
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const queryString = queryParams.toString();
  return teacherMessagesApi<InboxResponse>(`/inbox${queryString ? `?${queryString}` : ''}`, tenantId);
}

async function fetchSent(tenantId: string, params: MessageQueryParams = {}): Promise<SentResponse> {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.messageType) queryParams.append('messageType', params.messageType);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const queryString = queryParams.toString();
  return teacherMessagesApi<SentResponse>(`/sent${queryString ? `?${queryString}` : ''}`, tenantId);
}

async function fetchMessageById(tenantId: string, messageId: string): Promise<MessageDetail> {
  return teacherMessagesApi<MessageDetail>(`/${messageId}`, tenantId);
}

async function fetchStats(tenantId: string): Promise<MessageStats> {
  return teacherMessagesApi<MessageStats>('/stats/overview', tenantId);
}

async function fetchTeacherClasses(tenantId: string): Promise<TeacherClass[]> {
  return teacherMessagesApi<TeacherClass[]>('/recipients/classes', tenantId);
}

async function searchRecipients(tenantId: string, search: string, type?: string): Promise<SearchRecipient[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('q', search);
  if (type) queryParams.append('type', type);
  return teacherMessagesApi<SearchRecipient[]>(`/recipients/search?${queryParams.toString()}`, tenantId);
}

async function sendMessage(tenantId: string, data: SendMessageParams): Promise<{ message: string; id: string; totalRecipients: number }> {
  return teacherMessagesApi<{ message: string; id: string; totalRecipients: number }>('/send', tenantId, { method: 'POST', body: data });
}

async function replyToMessage(tenantId: string, data: ReplyMessageParams): Promise<{ message: string; id: string }> {
  return teacherMessagesApi<{ message: string; id: string }>('/reply', tenantId, { method: 'POST', body: data });
}

async function markAsRead(tenantId: string, messageIds: string[]): Promise<{ message: string; count: number }> {
  return teacherMessagesApi<{ message: string; count: number }>('/read', tenantId, { method: 'POST', body: { messageIds } });
}

async function toggleStar(tenantId: string, messageId: string): Promise<{ message: string; isStarred: boolean }> {
  return teacherMessagesApi<{ message: string; isStarred: boolean }>(`/${messageId}/star`, tenantId, { method: 'PATCH' });
}

async function archiveMessages(tenantId: string, messageIds: string[]): Promise<{ message: string; count: number }> {
  return teacherMessagesApi<{ message: string; count: number }>('/archive', tenantId, { method: 'POST', body: { messageIds } });
}

async function deleteMessages(tenantId: string, messageIds: string[]): Promise<{ message: string; count: number }> {
  return teacherMessagesApi<{ message: string; count: number }>('/delete', tenantId, { method: 'POST', body: { messageIds } });
}

// ============ Hooks ============

export function useInbox(tenantId: string, params: MessageQueryParams = {}) {
  return useQuery({
    queryKey: ['teacher-messages', 'inbox', tenantId, params],
    queryFn: () => fetchInbox(tenantId, params),
    enabled: !!tenantId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSentMessages(tenantId: string, params: MessageQueryParams = {}) {
  return useQuery({
    queryKey: ['teacher-messages', 'sent', tenantId, params],
    queryFn: () => fetchSent(tenantId, params),
    enabled: !!tenantId,
    staleTime: 30 * 1000,
  });
}

export function useMessageById(tenantId: string, messageId: string | null) {
  return useQuery({
    queryKey: ['teacher-messages', 'message', tenantId, messageId],
    queryFn: () => fetchMessageById(tenantId, messageId!),
    enabled: !!tenantId && !!messageId,
  });
}

export function useMessageStats(tenantId: string) {
  return useQuery({
    queryKey: ['teacher-messages', 'stats', tenantId],
    queryFn: () => fetchStats(tenantId),
    enabled: !!tenantId,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useTeacherClassesForMessages(tenantId: string) {
  return useQuery({
    queryKey: ['teacher-messages', 'classes', tenantId],
    queryFn: () => fetchTeacherClasses(tenantId),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSearchRecipients(tenantId: string, search: string, type?: string) {
  return useQuery({
    queryKey: ['teacher-messages', 'search-recipients', tenantId, search, type],
    queryFn: () => searchRecipients(tenantId, search, type),
    enabled: !!tenantId && search.length >= 2,
    staleTime: 30 * 1000,
  });
}

export function useSendMessage(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageParams) => sendMessage(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-messages', 'sent'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-messages', 'stats'] });
    },
  });
}

export function useReplyToMessage(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReplyMessageParams) => replyToMessage(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-messages'] });
    },
  });
}

export function useMarkAsRead(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageIds: string[]) => markAsRead(tenantId, messageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-messages', 'inbox'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-messages', 'stats'] });
    },
  });
}

export function useToggleStar(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => toggleStar(tenantId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-messages'] });
    },
  });
}

export function useArchiveMessages(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageIds: string[]) => archiveMessages(tenantId, messageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-messages'] });
    },
  });
}

export function useDeleteMessages(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageIds: string[]) => deleteMessages(tenantId, messageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-messages'] });
    },
  });
}
