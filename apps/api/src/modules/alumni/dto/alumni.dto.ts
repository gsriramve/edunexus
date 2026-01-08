import {
  IsString,
  IsOptional,
  IsEmail,
  IsInt,
  IsBoolean,
  IsArray,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';

// ============ ENUMS ============

export enum RegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum CurrentStatus {
  EMPLOYED = 'employed',
  ENTREPRENEUR = 'entrepreneur',
  HIGHER_STUDIES = 'higher_studies',
  UNEMPLOYED = 'unemployed',
  OTHER = 'other',
}

export enum MentorshipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum FocusArea {
  CAREER_GUIDANCE = 'career_guidance',
  TECHNICAL = 'technical',
  INTERVIEW_PREP = 'interview_prep',
  RESUME_REVIEW = 'resume_review',
  HIGHER_STUDIES = 'higher_studies',
  ENTREPRENEURSHIP = 'entrepreneurship',
  GENERAL = 'general',
}

export enum ContributionType {
  MONETARY = 'monetary',
  SCHOLARSHIP = 'scholarship',
  EQUIPMENT = 'equipment',
  TIME = 'time',
  GUEST_LECTURE = 'guest_lecture',
  WORKSHOP = 'workshop',
}

export enum ContributionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  RECEIVED = 'received',
  ACKNOWLEDGED = 'acknowledged',
}

export enum TestimonialCategory {
  CAREER_SUCCESS = 'career_success',
  ENTREPRENEURSHIP = 'entrepreneurship',
  HIGHER_STUDIES = 'higher_studies',
  GRATITUDE = 'gratitude',
}

export enum EventType {
  REUNION = 'reunion',
  NETWORKING = 'networking',
  GUEST_LECTURE = 'guest_lecture',
  WORKSHOP = 'workshop',
  HOMECOMING = 'homecoming',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum CompanySize {
  STARTUP = 'startup',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise',
}

// ============ ALUMNI PROFILE DTOs ============

export class CreateAlumniProfileDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl()
  twitterUrl?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsInt()
  graduationYear: number;

  @IsString()
  batch: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsNumber()
  finalCgpa?: number;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsEnum(CurrentStatus)
  currentStatus?: CurrentStatus;

  @IsOptional()
  @IsBoolean()
  openToMentoring?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentorshipAreas?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  achievements?: string;
}

export class UpdateAlumniProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl()
  twitterUrl?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsEnum(CurrentStatus)
  currentStatus?: CurrentStatus;

  @IsOptional()
  @IsBoolean()
  visibleInDirectory?: boolean;

  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @IsOptional()
  @IsBoolean()
  showEmployment?: boolean;

  @IsOptional()
  @IsBoolean()
  openToMentoring?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentorshipAreas?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  achievements?: string;
}

export class ApproveAlumniDto {
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class QueryAlumniDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  batch?: string;

  @IsOptional()
  @IsInt()
  graduationYear?: number;

  @IsOptional()
  @IsEnum(CurrentStatus)
  currentStatus?: CurrentStatus;

  @IsOptional()
  @IsEnum(RegistrationStatus)
  registrationStatus?: RegistrationStatus;

  @IsOptional()
  @IsBoolean()
  openToMentoring?: boolean;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

// ============ EMPLOYMENT DTOs ============

export class CreateEmploymentDto {
  @IsString()
  @MinLength(1)
  companyName: string;

  @IsString()
  @MinLength(1)
  role: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  salaryBand?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class UpdateEmploymentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  role?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  salaryBand?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

// ============ MENTORSHIP DTOs ============

export class RequestMentorshipDto {
  @IsString()
  alumniId: string;

  @IsEnum(FocusArea)
  focusArea: FocusArea;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  requestMessage?: string;
}

export class RespondMentorshipDto {
  @IsEnum(MentorshipStatus)
  status: MentorshipStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  responseMessage?: string;
}

export class UpdateMentorshipDto {
  @IsOptional()
  @IsEnum(MentorshipStatus)
  status?: MentorshipStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  meetingsCount?: number;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class RateMentorshipDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  review?: string;
}

export class QueryMentorshipsDto {
  @IsOptional()
  @IsString()
  alumniId?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsEnum(MentorshipStatus)
  status?: MentorshipStatus;

