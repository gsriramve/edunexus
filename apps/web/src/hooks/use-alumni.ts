'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
export type CurrentStatus = 'employed' | 'entrepreneur' | 'higher_studies' | 'unemployed' | 'other';
export type MentorshipStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type FocusArea = 'career_guidance' | 'technical' | 'interview_prep' | 'resume_review' | 'higher_studies' | 'entrepreneurship' | 'general';
export type ContributionType = 'monetary' | 'scholarship' | 'equipment' | 'time' | 'guest_lecture' | 'workshop';
export type ContributionStatus = 'pending' | 'approved' | 'received' | 'acknowledged';
export type TestimonialCategory = 'career_success' | 'entrepreneurship' | 'higher_studies' | 'gratitude';
export type EventType = 'reunion' | 'networking' | 'guest_lecture' | 'workshop' | 'homecoming';
export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';

export interface AlumniProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  graduationYear: number;
  batch: string;
  department?: { id: string; name: string; code: string };
  degree?: string;
  finalCgpa?: number;
  currentStatus: CurrentStatus;
  registrationStatus: RegistrationStatus;
  visibleInDirectory: boolean;
  openToMentoring: boolean;
  mentorshipAreas: string[];
  bio?: string;
  achievements?: string;
  employmentHistory?: AlumniEmployment[];
  createdAt: string;
}

export interface AlumniEmployment {
  id: string;
  companyName: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  salaryBand?: string;
  industry?: string;
  companySize?: string;
  description?: string;
  isVerified: boolean;
}

export interface MentorCard {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  graduationYear: number;
  batch: string;
  department?: { name: string };
  currentEmployment?: {
    companyName: string;
    role: string;
  };
  mentorshipAreas: string[];
  bio?: string;
  activeMenteeCount: number;
  averageRating?: number;
}

export interface Mentorship {
  id: string;
  alumniId: string;
  studentId: string;
  focusArea: FocusArea;
  status: MentorshipStatus;
  requestMessage?: string;
  responseMessage?: string;
  startDate?: string;
  endDate?: string;
  meetingsCount: number;
  studentRating?: number;
  studentReview?: string;
  alumniRating?: number;
  alumniReview?: string;
  alumni?: Partial<AlumniProfile>;
  student?: {
    user?: { name: string; email: string };
    department?: { name: string };
  };
  createdAt: string;
}

export interface Contribution {
  id: string;
  alumniId: string;
  contributionType: ContributionType;
  title: string;
  description?: string;
  amount?: number;
  currency: string;
  estimatedValue?: number;
  hoursContributed?: number;
  allocatedTo?: string;
  beneficiaryInfo?: string;
  status: ContributionStatus;
  receivedDate?: string;
  acknowledgedBy?: string;
  isPubliclyAcknowledged: boolean;
  acknowledgementText?: string;
  alumni?: Partial<AlumniProfile>;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  alumniId: string;
  title: string;
  content: string;
  videoUrl?: string;
  imageUrl?: string;
  category: TestimonialCategory;
  isApproved: boolean;
  isFeatured: boolean;
  displayOrder: number;
  alumni?: Partial<AlumniProfile>;
  createdAt: string;
}

export interface AlumniEvent {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  endDate?: string;
  venue?: string;
  isVirtual: boolean;
  meetLink?: string;
  registrationDeadline?: string;
  maxAttendees?: number;
  registrationFee?: number;
  targetBatches: string[];
  targetDepartments: string[];
  status: EventStatus;
  _count?: { attendances: number };
  createdAt: string;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  alumniId: string;
  registeredAt: string;
  attended: boolean;
  attendedAt?: string;
  rating?: number;
  feedback?: string;
  event?: Partial<AlumniEvent>;
  alumni?: Partial<AlumniProfile>;
}

export interface AlumniStats {
  totalAlumni: number;
  approvedCount: number;
  pendingCount: number;
  employedCount: number;
  entrepreneurCount: number;
  higherStudiesCount: number;
  openToMentoringCount: number;
  activeMentorshipsCount: number;
  totalContributions: number;
  totalContributionValue: number;
  byGraduationYear: Record<number, number>;
  byDepartment: { departmentId: string; departmentName: string; count: number }[];
  byCurrentStatus: Record<string, number>;
  topCompanies: { company: string; count: number }[];
  topIndustries: { industry: string; count: number }[];
}

export interface DirectoryFilters {
  batches: string[];
  graduationYears: number[];
  departments: { id: string; name: string }[];
  companies: string[];
  industries: string[];
  mentorshipAreas: string[];
}

