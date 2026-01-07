'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  sportsClubsApi,
  type SportsTeam,
  type TeamMember,
  type Club,
  type ClubMember,
  type SportsEvent,
  type ClubEvent,
  type EventRegistration,
  type Achievement,
  type ActivityCredit,
  type SportsClubsStats,
  type StudentActivitiesResponse,
  type TeamQueryParams,
  type ClubQueryParams,
  type SportsEventQueryParams,
  type ClubEventQueryParams,
  type AchievementQueryParams,
  type ActivityCreditQueryParams,
  type CreateTeamInput,
  type CreateClubInput,
  type CreateSportsEventInput,
  type CreateClubEventInput,
  type CreateAchievementInput,
  type CreateActivityCreditInput,
  type AddTeamMemberInput,
  type AddClubMemberInput,
  type RegisterForEventInput,
  type UpdateRegistrationInput,
} from '@/lib/api';

// Query keys
export const sportsClubsKeys = {
  all: ['sports-clubs'] as const,
  // Teams
  teams: () => [...sportsClubsKeys.all, 'teams'] as const,
  teamList: (tenantId: string, params?: TeamQueryParams) => [...sportsClubsKeys.teams(), 'list', tenantId, params] as const,
  teamDetail: (tenantId: string, id: string) => [...sportsClubsKeys.teams(), 'detail', tenantId, id] as const,
  teamMembers: (tenantId: string, teamId: string) => [...sportsClubsKeys.teams(), 'members', tenantId, teamId] as const,
  // Clubs
  clubs: () => [...sportsClubsKeys.all, 'clubs'] as const,
  clubList: (tenantId: string, params?: ClubQueryParams) => [...sportsClubsKeys.clubs(), 'list', tenantId, params] as const,
  clubDetail: (tenantId: string, id: string) => [...sportsClubsKeys.clubs(), 'detail', tenantId, id] as const,
  clubMembers: (tenantId: string, clubId: string) => [...sportsClubsKeys.clubs(), 'members', tenantId, clubId] as const,
  // Sports Events
  sportsEvents: () => [...sportsClubsKeys.all, 'sports-events'] as const,
  sportsEventList: (tenantId: string, params?: SportsEventQueryParams) => [...sportsClubsKeys.sportsEvents(), 'list', tenantId, params] as const,
  sportsEventDetail: (tenantId: string, id: string) => [...sportsClubsKeys.sportsEvents(), 'detail', tenantId, id] as const,
  // Club Events
  clubEvents: () => [...sportsClubsKeys.all, 'club-events'] as const,
  clubEventList: (tenantId: string, params?: ClubEventQueryParams) => [...sportsClubsKeys.clubEvents(), 'list', tenantId, params] as const,
  clubEventDetail: (tenantId: string, id: string) => [...sportsClubsKeys.clubEvents(), 'detail', tenantId, id] as const,
  // Registrations
  registrations: () => [...sportsClubsKeys.all, 'registrations'] as const,
  studentRegistrations: (tenantId: string, studentId: string) => [...sportsClubsKeys.registrations(), 'student', tenantId, studentId] as const,
  // Achievements
  achievements: () => [...sportsClubsKeys.all, 'achievements'] as const,
  achievementList: (tenantId: string, params?: AchievementQueryParams) => [...sportsClubsKeys.achievements(), 'list', tenantId, params] as const,
  achievementDetail: (tenantId: string, id: string) => [...sportsClubsKeys.achievements(), 'detail', tenantId, id] as const,
  // Activity Credits
  activityCredits: () => [...sportsClubsKeys.all, 'activity-credits'] as const,
  activityCreditList: (tenantId: string, params?: ActivityCreditQueryParams) => [...sportsClubsKeys.activityCredits(), 'list', tenantId, params] as const,
  studentCreditsSummary: (tenantId: string, studentId: string, academicYear?: string) => [...sportsClubsKeys.activityCredits(), 'summary', tenantId, studentId, academicYear] as const,
  // Stats
  stats: (tenantId: string) => [...sportsClubsKeys.all, 'stats', tenantId] as const,
  // Student Activities
  studentActivities: (tenantId: string, studentId: string) => [...sportsClubsKeys.all, 'student-activities', tenantId, studentId] as const,
};

// =============================================================================
// SPORTS TEAMS QUERIES
// =============================================================================

