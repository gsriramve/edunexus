'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

// ============ API Functions ============

async function fetchInbox(tenantId: string, params: MessageQueryParams = {}): Promise<InboxResponse> {
  const authContext = getAuthContext();
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

  const url = `${API_BASE_URL}/teacher/messages/inbox?${queryParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      'x-tenant-id': tenantId,
      'x-user-id': authContext.userId,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch inbox');
  }

  return response.json();
}

async function fetchSent(tenantId: string, params: MessageQueryParams = {}): Promise<SentResponse> {
  const authContext = getAuthContext();
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.messageType) queryParams.append('messageType', params.messageType);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const url = `${API_BASE_URL}/teacher/messages/sent?${queryParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      'x-tenant-id': tenantId,
      'x-user-id': authContext.userId,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch sent messages');
  }

  return response.json();
}

async function fetchMessageById(tenantId: string, messageId: string): Promise<MessageDetail> {
  const authContext = getAuthContext();

  const response = await fetch(`${API_BASE_URL}/teacher/messages/${messageId}`, {
    headers: {
      'x-tenant-id': tenantId,
      'x-user-id': authContext.userId,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch message');
  }

  return response.json();
}

async function fetchStats(tenantId: string): Promise<MessageStats> {
  const authContext = getAuthContext();

  const response = await fetch(`${API_BASE_URL}/teacher/messages/stats/overview`, {
    headers: {
      'x-tenant-id': tenantId,
      'x-user-id': authContext.userId,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch message stats');
  }

  return response.json();
}

async function fetchTeacherClasses(tenantId: string): Promise<TeacherClass[]> {
  const authContext = getAuthContext();

  const response = await fetch(`${API_BASE_URL}/teacher/messages/recipients/classes`, {
    headers: {
      'x-tenant-id': tenantId,
      'x-user-id': authContext.userId,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch classes');
  }

  return response.json();
}

async function searchRecipients(tenantId: string, search: string, type?: string): Promise<SearchRecipient[]> {
  const authContext = getAuthContext();
  const queryParams = new URLSearchParams();
  queryParams.append('q', search);
  if (type) queryParams.append('type', type);

  const response = await fetch(`${API_BASE_URL}/teacher/messages/recipients/search?${queryParams.toString()}`, {
    headers: {
      'x-tenant-id': tenantId,
      'x-user-id': authContext.userId,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search recipients');
  }

  return response.json();
}

async function sendMessage(tenantId: string, data: SendMessageParams): Promise<{ message: string; id: string; totalRecipients: number }> {
  const authContext = getAuthContext();

  const response = await fetch(`${API_BASE_URL}/teacher/messages/send`, {
    method: 'POST',
    headers: {
      'x-tenant-id': tenantId,
      'x-user-id': authContext.userId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send message');
  }

  return response.json();
}

async function replyToMessage(tenantId: string, data: ReplyMessageParams): Promise<{ message: string; id: string }> {
  const authContext = getAuthContext();

  const response = await fetch(`${API_BASE_URL}/teacher/messages/reply`, {
    method: 'POST',
    headers: {
      'x-tenant-id': tenantId,
      'x-user-id': authContext.userId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send reply');
  }

  return response.json();
}

async function markAsRead(tenantId: string, messageIds: string[]): Promise<{ message: string; count: number }> {
  const authContext = getAuthContext();

  const response = await fetch(`${API_BASE_URL}/teacher/messages/read`, {
    method: 'POST',
    headers: {
      'x-tenant-id': tenantId,
      'x-user-id': authContext.userId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messageIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to mark messages as read');
  }

  return response.json();
}

async function toggleStar(tenantId: string, messageId: string): Promise<{ message: string; isStarred: boolean }> {
  const authContext = getAuthContext();

  const response = await fetch(`${API_BASE_URL}/teacher/messages/${messageId}/star`, {
    method: 'PATCH',
    headers: {
      'x-tenant-id': tenantId,
      'x-user-id': authContext.userId,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to toggle star');
  }

  return response.json();
}

async function archiveMessages(tenantId: string, messageIds: string[]): Promise<{ message: string; count: number }> {
  const authContext = getAuthContext();

  const response = await fetch(`${API_BASE_URL}/teacher/messages/archive`, {
    method: 'POST',
    headers: {
      'x-tenant-id': tenantId,
      'x-user-id': authContext.userId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messageIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to archive messages');
  }

  return response.json();
}

async function deleteMessages(tenantId: string, messageIds: string[]): Promise<{ message: string; count: number }> {
  const authContext = getAuthContext();

  const response = await fetch(`${API_BASE_URL}/teacher/messages/delete`, {
    method: 'POST',
    headers: {
      'x-tenant-id': tenantId,
      'x-user-id': authContext.userId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messageIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete messages');
  }

  return response.json();
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
