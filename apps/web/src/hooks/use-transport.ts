'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  transportApi,
  type TransportRoute,
  type TransportStop,
  type TransportVehicle,
  type TransportPass,
  type TransportTracking,
  type TransportStats,
  type RouteQueryParams,
  type VehicleQueryParams,
  type PassQueryParams,
  type CreateRouteInput,
  type UpdateRouteInput,
  type CreateStopInput,
  type CreateVehicleInput,
  type CreatePassInput,
} from '@/lib/api';

// Query keys
export const transportKeys = {
  all: ['transport'] as const,
  // Routes
  routes: () => [...transportKeys.all, 'routes'] as const,
  routeList: (tenantId: string, params?: RouteQueryParams) => [...transportKeys.routes(), 'list', tenantId, params] as const,
  routeDetail: (tenantId: string, id: string) => [...transportKeys.routes(), 'detail', tenantId, id] as const,
  routeStops: (tenantId: string, routeId: string) => [...transportKeys.routes(), 'stops', tenantId, routeId] as const,
  // Vehicles
  vehicles: () => [...transportKeys.all, 'vehicles'] as const,
  vehicleList: (tenantId: string, params?: VehicleQueryParams) => [...transportKeys.vehicles(), 'list', tenantId, params] as const,
  vehicleDetail: (tenantId: string, id: string) => [...transportKeys.vehicles(), 'detail', tenantId, id] as const,
  vehicleLocations: (tenantId: string) => [...transportKeys.vehicles(), 'locations', tenantId] as const,
  // Passes
  passes: () => [...transportKeys.all, 'passes'] as const,
  passList: (tenantId: string, params?: PassQueryParams) => [...transportKeys.passes(), 'list', tenantId, params] as const,
  passDetail: (tenantId: string, id: string) => [...transportKeys.passes(), 'detail', tenantId, id] as const,
  studentPass: (tenantId: string, studentId: string) => [...transportKeys.passes(), 'student', tenantId, studentId] as const,
  // Tracking
  tracking: () => [...transportKeys.all, 'tracking'] as const,
  latestTracking: (tenantId: string, vehicleId: string) => [...transportKeys.tracking(), 'latest', tenantId, vehicleId] as const,
  trackingHistory: (tenantId: string, vehicleId: string) => [...transportKeys.tracking(), 'history', tenantId, vehicleId] as const,
  // Stats
  stats: (tenantId: string) => [...transportKeys.all, 'stats', tenantId] as const,
};

// === ROUTE QUERIES ===

export function useRoutes(tenantId: string, params?: RouteQueryParams) {
  return useQuery({
    queryKey: transportKeys.routeList(tenantId, params),
    queryFn: () => transportApi.listRoutes(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useRoute(tenantId: string, id: string) {
  return useQuery({
    queryKey: transportKeys.routeDetail(tenantId, id),
    queryFn: () => transportApi.getRoute(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useRouteStops(tenantId: string, routeId: string) {
  return useQuery({
    queryKey: transportKeys.routeStops(tenantId, routeId),
    queryFn: () => transportApi.getRouteStops(tenantId, routeId),
    enabled: !!tenantId && !!routeId,
  });
}

// === ROUTE MUTATIONS ===

export function useCreateRoute(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRouteInput) => transportApi.createRoute(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.stats(tenantId) });
    },
  });
}

export function useUpdateRoute(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRouteInput }) =>
      transportApi.updateRoute(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.routeDetail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: transportKeys.stats(tenantId) });
    },
  });
}

export function useDeleteRoute(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transportApi.deleteRoute(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.stats(tenantId) });
    },
  });
}

// === STOP MUTATIONS ===

export function useCreateStop(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStopInput) => transportApi.createStop(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routeStops(tenantId, data.routeId) });
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
}

export function useBulkCreateStops(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routeId, stops }: { routeId: string; stops: Omit<CreateStopInput, 'routeId'>[] }) =>
      transportApi.bulkCreateStops(tenantId, routeId, stops),
    onSuccess: (_, { routeId }) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routeStops(tenantId, routeId) });
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
}

export function useUpdateStop(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateStopInput> }) =>
      transportApi.updateStop(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
}

