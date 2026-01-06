import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsInt,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

// =============================================================================
// ENUMS
// =============================================================================

export enum SportType {
  CRICKET = 'cricket',
  FOOTBALL = 'football',
  BASKETBALL = 'basketball',
  VOLLEYBALL = 'volleyball',
  BADMINTON = 'badminton',
  TABLE_TENNIS = 'table_tennis',
  TENNIS = 'tennis',
  ATHLETICS = 'athletics',
  SWIMMING = 'swimming',
  CHESS = 'chess',
  KABADDI = 'kabaddi',
  HOCKEY = 'hockey',
  OTHER = 'other',
}

export enum TeamCategory {
  MEN = 'men',
  WOMEN = 'women',
  MIXED = 'mixed',
}

export enum TeamMemberRole {
  CAPTAIN = 'captain',
  VICE_CAPTAIN = 'vice-captain',
  MEMBER = 'member',
}

export enum ClubCategory {
  TECHNICAL = 'technical',
  CULTURAL = 'cultural',
  LITERARY = 'literary',
  SOCIAL = 'social',
  HOBBY = 'hobby',
}

export enum ClubMemberRole {
  PRESIDENT = 'president',
  VICE_PRESIDENT = 'vice-president',
  SECRETARY = 'secretary',
  TREASURER = 'treasurer',
  MEMBER = 'member',
}

export enum SportsEventType {
  MATCH = 'match',
  TOURNAMENT = 'tournament',
  PRACTICE = 'practice',
  TRAINING = 'training',
  TRIALS = 'trials',
}

export enum ClubEventType {
  WORKSHOP = 'workshop',
  COMPETITION = 'competition',
  MEETUP = 'meetup',
  SEMINAR = 'seminar',
  HACKATHON = 'hackathon',
  CULTURAL = 'cultural',
}

export enum EventLevel {
  COLLEGE = 'college',
  INTER_COLLEGE = 'inter-college',
  STATE = 'state',
  NATIONAL = 'national',
  INTERNATIONAL = 'international',
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
}

export enum AchievementType {
  MEDAL = 'medal',
  TROPHY = 'trophy',
  CERTIFICATE = 'certificate',
  AWARD = 'award',
  RECOGNITION = 'recognition',
}

export enum AchievementCategory {
  SPORTS = 'sports',
  ACADEMIC = 'academic',
  CULTURAL = 'cultural',
  TECHNICAL = 'technical',
  SOCIAL = 'social',
}

export enum ActivityCategory {
  SPORTS = 'sports',
  CULTURAL = 'cultural',
  TECHNICAL = 'technical',
  SOCIAL = 'social',
  NCC = 'ncc',
  NSS = 'nss',
}

// =============================================================================
// SPORTS TEAM DTOs
// =============================================================================

export class CreateTeamDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEnum(SportType)
  sport: SportType;

  @IsEnum(TeamCategory)
  @IsOptional()
  category?: TeamCategory;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  coachId?: string;

  @IsString()
  @IsOptional()
  captainId?: string;

  @IsNumber()
  @IsOptional()
  @Min(5)
  @Max(50)
  maxMembers?: number;

  @IsNumber()
  @IsOptional()
  @Min(1900)
  @Max(2030)
  foundedYear?: number;
}

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  coachId?: string;

  @IsString()
  @IsOptional()
  captainId?: string;

  @IsNumber()
  @IsOptional()
  @Min(5)
  @Max(50)
  maxMembers?: number;

  @IsString()
  @IsOptional()
  status?: string;
}

export class TeamQueryDto {
  @IsOptional()
  search?: string;

  @IsEnum(SportType)
  @IsOptional()
  sport?: SportType;

  @IsEnum(TeamCategory)
  @IsOptional()
  category?: TeamCategory;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// TEAM MEMBER DTOs
// =============================================================================

export class AddTeamMemberDto {
  @IsString()
  teamId: string;

  @IsString()
  studentId: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(99)
  jerseyNo?: number;

  @IsEnum(TeamMemberRole)
  @IsOptional()
  role?: TeamMemberRole;
}

export class UpdateTeamMemberDto {
  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(99)
  jerseyNo?: number;

  @IsEnum(TeamMemberRole)
  @IsOptional()
  role?: TeamMemberRole;

  @IsString()
  @IsOptional()
  status?: string;
}

// =============================================================================
// CLUB DTOs
// =============================================================================

export class CreateClubDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @IsEnum(ClubCategory)
  category: ClubCategory;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  advisorId?: string;

  @IsString()
  @IsOptional()
  presidentId?: string;

  @IsNumber()
  @IsOptional()
  @Min(10)
  @Max(500)
  maxMembers?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  meetingSchedule?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  roomNo?: string;

  @IsNumber()
  @IsOptional()
  @Min(1900)
  @Max(2030)
  foundedYear?: number;