// Input types
export interface CreateAlumniProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  graduationYear: number;
  batch: string;
  departmentId?: string;
  degree?: string;
  finalCgpa?: number;
  studentId?: string;
  currentStatus?: CurrentStatus;
  openToMentoring?: boolean;
  mentorshipAreas?: string[];
  bio?: string;
  achievements?: string;
}

export interface UpdateAlumniProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  currentStatus?: CurrentStatus;
  visibleInDirectory?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showEmployment?: boolean;
  openToMentoring?: boolean;
  mentorshipAreas?: string[];
  bio?: string;
  achievements?: string;
}

export interface QueryAlumniParams {
  search?: string;
  departmentId?: string;
  batch?: string;
  graduationYear?: number;
  currentStatus?: CurrentStatus;
  registrationStatus?: RegistrationStatus;
  openToMentoring?: boolean;
  company?: string;
  industry?: string;
  limit?: number;
  offset?: number;
}

export interface CreateEmploymentInput {
  companyName: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  salaryBand?: string;
  industry?: string;
  companySize?: string;
  description?: string;
}

export interface RequestMentorshipInput {
  alumniId: string;
  focusArea: FocusArea;
  requestMessage?: string;
}

export interface RespondMentorshipInput {
  status: MentorshipStatus;
  responseMessage?: string;
}

export interface RateMentorshipInput {
  rating: number;
  review?: string;
}

export interface CreateContributionInput {
  contributionType: ContributionType;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  estimatedValue?: number;
  hoursContributed?: number;
  allocatedTo?: string;
  beneficiaryInfo?: string;
  isPubliclyAcknowledged?: boolean;
}

export interface CreateTestimonialInput {
  title: string;
  content: string;
  videoUrl?: string;
  imageUrl?: string;
  category: TestimonialCategory;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  endDate?: string;
  venue?: string;
  isVirtual?: boolean;
  meetLink?: string;
  registrationDeadline?: string;
  maxAttendees?: number;
  registrationFee?: number;
  targetBatches?: string[];
  targetDepartments?: string[];
  status?: EventStatus;
}

export interface QueryEventsParams {
  eventType?: EventType;
  status?: EventStatus;
  startAfter?: string;
  startBefore?: string;
  isVirtual?: boolean;
  targetBatch?: string;
  targetDepartment?: string;
  upcoming?: boolean;
  limit?: number;
  offset?: number;
}

// ============ API Client ============

