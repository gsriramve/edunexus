'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// Types
export interface NotificationItem {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  time: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  categories: {
    academic: boolean;
    events: boolean;
    messages: boolean;
    system: boolean;
  };
}

export interface QueryNotificationsParams {
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// API Client
async function studentNotificationsApi<T>(
  endpoint: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { method = 'GET', body } = options;
  const authContext = getAuthContext();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authContext) {
    if (authContext.tenantId) headers['x-tenant-id'] = authContext.tenantId;
    if (authContext.userId) headers['x-user-id'] = authContext.userId;
    if (authContext.role) headers['x-user-role'] = authContext.role;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/student-notifications${endpoint}`, {
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

// Query keys
export const studentNotificationsKeys = {
  all: ['student-notifications'] as const,
  list: (studentId: string, params?: QueryNotificationsParams) =>
    [...studentNotificationsKeys.all, 'list', studentId, params] as const,
  unreadCount: (studentId: string) =>
    [...studentNotificationsKeys.all, 'unread-count', studentId] as const,
  preferences: (studentId: string) =>
    [...studentNotificationsKeys.all, 'preferences', studentId] as const,
};

// Helper to build query string
function buildQueryString(params?: QueryNotificationsParams): string {
  if (!params) return '';
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.set(key, String(value));
    }
  });
  const query = queryParams.toString();
  return query ? `?${query}` : '';
}

// Hooks

/**
 * Get notifications list with pagination and filtering
 */
export function useStudentNotifications(studentId: string, params?: QueryNotificationsParams) {
  return useQuery({
    queryKey: studentNotificationsKeys.list(studentId, params),
    queryFn: () =>
      studentNotificationsApi<NotificationsResponse>(
        `/${studentId}${buildQueryString(params)}`
      ),
    enabled: !!studentId,
  });
}

/**
 * Get unread notifications count
 */
export function useUnreadNotificationsCount(studentId: string) {
  return useQuery({
    queryKey: studentNotificationsKeys.unreadCount(studentId),
    queryFn: () =>
      studentNotificationsApi<{ count: number }>(`/${studentId}/unread-count`),
    enabled: !!studentId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Get notification preferences
 */
export function useNotificationPreferences(studentId: string) {
  return useQuery({
    queryKey: studentNotificationsKeys.preferences(studentId),
    queryFn: () =>
      studentNotificationsApi<NotificationPreferences>(`/${studentId}/preferences`),
    enabled: !!studentId,
  });
}

/**
 * Mark a notification as read
 */
export function useMarkNotificationRead(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      studentNotificationsApi<{ success: boolean }>(
        `/${studentId}/read/${notificationId}`,
        { method: 'PATCH' }
      ),
    onSuccess: () => {
      // Invalidate notifications list and unread count
      queryClient.invalidateQueries({ queryKey: studentNotificationsKeys.all });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsRead(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      studentNotificationsApi<{ success: boolean; count: number }>(
        `/${studentId}/read-all`,
        { method: 'POST' }
      ),
    onSuccess: () => {
      // Invalidate notifications list and unread count
      queryClient.invalidateQueries({ queryKey: studentNotificationsKeys.all });
    },
  });
}

/**
 * Update notification preferences
 */
export function useUpdateNotificationPreferences(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<NotificationPreferences>) =>
      studentNotificationsApi<NotificationPreferences>(
        `/${studentId}/preferences`,
        { method: 'PATCH', body: preferences }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentNotificationsKeys.preferences(studentId),
      });
    },
  });
}
