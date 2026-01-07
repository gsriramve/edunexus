'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  hostelApi,
  type HostelBlock,
  type HostelRoom,
  type HostelAllocation,
  type HostelFee,
  type MessMenu,
  type HostelComplaint,
  type HostelStats,
  type BlockQueryParams,
  type RoomQueryParams,
  type AllocationQueryParams,
  type HostelFeeQueryParams,
  type ComplaintQueryParams,
  type CreateBlockInput,
  type CreateRoomInput,
  type CreateAllocationInput,
  type TransferAllocationInput,
  type CreateHostelFeeInput,
  type CreateMessMenuInput,
  type CreateComplaintInput,
} from '@/lib/api';

// Query keys
export const hostelKeys = {
  all: ['hostel'] as const,
  // Blocks
  blocks: () => [...hostelKeys.all, 'blocks'] as const,
  blockList: (tenantId: string, params?: BlockQueryParams) => [...hostelKeys.blocks(), 'list', tenantId, params] as const,
  blockDetail: (tenantId: string, id: string) => [...hostelKeys.blocks(), 'detail', tenantId, id] as const,
  // Rooms
  rooms: () => [...hostelKeys.all, 'rooms'] as const,
  roomList: (tenantId: string, params?: RoomQueryParams) => [...hostelKeys.rooms(), 'list', tenantId, params] as const,
  roomDetail: (tenantId: string, id: string) => [...hostelKeys.rooms(), 'detail', tenantId, id] as const,
  // Allocations
  allocations: () => [...hostelKeys.all, 'allocations'] as const,
  allocationList: (tenantId: string, params?: AllocationQueryParams) => [...hostelKeys.allocations(), 'list', tenantId, params] as const,
  allocationDetail: (tenantId: string, id: string) => [...hostelKeys.allocations(), 'detail', tenantId, id] as const,
  studentAllocation: (tenantId: string, studentId: string) => [...hostelKeys.allocations(), 'student', tenantId, studentId] as const,
  // Fees
  fees: () => [...hostelKeys.all, 'fees'] as const,
  feeList: (tenantId: string, params?: HostelFeeQueryParams) => [...hostelKeys.fees(), 'list', tenantId, params] as const,
  studentFees: (tenantId: string, studentId: string) => [...hostelKeys.fees(), 'student', tenantId, studentId] as const,
  // Menu
  menu: () => [...hostelKeys.all, 'menu'] as const,
  menuList: (tenantId: string, params?: { blockId?: string; dayOfWeek?: number; mealType?: string }) => [...hostelKeys.menu(), 'list', tenantId, params] as const,
  weeklyMenu: (tenantId: string, blockId?: string) => [...hostelKeys.menu(), 'weekly', tenantId, blockId] as const,
  // Complaints
  complaints: () => [...hostelKeys.all, 'complaints'] as const,
  complaintList: (tenantId: string, params?: ComplaintQueryParams) => [...hostelKeys.complaints(), 'list', tenantId, params] as const,
  complaintDetail: (tenantId: string, id: string) => [...hostelKeys.complaints(), 'detail', tenantId, id] as const,
  studentComplaints: (tenantId: string, studentId: string) => [...hostelKeys.complaints(), 'student', tenantId, studentId] as const,
  // Stats
  stats: (tenantId: string) => [...hostelKeys.all, 'stats', tenantId] as const,
};

// === BLOCK QUERIES ===

export function useHostelBlocks(tenantId: string, params?: BlockQueryParams) {
  return useQuery({
    queryKey: hostelKeys.blockList(tenantId, params),
    queryFn: () => hostelApi.listBlocks(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useHostelBlock(tenantId: string, id: string) {
  return useQuery({
    queryKey: hostelKeys.blockDetail(tenantId, id),
    queryFn: () => hostelApi.getBlock(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

// === BLOCK MUTATIONS ===

export function useCreateBlock(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlockInput) => hostelApi.createBlock(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.blocks() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.stats(tenantId) });
    },
  });
}

export function useUpdateBlock(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBlockInput> }) =>
      hostelApi.updateBlock(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.blocks() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.blockDetail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: hostelKeys.stats(tenantId) });
    },
  });
}

export function useDeleteBlock(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hostelApi.deleteBlock(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.blocks() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.stats(tenantId) });
    },
  });
}

// === ROOM QUERIES ===

export function useHostelRooms(tenantId: string, params?: RoomQueryParams) {
  return useQuery({
    queryKey: hostelKeys.roomList(tenantId, params),
    queryFn: () => hostelApi.listRooms(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useHostelRoom(tenantId: string, id: string) {
  return useQuery({
    queryKey: hostelKeys.roomDetail(tenantId, id),
    queryFn: () => hostelApi.getRoom(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

// === ROOM MUTATIONS ===

export function useCreateRoom(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoomInput) => hostelApi.createRoom(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.blocks() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.stats(tenantId) });
    },
  });
}

export function useBulkCreateRooms(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ blockId, rooms }: { blockId: string; rooms: Omit<CreateRoomInput, 'blockId'>[] }) =>
      hostelApi.bulkCreateRooms(tenantId, blockId, rooms),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.blocks() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.stats(tenantId) });
    },
  });
}