async function alumniApi<T>(
  endpoint: string,
  tenantId: string,
  options: { method?: string; body?: any } = {}
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

  const response = await fetch(`${getApiBaseUrl()}/alumni${endpoint}`, {
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

/**
 * File upload API helper for alumni
 */
async function alumniUploadFile<T>(
  endpoint: string,
  tenantId: string,
  formData: FormData,
): Promise<T> {
  const authContext = getAuthContext();

  const headers: Record<string, string> = {
    'x-tenant-id': tenantId,
  };
  // Note: Don't set Content-Type for FormData - browser will set it with boundary

  if (authContext) {
    if (authContext.userId) headers['x-user-id'] = authContext.userId;
    if (authContext.role) headers['x-user-role'] = authContext.role;
    if (authContext.tenantId) headers['x-user-tenant-id'] = authContext.tenantId;
  }

  const response = await fetch(`${getApiBaseUrl()}/alumni${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'File upload failed');
  }

  return response.json();
}

// ============ Query Keys ============

export const alumniKeys = {
  all: ['alumni'] as const,
  profiles: () => [...alumniKeys.all, 'profiles'] as const,
  directory: (tenantId: string, params?: QueryAlumniParams) =>
    [...alumniKeys.profiles(), 'directory', tenantId, params] as const,
  directoryFilters: (tenantId: string) =>
    [...alumniKeys.profiles(), 'filters', tenantId] as const,
  profile: (tenantId: string, id: string) =>
    [...alumniKeys.profiles(), tenantId, id] as const,
  myProfile: (tenantId: string) =>
    [...alumniKeys.profiles(), 'my', tenantId] as const,
  mentors: (tenantId: string, params?: QueryAlumniParams) =>
    [...alumniKeys.profiles(), 'mentors', tenantId, params] as const,
  stats: (tenantId: string) =>
    [...alumniKeys.all, 'stats', tenantId] as const,
  mentorships: () => [...alumniKeys.all, 'mentorships'] as const,
  mentorship: (tenantId: string, id: string) =>
    [...alumniKeys.mentorships(), tenantId, id] as const,
  myMentorshipsStudent: (tenantId: string) =>
    [...alumniKeys.mentorships(), 'my-student', tenantId] as const,
  myMentorshipsAlumni: (tenantId: string) =>
    [...alumniKeys.mentorships(), 'my-alumni', tenantId] as const,
  pendingRequests: (tenantId: string) =>
    [...alumniKeys.mentorships(), 'pending', tenantId] as const,
  mentorStats: (tenantId: string) =>
    [...alumniKeys.mentorships(), 'mentor-stats', tenantId] as const,
  contributions: () => [...alumniKeys.all, 'contributions'] as const,
  contribution: (tenantId: string, id: string) =>
    [...alumniKeys.contributions(), tenantId, id] as const,
  myContributions: (tenantId: string) =>
    [...alumniKeys.contributions(), 'my', tenantId] as const,
  publicContributions: (tenantId: string) =>
    [...alumniKeys.contributions(), 'public', tenantId] as const,
  contributionStats: (tenantId: string) =>
    [...alumniKeys.contributions(), 'stats', tenantId] as const,
  topContributors: (tenantId: string) =>
    [...alumniKeys.contributions(), 'top', tenantId] as const,
  testimonials: () => [...alumniKeys.all, 'testimonials'] as const,
  publicTestimonials: (tenantId: string) =>
    [...alumniKeys.testimonials(), 'public', tenantId] as const,
  events: () => [...alumniKeys.all, 'events'] as const,
  eventList: (tenantId: string, params?: QueryEventsParams) =>
    [...alumniKeys.events(), tenantId, params] as const,
  event: (tenantId: string, id: string) =>
    [...alumniKeys.events(), tenantId, id] as const,
  upcomingEvents: (tenantId: string) =>
    [...alumniKeys.events(), 'upcoming', tenantId] as const,
  myEvents: (tenantId: string) =>
    [...alumniKeys.events(), 'my', tenantId] as const,
  eventAttendees: (tenantId: string, eventId: string) =>
    [...alumniKeys.events(), 'attendees', tenantId, eventId] as const,
  eventStats: (tenantId: string, eventId: string) =>
    [...alumniKeys.events(), 'stats', tenantId, eventId] as const,
};

// ============ Profile Hooks ============

export function useAlumniDirectory(tenantId: string, params?: QueryAlumniParams) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.set('search', params.search);
  if (params?.departmentId) queryParams.set('departmentId', params.departmentId);
  if (params?.batch) queryParams.set('batch', params.batch);
  if (params?.graduationYear) queryParams.set('graduationYear', params.graduationYear.toString());
  if (params?.currentStatus) queryParams.set('currentStatus', params.currentStatus);
  if (params?.openToMentoring !== undefined) queryParams.set('openToMentoring', params.openToMentoring.toString());
  if (params?.company) queryParams.set('company', params.company);
  if (params?.industry) queryParams.set('industry', params.industry);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: alumniKeys.directory(tenantId, params),
    queryFn: () =>
      alumniApi<{ data: AlumniProfile[]; total: number }>(
        `/directory${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useDirectoryFilters(tenantId: string) {
  return useQuery({
    queryKey: alumniKeys.directoryFilters(tenantId),
    queryFn: () => alumniApi<DirectoryFilters>('/directory/filters', tenantId),
    enabled: !!tenantId,
  });
}

export function useAlumniMentors(tenantId: string, params?: QueryAlumniParams) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.set('search', params.search);
  if (params?.departmentId) queryParams.set('departmentId', params.departmentId);
  if (params?.batch) queryParams.set('batch', params.batch);
  if (params?.industry) queryParams.set('industry', params.industry);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: alumniKeys.mentors(tenantId, params),
    queryFn: () =>
      alumniApi<MentorCard[]>(`/mentors${query ? `?${query}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

export function useAlumniProfile(tenantId: string, id: string) {
  return useQuery({
    queryKey: alumniKeys.profile(tenantId, id),
    queryFn: () => alumniApi<AlumniProfile>(`/profiles/${id}`, tenantId),
    enabled: !!tenantId && !!id,
  });
}

export function useMyAlumniProfile(tenantId: string) {
  return useQuery({
    queryKey: alumniKeys.myProfile(tenantId),
    queryFn: () => alumniApi<AlumniProfile>('/my-profile', tenantId),
    enabled: !!tenantId,
  });
}

export function useAlumniStats(tenantId: string) {
  return useQuery({
    queryKey: alumniKeys.stats(tenantId),
    queryFn: () => alumniApi<AlumniStats>('/stats', tenantId),
    enabled: !!tenantId,
  });
}

export function useRegisterAlumni(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAlumniProfileInput) =>
      alumniApi<AlumniProfile>('/register', tenantId, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.profiles() });
    },
  });
}

export function useUpdateMyAlumniProfile(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAlumniProfileInput) =>
      alumniApi<AlumniProfile>('/my-profile', tenantId, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.myProfile(tenantId) });
      queryClient.invalidateQueries({ queryKey: alumniKeys.profiles() });
    },
  });
}