export function useDeleteStop(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transportApi.deleteStop(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
}

// === VEHICLE QUERIES ===

export function useVehicles(tenantId: string, params?: VehicleQueryParams) {
  return useQuery({
    queryKey: transportKeys.vehicleList(tenantId, params),
    queryFn: () => transportApi.listVehicles(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useVehicle(tenantId: string, id: string) {
  return useQuery({
    queryKey: transportKeys.vehicleDetail(tenantId, id),
    queryFn: () => transportApi.getVehicle(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useVehicleLocations(tenantId: string) {
  return useQuery({
    queryKey: transportKeys.vehicleLocations(tenantId),
    queryFn: () => transportApi.getAllVehicleLocations(tenantId),
    enabled: !!tenantId,
    refetchInterval: 30000, // Refetch every 30 seconds for live tracking
  });
}

// === VEHICLE MUTATIONS ===

export function useCreateVehicle(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleInput) => transportApi.createVehicle(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.vehicles() });
      queryClient.invalidateQueries({ queryKey: transportKeys.stats(tenantId) });
    },
  });
}

export function useUpdateVehicle(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVehicleInput> }) =>
      transportApi.updateVehicle(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.vehicles() });
      queryClient.invalidateQueries({ queryKey: transportKeys.vehicleDetail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: transportKeys.stats(tenantId) });
    },
  });
}

export function useDeleteVehicle(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transportApi.deleteVehicle(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.vehicles() });
      queryClient.invalidateQueries({ queryKey: transportKeys.stats(tenantId) });
    },
  });
}

// === PASS QUERIES ===

export function usePasses(tenantId: string, params?: PassQueryParams) {
  return useQuery({
    queryKey: transportKeys.passList(tenantId, params),
    queryFn: () => transportApi.listPasses(tenantId, params),
    enabled: !!tenantId,
  });
}

export function usePass(tenantId: string, id: string) {
  return useQuery({
    queryKey: transportKeys.passDetail(tenantId, id),
    queryFn: () => transportApi.getPass(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useStudentPass(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: transportKeys.studentPass(tenantId, studentId),
    queryFn: () => transportApi.getStudentPass(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

// === PASS MUTATIONS ===

export function useCreatePass(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePassInput) => transportApi.createPass(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.passes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.studentPass(tenantId, data.studentId) });
      queryClient.invalidateQueries({ queryKey: transportKeys.stats(tenantId) });
    },
  });
}

export function useUpdatePass(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePassInput> }) =>
      transportApi.updatePass(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.passes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.passDetail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: transportKeys.stats(tenantId) });
    },
  });
}

export function useCancelPass(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transportApi.cancelPass(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.passes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.stats(tenantId) });
    },
  });
}

// === TRACKING QUERIES ===

export function useLatestTracking(tenantId: string, vehicleId: string) {
  return useQuery({
    queryKey: transportKeys.latestTracking(tenantId, vehicleId),
    queryFn: () => transportApi.getLatestTracking(tenantId, vehicleId),
    enabled: !!tenantId && !!vehicleId,
    refetchInterval: 10000, // Refetch every 10 seconds for live tracking
  });
}

export function useTrackingHistory(tenantId: string, vehicleId: string, params?: { from?: string; to?: string; limit?: number }) {
  return useQuery({
    queryKey: transportKeys.trackingHistory(tenantId, vehicleId),
    queryFn: () => transportApi.getTrackingHistory(tenantId, vehicleId, params),
    enabled: !!tenantId && !!vehicleId,
  });
}

// === TRACKING MUTATIONS ===

export function useCreateTracking(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { vehicleId: string; latitude: number; longitude: number; speed?: number; heading?: number }) =>
      transportApi.createTracking(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.latestTracking(tenantId, data.vehicleId) });
      queryClient.invalidateQueries({ queryKey: transportKeys.vehicleLocations(tenantId) });
    },
  });
}

// === STATS QUERY ===

export function useTransportStats(tenantId: string) {
  return useQuery({
    queryKey: transportKeys.stats(tenantId),
    queryFn: () => transportApi.getStats(tenantId),
    enabled: !!tenantId,
  });
}
