import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// =============================================================================
// ENUMS
// =============================================================================

export enum BlockType {
  BOYS = 'boys',
  GIRLS = 'girls',
  MIXED = 'mixed',
}

export enum BlockStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed',
}

export enum RoomType {
  SINGLE = 'single',
  DOUBLE = 'double',
  TRIPLE = 'triple',
  DORMITORY = 'dormitory',
}

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  FULL = 'full',
  MAINTENANCE = 'maintenance',
}

export enum AllocationStatus {
  ACTIVE = 'active',
  CHECKED_OUT = 'checked_out',
  TRANSFERRED = 'transferred',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  OVERDUE = 'overdue',
}

export enum ComplaintCategory {
  MAINTENANCE = 'maintenance',
  CLEANLINESS = 'cleanliness',
  FOOD = 'food',
  SECURITY = 'security',
  RAGGING = 'ragging',
  OTHER = 'other',
}

export enum ComplaintPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ComplaintStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  SNACKS = 'snacks',
  DINNER = 'dinner',
}

// =============================================================================
// BLOCK DTOs
// =============================================================================

export class CreateBlockDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @IsEnum(BlockType)
  @IsOptional()
  type?: BlockType;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(20)
  totalFloors?: number;

  @IsString()
  @IsOptional()
  wardenId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  wardenName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  wardenPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}

export class UpdateBlockDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsEnum(BlockType)
  @IsOptional()
  type?: BlockType;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(20)
  totalFloors?: number;

  @IsString()
  @IsOptional()
  wardenId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  wardenName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  wardenPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsEnum(BlockStatus)
  @IsOptional()
  status?: BlockStatus;
}

export class BlockQueryDto {
  @IsOptional()
  search?: string;

  @IsEnum(BlockType)
  @IsOptional()
  type?: BlockType;

  @IsEnum(BlockStatus)
  @IsOptional()
  status?: BlockStatus;

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
// ROOM DTOs
// =============================================================================

export class CreateRoomDto {
  @IsString()
  blockId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  roomNumber: string;

  @IsNumber()
  @Min(0)
  @Max(20)
  floor: number;

  @IsEnum(RoomType)
  @IsOptional()
  roomType?: RoomType;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  capacity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyRent?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}

export class UpdateRoomDto {
  @IsEnum(RoomType)
  @IsOptional()
  roomType?: RoomType;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  capacity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyRent?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;
}

export class RoomQueryDto {
  @IsString()
  @IsOptional()
  blockId?: string;

  @IsEnum(RoomType)
  @IsOptional()
  roomType?: RoomType;

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  floor?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

export class BulkCreateRoomsDto {
  @IsString()
  blockId: string;

  @IsNumber()
  @Min(0)
  @Max(20)
  floor: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  startNumber: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  count: number;

  @IsString()
  @IsOptional()
  prefix?: string; // e.g., "A-" to create "A-101", "A-102"

  @IsEnum(RoomType)
  @IsOptional()
  roomType?: RoomType;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  capacity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyRent?: number;
}

// =============================================================================
// ALLOCATION DTOs
// =============================================================================

export class CreateAllocationDto {
  @IsString()
  studentId: string;

  @IsString()
  roomId: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  bedNumber?: number;

  @IsDateString()
  checkInDate: string;

  @IsDateString()
  @IsOptional()
  expectedCheckOut?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;
}

export class UpdateAllocationDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  bedNumber?: number;

  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @IsDateString()
  @IsOptional()
  expectedCheckOut?: string;

  @IsEnum(AllocationStatus)
  @IsOptional()
  status?: AllocationStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;
}

export class TransferAllocationDto {
  @IsString()
  newRoomId: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  newBedNumber?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}

export class AllocationQueryDto {
  @IsString()
  @IsOptional()
  blockId?: string;

  @IsString()
  @IsOptional()
  roomId?: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsEnum(AllocationStatus)
  @IsOptional()
  status?: AllocationStatus;

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
// HOSTEL FEE DTOs
// =============================================================================

export class CreateHostelFeeDto {
  @IsString()
  studentId: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  academicYear: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(8)
  semester?: number;

  @IsNumber()
  @Min(0)
  roomRent: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  messCharges?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  electricityCharges?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  otherCharges?: number;

  @IsDateString()
  dueDate: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;
}

export class UpdateHostelFeeDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  roomRent?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  messCharges?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  electricityCharges?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  otherCharges?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  paidAmount?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsDateString()
  @IsOptional()
  paidDate?: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  receiptNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;
}

export class HostelFeeQueryDto {
  @IsString()
  @IsOptional()
  studentId?: string;

  @IsString()
  @IsOptional()
  academicYear?: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

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
// MESS MENU DTOs
// =============================================================================

export class CreateMessMenuDto {
  @IsString()
  @IsOptional()
  blockId?: string;

  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsEnum(MealType)
  mealType: MealType;

  @IsArray()
  @IsString({ each: true })
  items: string[];

  @IsString()
  @IsOptional()
  @MaxLength(30)
  timing?: string;

  @IsBoolean()
  @IsOptional()
  isVeg?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  specialDay?: string;

  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @IsDateString()
  @IsOptional()
  validUntil?: string;
}

export class UpdateMessMenuDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  items?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(30)
  timing?: string;

  @IsBoolean()
  @IsOptional()
  isVeg?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  specialDay?: string;

  @IsDateString()
  @IsOptional()
  validUntil?: string;
}

export class MessMenuQueryDto {
  @IsString()
  @IsOptional()
  blockId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsEnum(MealType)
  @IsOptional()
  mealType?: MealType;
}

// =============================================================================
// COMPLAINT DTOs
// =============================================================================

export class CreateComplaintDto {
  @IsString()
  studentId: string;

  @IsString()
  blockId: string;

  @IsString()
  @IsOptional()
  roomId?: string;

  @IsEnum(ComplaintCategory)
  category: ComplaintCategory;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  subject: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @IsEnum(ComplaintPriority)
  @IsOptional()
  priority?: ComplaintPriority;
}

export class UpdateComplaintDto {
  @IsEnum(ComplaintPriority)
  @IsOptional()
  priority?: ComplaintPriority;

  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  resolution?: string;
}

export class ComplaintFeedbackDto {
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  feedback?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;
}

export class ComplaintQueryDto {
  @IsString()
  @IsOptional()
  blockId?: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsEnum(ComplaintCategory)
  @IsOptional()
  category?: ComplaintCategory;

  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;

  @IsEnum(ComplaintPriority)
  @IsOptional()
  priority?: ComplaintPriority;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}