  @IsOptional()
  @IsEnum(FocusArea)
  focusArea?: FocusArea;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

// ============ CONTRIBUTION DTOs ============

export class CreateContributionDto {
  @IsEnum(ContributionType)
  contributionType: ContributionType;

  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  hoursContributed?: number;

  @IsOptional()
  @IsString()
  allocatedTo?: string;

  @IsOptional()
  @IsString()
  beneficiaryInfo?: string;

  @IsOptional()
  @IsBoolean()
  isPubliclyAcknowledged?: boolean;
}

export class UpdateContributionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  allocatedTo?: string;

  @IsOptional()
  @IsString()
  beneficiaryInfo?: string;

  @IsOptional()
  @IsBoolean()
  isPubliclyAcknowledged?: boolean;
}

export class ProcessContributionDto {
  @IsEnum(ContributionStatus)
  status: ContributionStatus;

  @IsOptional()
  @IsString()
  acknowledgementText?: string;
}

export class QueryContributionsDto {
  @IsOptional()
  @IsString()
  alumniId?: string;

  @IsOptional()
  @IsEnum(ContributionType)
  contributionType?: ContributionType;

  @IsOptional()
  @IsEnum(ContributionStatus)
  status?: ContributionStatus;

  @IsOptional()
  @IsString()
  allocatedTo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

// ============ TESTIMONIAL DTOs ============

export class CreateTestimonialDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(50)
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsEnum(TestimonialCategory)
  category: TestimonialCategory;
}

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(50)
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(TestimonialCategory)
  category?: TestimonialCategory;
}

export class ApproveTestimonialDto {
  @IsBoolean()
  isApproved: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class QueryTestimonialsDto {
  @IsOptional()
  @IsString()
  alumniId?: string;

  @IsOptional()
  @IsEnum(TestimonialCategory)
  category?: TestimonialCategory;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

// ============ EVENT DTOs ============

export class CreateEventDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsBoolean()
  isVirtual?: boolean;

  @IsOptional()
  @IsUrl()
  meetLink?: string;

  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttendees?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  registrationFee?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetBatches?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetDepartments?: string[];

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsBoolean()
  isVirtual?: boolean;

  @IsOptional()
  @IsUrl()
  meetLink?: string;

  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttendees?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  registrationFee?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetBatches?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetDepartments?: string[];

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

export class QueryEventsDto {
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsDateString()
  startAfter?: string;

  @IsOptional()
  @IsDateString()
  startBefore?: string;

  @IsOptional()
  @IsBoolean()
  isVirtual?: boolean;

  @IsOptional()
  @IsString()
  targetBatch?: string;

  @IsOptional()
  @IsString()
  targetDepartment?: string;

  @IsOptional()
  @IsBoolean()
  upcoming?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

export class RegisterEventDto {
  @IsString()
  eventId: string;
}

export class EventFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  feedback?: string;
}

export class MarkAttendanceDto {
  @IsArray()
  @IsString({ each: true })
  alumniIds: string[];

  @IsBoolean()
  attended: boolean;
}

// ============ STATS DTOs ============

export class AlumniStatsDto {
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

export class AlumniDirectoryFiltersDto {
  batches: string[];
  graduationYears: number[];
  departments: { id: string; name: string }[];
  companies: string[];
  industries: string[];
  mentorshipAreas: string[];
}

// ============ RESPONSE DTOs ============

export class AlumniProfileResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email?: string; // Only if showEmail is true or admin
  phone?: string; // Only if showPhone is true or admin
  photoUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  graduationYear: number;
  batch: string;
  department?: { id: string; name: string; code: string };
  degree?: string;
  finalCgpa?: number;
  currentStatus: string;
  visibleInDirectory: boolean;
  openToMentoring: boolean;
  mentorshipAreas: string[];
  bio?: string;
  achievements?: string;
  registrationStatus: string;
  currentEmployment?: {
    companyName: string;
    role: string;
    location?: string;
    industry?: string;
  };
  createdAt: string;
}

export class MentorCardDto {
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