export function useSportsTeams(tenantId: string, params?: TeamQueryParams) {
  return useQuery({
    queryKey: sportsClubsKeys.teamList(tenantId, params),
    queryFn: () => sportsClubsApi.listTeams(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useSportsTeam(tenantId: string, id: string) {
  return useQuery({
    queryKey: sportsClubsKeys.teamDetail(tenantId, id),
    queryFn: () => sportsClubsApi.getTeam(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useTeamMembers(tenantId: string, teamId: string) {
  return useQuery({
    queryKey: sportsClubsKeys.teamMembers(tenantId, teamId),
    queryFn: () => sportsClubsApi.getTeamMembers(tenantId, teamId),
    enabled: !!tenantId && !!teamId,
  });
}

// =============================================================================
// SPORTS TEAMS MUTATIONS
// =============================================================================

export function useCreateTeam(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamInput) => sportsClubsApi.createTeam(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.teams() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

export function useUpdateTeam(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTeamInput> }) =>
      sportsClubsApi.updateTeam(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.teams() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.teamDetail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

export function useDeleteTeam(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sportsClubsApi.deleteTeam(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.teams() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

// =============================================================================
// TEAM MEMBERS MUTATIONS
// =============================================================================

export function useAddTeamMember(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddTeamMemberInput) => sportsClubsApi.addTeamMember(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.teamMembers(tenantId, data.teamId) });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.teamDetail(tenantId, data.teamId) });
    },
  });
}

export function useUpdateTeamMember(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddTeamMemberInput> }) =>
      sportsClubsApi.updateTeamMember(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.teams() });
    },
  });
}

export function useRemoveTeamMember(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sportsClubsApi.removeTeamMember(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.teams() });
    },
  });
}

// =============================================================================
// CLUBS QUERIES
// =============================================================================

export function useClubs(tenantId: string, params?: ClubQueryParams) {
  return useQuery({
    queryKey: sportsClubsKeys.clubList(tenantId, params),
    queryFn: () => sportsClubsApi.listClubs(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useClub(tenantId: string, id: string) {
  return useQuery({
    queryKey: sportsClubsKeys.clubDetail(tenantId, id),
    queryFn: () => sportsClubsApi.getClub(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useClubMembers(tenantId: string, clubId: string) {
  return useQuery({
    queryKey: sportsClubsKeys.clubMembers(tenantId, clubId),
    queryFn: () => sportsClubsApi.getClubMembers(tenantId, clubId),
    enabled: !!tenantId && !!clubId,
  });
}

// =============================================================================
// CLUBS MUTATIONS
// =============================================================================

export function useCreateClub(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClubInput) => sportsClubsApi.createClub(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubs() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

export function useUpdateClub(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClubInput> }) =>
      sportsClubsApi.updateClub(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubs() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubDetail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

export function useDeleteClub(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sportsClubsApi.deleteClub(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubs() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

// =============================================================================
// CLUB MEMBERS MUTATIONS
// =============================================================================

export function useAddClubMember(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddClubMemberInput) => sportsClubsApi.addClubMember(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubMembers(tenantId, data.clubId) });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubDetail(tenantId, data.clubId) });
    },
  });
}

export function useUpdateClubMember(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddClubMemberInput> }) =>
      sportsClubsApi.updateClubMember(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubs() });
    },
  });
}

export function useRemoveClubMember(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sportsClubsApi.removeClubMember(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubs() });
    },
  });
}

// =============================================================================
// SPORTS EVENTS QUERIES
// =============================================================================