  @IsString()
  @IsOptional()
  website?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, string>;
}

export class UpdateClubDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  advisorId?: string;

  @IsString()
  @IsOptional()
  presidentId?: string;

  @IsNumber()
  @IsOptional()
  @Min(10)
  @Max(500)
  maxMembers?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  meetingSchedule?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  roomNo?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, string>;

  @IsString()
  @IsOptional()
  status?: string;
}

export class ClubQueryDto {
  @IsOptional()
  search?: string;

  @IsEnum(ClubCategory)
  @IsOptional()
  category?: ClubCategory;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// CLUB MEMBER DTOs
// =============================================================================

export class AddClubMemberDto {
  @IsString()
  clubId: string;

  @IsString()
  studentId: string;

  @IsEnum(ClubMemberRole)
  @IsOptional()
  role?: ClubMemberRole;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  designation?: string;
}

export class UpdateClubMemberDto {
  @IsEnum(ClubMemberRole)
  @IsOptional()
  role?: ClubMemberRole;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  designation?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

// =============================================================================
// SPORTS EVENT DTOs
// =============================================================================

export class CreateSportsEventDto {
  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsEnum(SportsEventType)
  type: SportsEventType;

  @IsEnum(SportType)
  sport: SportType;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  venue?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  homeTeamId?: string;

  @IsString()
  @IsOptional()
  awayTeamId?: string;

  @IsEnum(EventLevel)
  @IsOptional()
  level?: EventLevel;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  organizer?: string;

  @IsDateString()
  @IsOptional()
  registrationDeadline?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxParticipants?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  entryFee?: number;
}

export class UpdateSportsEventDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  venue?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  homeScore?: string;

  @IsString()
  @IsOptional()
  awayScore?: string;

  @IsString()
  @IsOptional()
  result?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}

export class SportsEventQueryDto {
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsEnum(SportType)
  @IsOptional()
  sport?: SportType;

  @IsEnum(SportsEventType)
  @IsOptional()
  type?: SportsEventType;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  upcomingOnly?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// CLUB EVENT DTOs
// =============================================================================

export class CreateClubEventDto {
  @IsString()
  clubId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsEnum(ClubEventType)
  type: ClubEventType;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  venue?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsDateString()
  @IsOptional()
  registrationDeadline?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxParticipants?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  entryFee?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsString()
  @IsOptional()
  resourceUrl?: string;

  @IsString()
  @IsOptional()
  posterUrl?: string;
}

export class UpdateClubEventDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  venue?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsString()
  @IsOptional()
  resourceUrl?: string;

  @IsString()
  @IsOptional()
  posterUrl?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}

export class ClubEventQueryDto {
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  clubId?: string;

  @IsEnum(ClubEventType)
  @IsOptional()
  type?: ClubEventType;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  upcomingOnly?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// EVENT REGISTRATION DTOs
// =============================================================================

export class RegisterForEventDto {
  @IsString()
  studentId: string;

  @IsString()
  @IsOptional()
  sportsEventId?: string;

  @IsString()
  @IsOptional()
  clubEventId?: string;
}

export class UpdateRegistrationDto {
  @IsBoolean()
  @IsOptional()
  attended?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  feedback?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  status?: string;
}

// =============================================================================
// ACHIEVEMENT DTOs
// =============================================================================

export class CreateAchievementDto {
  @IsString()
  studentId: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  clubId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @IsEnum(AchievementType)
  type: AchievementType;

  @IsEnum(AchievementCategory)
  category: AchievementCategory;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsDateString()
  awardedDate: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  awardedBy?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  eventName?: string;

  @IsEnum(EventLevel)
  @IsOptional()
  level?: EventLevel;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  certificateUrl?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  creditsAwarded?: number;
}

export class UpdateAchievementDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  certificateUrl?: string;

  @IsString()
  @IsOptional()
  verifiedBy?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class AchievementQueryDto {
  @IsString()
  @IsOptional()
  studentId?: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  clubId?: string;

  @IsEnum(AchievementCategory)
  @IsOptional()
  category?: AchievementCategory;

  @IsEnum(EventLevel)
  @IsOptional()
  level?: EventLevel;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// ACTIVITY CREDIT DTOs
// =============================================================================

export class CreateActivityCreditDto {
  @IsString()
  studentId: string;

  @IsString()
  academicYear: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(8)
  semester?: number;

  @IsEnum(ActivityCategory)
  category: ActivityCategory;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  activity: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  credits: number;

  @IsString()
  @IsOptional()
  awardedBy?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;
}

export class ActivityCreditQueryDto {
  @IsString()
  @IsOptional()
  studentId?: string;

  @IsString()
  @IsOptional()
  academicYear?: string;

  @IsEnum(ActivityCategory)
  @IsOptional()
  category?: ActivityCategory;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}