export function useUploadAlumniPhoto(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      alumniUploadFile<{ photoUrl: string }>('/my-profile/photo', tenantId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.myProfile(tenantId) });
      queryClient.invalidateQueries({ queryKey: alumniKeys.profiles() });
    },
  });
}

export function useApproveAlumni(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string; status: RegistrationStatus; rejectionReason?: string }) =>
      alumniApi<AlumniProfile>(`/profiles/${id}/approve`, tenantId, {
        method: 'PUT',
        body: { status, rejectionReason },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.profiles() });
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats(tenantId) });
    },
  });
}

// ============ Employment Hooks ============

export function useAddEmployment(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmploymentInput) =>
      alumniApi<AlumniEmployment>('/my-employment', tenantId, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.myProfile(tenantId) });
    },
  });
}

export function useUpdateEmployment(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEmploymentInput> }) =>
      alumniApi<AlumniEmployment>(`/employment/${id}`, tenantId, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.myProfile(tenantId) });
    },
  });
}

export function useDeleteEmployment(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      alumniApi<void>(`/employment/${id}`, tenantId, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.myProfile(tenantId) });
    },
  });
}

// ============ Mentorship Hooks ============

export function useRequestMentorship(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestMentorshipInput) =>
      alumniApi<Mentorship>('/mentorships/request', tenantId, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.mentorships() });
    },
  });
}

export function useRespondMentorship(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RespondMentorshipInput }) =>
      alumniApi<Mentorship>(`/mentorships/${id}/respond`, tenantId, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.mentorships() });
    },
  });
}

export function useMyMentorshipsAsStudent(tenantId: string) {
  return useQuery({
    queryKey: alumniKeys.myMentorshipsStudent(tenantId),
    queryFn: () => alumniApi<Mentorship[]>('/my-mentorships/student', tenantId),
    enabled: !!tenantId,
  });
}

export function useMyMentorshipsAsAlumni(tenantId: string) {
  return useQuery({
    queryKey: alumniKeys.myMentorshipsAlumni(tenantId),
    queryFn: () => alumniApi<Mentorship[]>('/my-mentorships/alumni', tenantId),
    enabled: !!tenantId,
  });
}

export function usePendingMentorshipRequests(tenantId: string) {
  return useQuery({
    queryKey: alumniKeys.pendingRequests(tenantId),
    queryFn: () => alumniApi<Mentorship[]>('/my-mentorships/pending', tenantId),
    enabled: !!tenantId,
  });
}

export function useLogMeeting(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      alumniApi<Mentorship>(`/mentorships/${id}/meeting`, tenantId, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.mentorships() });
    },
  });
}

export function useRateMentorshipAsStudent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RateMentorshipInput }) =>
      alumniApi<Mentorship>(`/mentorships/${id}/rate/student`, tenantId, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.mentorships() });
    },
  });
}

export function useRateMentorshipAsAlumni(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RateMentorshipInput }) =>
      alumniApi<Mentorship>(`/mentorships/${id}/rate/alumni`, tenantId, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.mentorships() });
    },
  });
}

export function useMyMentorStats(tenantId: string) {
  return useQuery({
    queryKey: alumniKeys.mentorStats(tenantId),
    queryFn: () =>
      alumniApi<{
        totalMentees: number;
        activeMentees: number;
        completedMentorships: number;
        averageRating: number | null;
        totalRatings: number;
      }>('/my-mentor-stats', tenantId),
    enabled: !!tenantId,
  });
}

// ============ Contribution Hooks ============

export function useCreateContribution(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContributionInput) =>
      alumniApi<Contribution>('/my-contributions', tenantId, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.contributions() });
    },
  });
}

export function useMyContributions(tenantId: string) {
  return useQuery({
    queryKey: alumniKeys.myContributions(tenantId),
    queryFn: () => alumniApi<Contribution[]>('/my-contributions', tenantId),
    enabled: !!tenantId,
  });
}