export function useSportsEvents(tenantId: string, params?: SportsEventQueryParams) {
  return useQuery({
    queryKey: sportsClubsKeys.sportsEventList(tenantId, params),
    queryFn: () => sportsClubsApi.listSportsEvents(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useSportsEvent(tenantId: string, id: string) {
  return useQuery({
    queryKey: sportsClubsKeys.sportsEventDetail(tenantId, id),
    queryFn: () => sportsClubsApi.getSportsEvent(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

// =============================================================================
// SPORTS EVENTS MUTATIONS
// =============================================================================

export function useCreateSportsEvent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSportsEventInput) => sportsClubsApi.createSportsEvent(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.sportsEvents() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

export function useUpdateSportsEvent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSportsEventInput> & { homeScore?: string; awayScore?: string; result?: string; status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed' } }) =>
      sportsClubsApi.updateSportsEvent(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.sportsEvents() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.sportsEventDetail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

export function useDeleteSportsEvent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sportsClubsApi.deleteSportsEvent(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.sportsEvents() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

// =============================================================================
// CLUB EVENTS QUERIES
// =============================================================================

export function useClubEvents(tenantId: string, params?: ClubEventQueryParams) {
  return useQuery({
    queryKey: sportsClubsKeys.clubEventList(tenantId, params),
    queryFn: () => sportsClubsApi.listClubEvents(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useClubEvent(tenantId: string, id: string) {
  return useQuery({
    queryKey: sportsClubsKeys.clubEventDetail(tenantId, id),
    queryFn: () => sportsClubsApi.getClubEvent(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

// =============================================================================
// CLUB EVENTS MUTATIONS
// =============================================================================

export function useCreateClubEvent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClubEventInput) => sportsClubsApi.createClubEvent(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubEvents() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

export function useUpdateClubEvent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClubEventInput> & { status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed' } }) =>
      sportsClubsApi.updateClubEvent(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubEvents() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubEventDetail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

export function useDeleteClubEvent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sportsClubsApi.deleteClubEvent(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubEvents() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

// =============================================================================
// EVENT REGISTRATIONS
// =============================================================================

export function useStudentEventRegistrations(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: sportsClubsKeys.studentRegistrations(tenantId, studentId),
    queryFn: () => sportsClubsApi.getStudentRegistrations(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

export function useRegisterForEvent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterForEventInput) => sportsClubsApi.registerForEvent(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.studentRegistrations(tenantId, data.studentId) });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.sportsEvents() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubEvents() });
    },
  });
}

export function useUpdateEventRegistration(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRegistrationInput }) =>
      sportsClubsApi.updateRegistration(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.registrations() });
    },
  });
}

export function useCancelEventRegistration(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sportsClubsApi.cancelRegistration(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.registrations() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.sportsEvents() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.clubEvents() });
    },
  });
}

// =============================================================================
// ACHIEVEMENTS QUERIES
// =============================================================================

export function useAchievements(tenantId: string, params?: AchievementQueryParams) {
  return useQuery({
    queryKey: sportsClubsKeys.achievementList(tenantId, params),
    queryFn: () => sportsClubsApi.listAchievements(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useAchievement(tenantId: string, id: string) {
  return useQuery({
    queryKey: sportsClubsKeys.achievementDetail(tenantId, id),
    queryFn: () => sportsClubsApi.getAchievement(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

// =============================================================================
// ACHIEVEMENTS MUTATIONS
// =============================================================================

export function useCreateAchievement(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAchievementInput) => sportsClubsApi.createAchievement(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.achievements() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.studentActivities(tenantId, data.studentId) });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

export function useUpdateAchievement(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAchievementInput> }) =>
      sportsClubsApi.updateAchievement(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.achievements() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.achievementDetail(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

export function useDeleteAchievement(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sportsClubsApi.deleteAchievement(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.achievements() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.stats(tenantId) });
    },
  });
}

export function useVerifyAchievement(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, verifiedBy }: { id: string; verifiedBy: string }) =>
      sportsClubsApi.verifyAchievement(tenantId, id, verifiedBy),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.achievements() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.achievementDetail(tenantId, id) });
    },
  });
}

// =============================================================================
// ACTIVITY CREDITS QUERIES
// =============================================================================

export function useActivityCredits(tenantId: string, params?: ActivityCreditQueryParams) {
  return useQuery({
    queryKey: sportsClubsKeys.activityCreditList(tenantId, params),
    queryFn: () => sportsClubsApi.listActivityCredits(tenantId, params),
    enabled: !!tenantId,
  });
}

export function useStudentCreditsSummary(tenantId: string, studentId: string, academicYear?: string) {
  return useQuery({
    queryKey: sportsClubsKeys.studentCreditsSummary(tenantId, studentId, academicYear),
    queryFn: () => sportsClubsApi.getStudentCreditsSummary(tenantId, studentId, academicYear),
    enabled: !!tenantId && !!studentId,
  });
}

// =============================================================================
// ACTIVITY CREDITS MUTATIONS
// =============================================================================

export function useCreateActivityCredit(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityCreditInput) => sportsClubsApi.createActivityCredit(tenantId, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.activityCredits() });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.studentCreditsSummary(tenantId, data.studentId) });
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.studentActivities(tenantId, data.studentId) });
    },
  });
}

export function useDeleteActivityCredit(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sportsClubsApi.deleteActivityCredit(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsClubsKeys.activityCredits() });
    },
  });
}

// =============================================================================
// STATS & STUDENT ACTIVITIES
// =============================================================================

export function useSportsClubsStats(tenantId: string) {
  return useQuery({
    queryKey: sportsClubsKeys.stats(tenantId),
    queryFn: () => sportsClubsApi.getStats(tenantId),
    enabled: !!tenantId,
  });
}

export function useStudentActivities(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: sportsClubsKeys.studentActivities(tenantId, studentId),
    queryFn: () => sportsClubsApi.getStudentActivities(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}
