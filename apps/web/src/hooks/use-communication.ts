import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  communicationApi,
  type Announcement,
  type AnnouncementListParams,
  type AnnouncementListResponse,
  type AnnouncementWithReadStatus,
  type AnnouncementRecipient,
  type AnnouncementComment,
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
  type CreateCommentInput,
  type MessageTemplate,
  type TemplateListParams,
  type TemplateListResponse,
  type CreateTemplateInput,
  type UpdateTemplateInput,
  type BulkCommunication,
  type BulkCommunicationListParams,
  type BulkCommunicationListResponse,
  type CreateBulkCommunicationInput,
  type UpdateBulkCommunicationInput,
  type CommunicationLog,
  type CommunicationLogListParams,
  type CommunicationLogListResponse,
  type SendMessageInput,
  type CommunicationStats,
} from '@/lib/api';

// Query Keys
export const communicationKeys = {
  all: ['communication'] as const,
  stats: (tenantId: string) => [...communicationKeys.all, 'stats', tenantId] as const,

  // Announcements
  announcements: () => [...communicationKeys.all, 'announcements'] as const,
  announcementList: (tenantId: string, params?: AnnouncementListParams) =>
    [...communicationKeys.announcements(), tenantId, params] as const,
  announcement: (tenantId: string, id: string) =>
    [...communicationKeys.announcements(), tenantId, id] as const,
  userAnnouncements: (tenantId: string, userId: string, userType: string, params?: any) =>
    [...communicationKeys.announcements(), 'user', tenantId, userId, userType, params] as const,
  announcementRecipients: (tenantId: string, announcementId: string) =>
    [...communicationKeys.announcements(), tenantId, announcementId, 'recipients'] as const,
  announcementComments: (tenantId: string, announcementId: string) =>
    [...communicationKeys.announcements(), tenantId, announcementId, 'comments'] as const,

  // Templates
  templates: () => [...communicationKeys.all, 'templates'] as const,
  templateList: (tenantId: string, params?: TemplateListParams) =>
    [...communicationKeys.templates(), tenantId, params] as const,
  template: (tenantId: string, id: string) =>
    [...communicationKeys.templates(), tenantId, id] as const,
  templateByCode: (tenantId: string, code: string) =>
    [...communicationKeys.templates(), tenantId, 'code', code] as const,

  // Bulk Communications
  bulk: () => [...communicationKeys.all, 'bulk'] as const,
  bulkList: (tenantId: string, params?: BulkCommunicationListParams) =>
    [...communicationKeys.bulk(), tenantId, params] as const,
  bulkItem: (tenantId: string, id: string) =>
    [...communicationKeys.bulk(), tenantId, id] as const,

  // Logs
  logs: () => [...communicationKeys.all, 'logs'] as const,
  logList: (tenantId: string, params?: CommunicationLogListParams) =>
    [...communicationKeys.logs(), tenantId, params] as const,
};

// ==================== Stats ====================

export function useCommunicationStats(tenantId: string) {
  return useQuery({
    queryKey: communicationKeys.stats(tenantId),
    queryFn: () => communicationApi.getStats(tenantId),
    enabled: !!tenantId,
  });
}

// ==================== Announcements ====================

export function useAnnouncements(tenantId: string, params?: AnnouncementListParams) {
  return useQuery({
    queryKey: communicationKeys.announcementList(tenantId, params),
    queryFn: () => communicationApi.listAnnouncements(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useAnnouncement(tenantId: string, id: string) {
  return useQuery({
    queryKey: communicationKeys.announcement(tenantId, id),
    queryFn: () => communicationApi.getAnnouncement(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useUserAnnouncements(
  tenantId: string,
  userId: string,
  userType: string,
  params?: { departmentId?: string; courseId?: string; batchYear?: number }
) {
  return useQuery({
    queryKey: communicationKeys.userAnnouncements(tenantId, userId, userType, params),
    queryFn: () => communicationApi.getAnnouncementsForUser(tenantId, userId, userType, params),
    enabled: !!tenantId && !!userId && !!userType,
  });
}

export function useAnnouncementRecipients(tenantId: string, announcementId: string, readOnly?: boolean) {
  return useQuery({
    queryKey: communicationKeys.announcementRecipients(tenantId, announcementId),
    queryFn: () => communicationApi.getAnnouncementRecipients(tenantId, announcementId, readOnly),
    enabled: !!tenantId && !!announcementId,
  });
}

export function useAnnouncementComments(tenantId: string, announcementId: string) {
  return useQuery({
    queryKey: communicationKeys.announcementComments(tenantId, announcementId),
    queryFn: () => communicationApi.getComments(tenantId, announcementId),
    enabled: !!tenantId && !!announcementId,
  });
}

export function useCreateAnnouncement(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncementInput) => communicationApi.createAnnouncement(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats(tenantId) });
    },
  });
}

export function useUpdateAnnouncement(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementInput }) =>
      communicationApi.updateAnnouncement(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcement(tenantId, id) });
    },
  });
}