export function usePublicContributions(tenantId: string, limit?: number) {
  return useQuery({
    queryKey: alumniKeys.publicContributions(tenantId),
    queryFn: () =>
      alumniApi<Contribution[]>(`/contributions/public${limit ? `?limit=${limit}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

export function useTopContributors(tenantId: string, limit?: number) {
  return useQuery({
    queryKey: alumniKeys.topContributors(tenantId),
    queryFn: () =>
      alumniApi<{ alumni: Partial<AlumniProfile>; contributionCount: number; totalAmount: number }[]>(
        `/top-contributors${limit ? `?limit=${limit}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useProcessContribution(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, acknowledgementText }: { id: string; status: ContributionStatus; acknowledgementText?: string }) =>
      alumniApi<Contribution>(`/contributions/${id}/process`, tenantId, {
        method: 'PUT',
        body: { status, acknowledgementText },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.contributions() });
    },
  });
}

// ============ Testimonial Hooks ============

export function useCreateTestimonial(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestimonialInput) =>
      alumniApi<Testimonial>('/my-testimonials', tenantId, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.testimonials() });
    },
  });
}

export function usePublicTestimonials(tenantId: string, limit?: number) {
  return useQuery({
    queryKey: alumniKeys.publicTestimonials(tenantId),
    queryFn: () =>
      alumniApi<Testimonial[]>(`/testimonials/public${limit ? `?limit=${limit}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

export function useApproveTestimonial(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isApproved, isFeatured, displayOrder }: { id: string; isApproved: boolean; isFeatured?: boolean; displayOrder?: number }) =>
      alumniApi<Testimonial>(`/testimonials/${id}/approve`, tenantId, {
        method: 'PUT',
        body: { isApproved, isFeatured, displayOrder },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.testimonials() });
    },
  });
}

// ============ Event Hooks ============

export function useAlumniEvents(tenantId: string, params?: QueryEventsParams) {
  const queryParams = new URLSearchParams();
  if (params?.eventType) queryParams.set('eventType', params.eventType);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.startAfter) queryParams.set('startAfter', params.startAfter);
  if (params?.startBefore) queryParams.set('startBefore', params.startBefore);
  if (params?.isVirtual !== undefined) queryParams.set('isVirtual', params.isVirtual.toString());
  if (params?.upcoming) queryParams.set('upcoming', 'true');
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: alumniKeys.eventList(tenantId, params),
    queryFn: () =>
      alumniApi<{ data: AlumniEvent[]; total: number }>(
        `/events${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useAlumniEvent(tenantId: string, id: string) {
  return useQuery({
    queryKey: alumniKeys.event(tenantId, id),
    queryFn: () => alumniApi<AlumniEvent>(`/events/${id}`, tenantId),
    enabled: !!tenantId && !!id,
  });
}

export function useUpcomingAlumniEvents(tenantId: string, limit?: number) {
  return useQuery({
    queryKey: alumniKeys.upcomingEvents(tenantId),
    queryFn: () =>
      alumniApi<AlumniEvent[]>(`/events/upcoming${limit ? `?limit=${limit}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

export function useMyEventRegistrations(tenantId: string) {
  return useQuery({
    queryKey: alumniKeys.myEvents(tenantId),
    queryFn: () => alumniApi<EventAttendance[]>('/my-events', tenantId),
    enabled: !!tenantId,
  });
}

export function useCreateAlumniEvent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventInput) =>
      alumniApi<AlumniEvent>('/events', tenantId, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.events() });
    },
  });
}

export function useUpdateAlumniEvent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventInput> }) =>
      alumniApi<AlumniEvent>(`/events/${id}`, tenantId, { method: 'PUT', body: data }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.event(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: alumniKeys.events() });
    },
  });
}

export function useRegisterForEvent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) =>
      alumniApi<EventAttendance>(`/events/${eventId}/register`, tenantId, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.events() });
      queryClient.invalidateQueries({ queryKey: alumniKeys.myEvents(tenantId) });
    },
  });
}

export function useCancelEventRegistration(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) =>
      alumniApi<void>(`/events/${eventId}/register`, tenantId, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.events() });
      queryClient.invalidateQueries({ queryKey: alumniKeys.myEvents(tenantId) });
    },
  });
}

export function useSubmitEventFeedback(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, rating, feedback }: { eventId: string; rating: number; feedback?: string }) =>
      alumniApi<EventAttendance>(`/events/${eventId}/feedback`, tenantId, {
        method: 'POST',
        body: { rating, feedback },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.myEvents(tenantId) });
    },
  });
}

export function usePublishEvent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      alumniApi<AlumniEvent>(`/events/${id}/publish`, tenantId, { method: 'PUT' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.event(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: alumniKeys.events() });
    },
  });
}

export function useCancelAlumniEvent(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      alumniApi<AlumniEvent>(`/events/${id}/cancel`, tenantId, { method: 'PUT' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.event(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: alumniKeys.events() });
    },
  });
}