export function useUpdateRoom(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRoomInput> }) =>
      hostelApi.updateRoom(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.roomDetail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: hostelKeys.stats(tenantId) });
    },
  });
}

export function useDeleteRoom(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hostelApi.deleteRoom(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.blocks() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.stats(tenantId) });
    },
  });
}

// === ALLOCATION QUERIES ===

export function useHostelAllocations(tenantId: string, params?: AllocationQueryParams) {
  return useQuery({
    queryKey: hostelKeys.allocationList(tenantId, params),
    queryFn: () => hostelApi.listAllocations(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useHostelAllocation(tenantId: string, id: string) {
  return useQuery({
    queryKey: hostelKeys.allocationDetail(tenantId, id),
    queryFn: () => hostelApi.getAllocation(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useStudentHostelAllocation(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: hostelKeys.studentAllocation(tenantId, studentId),
    queryFn: () => hostelApi.getStudentAllocation(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

// === ALLOCATION MUTATIONS ===

export function useCreateAllocation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAllocationInput) => hostelApi.createAllocation(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.allocations() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.studentAllocation(tenantId, data.studentId) });
      queryClient.invalidateQueries({ queryKey: hostelKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.stats(tenantId) });
    },
  });
}

export function useUpdateAllocation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAllocationInput> }) =>
      hostelApi.updateAllocation(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.allocations() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.allocationDetail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: hostelKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.stats(tenantId) });
    },
  });
}

export function useTransferAllocation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransferAllocationInput }) =>
      hostelApi.transferAllocation(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.allocations() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.stats(tenantId) });
    },
  });
}

// === HOSTEL FEE QUERIES ===

export function useHostelFees(tenantId: string, params?: HostelFeeQueryParams) {
  return useQuery({
    queryKey: hostelKeys.feeList(tenantId, params),
    queryFn: () => hostelApi.listHostelFees(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useStudentHostelFees(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: hostelKeys.studentFees(tenantId, studentId),
    queryFn: () => hostelApi.getStudentHostelFees(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

// === HOSTEL FEE MUTATIONS ===

export function useCreateHostelFee(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHostelFeeInput) => hostelApi.createHostelFee(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.fees() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.studentFees(tenantId, data.studentId) });
    },
  });
}

export function useUpdateHostelFee(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateHostelFeeInput> }) =>
      hostelApi.updateHostelFee(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.fees() });
    },
  });
}

// === MESS MENU QUERIES ===

export function useMessMenus(tenantId: string, params?: { blockId?: string; dayOfWeek?: number; mealType?: string }) {
  return useQuery({
    queryKey: hostelKeys.menuList(tenantId, params),
    queryFn: () => hostelApi.listMessMenus(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useWeeklyMenu(tenantId: string, blockId?: string) {
  return useQuery({
    queryKey: hostelKeys.weeklyMenu(tenantId, blockId),
    queryFn: () => hostelApi.getWeeklyMenu(tenantId, blockId),
    enabled: !!tenantId,
  });
}

// === MESS MENU MUTATIONS ===

export function useCreateMessMenu(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMessMenuInput) => hostelApi.createMessMenu(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.menu() });
    },
  });
}

export function useUpdateMessMenu(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMessMenuInput> }) =>
      hostelApi.updateMessMenu(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.menu() });
    },
  });
}

export function useDeleteMessMenu(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hostelApi.deleteMessMenu(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.menu() });
    },
  });
}

// === COMPLAINT QUERIES ===

export function useHostelComplaints(tenantId: string, params?: ComplaintQueryParams) {
  return useQuery({
    queryKey: hostelKeys.complaintList(tenantId, params),
    queryFn: () => hostelApi.listComplaints(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useHostelComplaint(tenantId: string, id: string) {
  return useQuery({
    queryKey: hostelKeys.complaintDetail(tenantId, id),
    queryFn: () => hostelApi.getComplaint(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useStudentHostelComplaints(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: hostelKeys.studentComplaints(tenantId, studentId),
    queryFn: () => hostelApi.getStudentComplaints(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

// === COMPLAINT MUTATIONS ===

export function useCreateComplaint(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateComplaintInput) => hostelApi.createComplaint(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.complaints() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.studentComplaints(tenantId, data.studentId) });
      queryClient.invalidateQueries({ queryKey: hostelKeys.stats(tenantId) });
    },
  });
}

export function useUpdateComplaint(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateComplaintInput> & { status?: string; assignedTo?: string } }) =>
      hostelApi.updateComplaint(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.complaints() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.complaintDetail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: hostelKeys.stats(tenantId) });
    },
  });
}

export function useAddComplaintFeedback(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { feedback: string; rating?: number } }) =>
      hostelApi.addComplaintFeedback(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.complaints() });
      queryClient.invalidateQueries({ queryKey: hostelKeys.complaintDetail(tenantId, id) });
    },
  });
}

// === STATS QUERY ===

export function useHostelStats(tenantId: string) {
  return useQuery({
    queryKey: hostelKeys.stats(tenantId),
    queryFn: () => hostelApi.getStats(tenantId),
    enabled: !!tenantId,
  });
}