export function useDeleteAnnouncement(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communicationApi.deleteAnnouncement(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats(tenantId) });
    },
  });
}

export function usePublishAnnouncement(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communicationApi.publishAnnouncement(tenantId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcement(tenantId, id) });
    },
  });
}

export function useArchiveAnnouncement(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communicationApi.archiveAnnouncement(tenantId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcement(tenantId, id) });
    },
  });
}

export function useMarkAnnouncementRead(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { announcementId: string; userId: string; userType: string }) =>
      communicationApi.markAnnouncementRead(tenantId, data),
    onSuccess: (_, { userId }) => {
      // Invalidate user announcements to refresh read status
      queryClient.invalidateQueries({
        queryKey: [...communicationKeys.announcements(), 'user', tenantId, userId]
      });
    },
  });
}

export function useAcknowledgeAnnouncement(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { announcementId: string; userId: string }) =>
      communicationApi.acknowledgeAnnouncement(tenantId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: [...communicationKeys.announcements(), 'user', tenantId, userId]
      });
    },
  });
}

// ==================== Comments ====================

export function useCreateComment(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentInput) => communicationApi.createComment(tenantId, data),
    onSuccess: (_, { announcementId }) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.announcementComments(tenantId, announcementId)
      });
    },
  });
}

export function useHideComment(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => communicationApi.hideComment(tenantId, commentId),
    onSuccess: () => {
      // Invalidate all comments since we don't know which announcement
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() });
    },
  });
}

// ==================== Templates ====================

export function useTemplates(tenantId: string, params?: TemplateListParams) {
  return useQuery({
    queryKey: communicationKeys.templateList(tenantId, params),
    queryFn: () => communicationApi.listTemplates(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useTemplate(tenantId: string, id: string) {
  return useQuery({
    queryKey: communicationKeys.template(tenantId, id),
    queryFn: () => communicationApi.getTemplate(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useTemplateByCode(tenantId: string, code: string) {
  return useQuery({
    queryKey: communicationKeys.templateByCode(tenantId, code),
    queryFn: () => communicationApi.getTemplateByCode(tenantId, code),
    enabled: !!tenantId && !!code,
  });
}

export function useCreateTemplate(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateInput) => communicationApi.createTemplate(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.templates() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats(tenantId) });
    },
  });
}

export function useUpdateTemplate(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateInput }) =>
      communicationApi.updateTemplate(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.templates() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.template(tenantId, id) });
    },
  });
}

export function useDeleteTemplate(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communicationApi.deleteTemplate(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.templates() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats(tenantId) });
    },
  });
}

// ==================== Bulk Communications ====================

export function useBulkCommunications(tenantId: string, params?: BulkCommunicationListParams) {
  return useQuery({
    queryKey: communicationKeys.bulkList(tenantId, params),
    queryFn: () => communicationApi.listBulkCommunications(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useBulkCommunication(tenantId: string, id: string) {
  return useQuery({
    queryKey: communicationKeys.bulkItem(tenantId, id),
    queryFn: () => communicationApi.getBulkCommunication(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useCreateBulkCommunication(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBulkCommunicationInput) =>
      communicationApi.createBulkCommunication(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.bulk() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats(tenantId) });
    },
  });
}

export function useUpdateBulkCommunication(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBulkCommunicationInput }) =>
      communicationApi.updateBulkCommunication(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.bulk() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.bulkItem(tenantId, id) });
    },
  });
}

export function useDeleteBulkCommunication(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communicationApi.deleteBulkCommunication(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.bulk() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats(tenantId) });
    },
  });
}

export function useCancelBulkCommunication(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communicationApi.cancelBulkCommunication(tenantId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.bulk() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.bulkItem(tenantId, id) });
    },
  });
}

export function useStartBulkCommunication(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communicationApi.startBulkCommunication(tenantId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.bulk() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.bulkItem(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.logs() });
    },
  });
}

// ==================== Communication Logs ====================

export function useCommunicationLogs(tenantId: string, params?: CommunicationLogListParams) {
  return useQuery({
    queryKey: communicationKeys.logList(tenantId, params),
    queryFn: () => communicationApi.listLogs(tenantId, params),
    enabled: !!tenantId,
  });
}

// ==================== Send Message ====================

export function useSendMessage(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessageInput) => communicationApi.sendMessage(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.logs() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats(tenantId) });
    },
  });
}

// Re-export types for convenience
export type {
  Announcement,
  AnnouncementListParams,
  AnnouncementListResponse,
  AnnouncementWithReadStatus,
  AnnouncementRecipient,
  AnnouncementComment,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  CreateCommentInput,
  MessageTemplate,
  TemplateListParams,
  TemplateListResponse,
  CreateTemplateInput,
  UpdateTemplateInput,
  BulkCommunication,
  BulkCommunicationListParams,
  BulkCommunicationListResponse,
  CreateBulkCommunicationInput,
  UpdateBulkCommunicationInput,
  CommunicationLog,
  CommunicationLogListParams,
  CommunicationLogListResponse,
  SendMessageInput,
  CommunicationStats,
};
