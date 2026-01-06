import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// =============================================================================
// ENUMS
// =============================================================================

export enum RouteStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum VehicleType {
  BUS = 'bus',
  MINI_BUS = 'mini_bus',
  VAN = 'van',
}

export enum VehicleStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
}

export enum FuelType {
  DIESEL = 'diesel',
  PETROL = 'petrol',
  CNG = 'cng',
  ELECTRIC = 'electric',
}

export enum PassStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
}

// =============================================================================
// ROUTE DTOs
// =============================================================================

export class CreateRouteDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  startPoint: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  endPoint: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1000)
  totalDistance?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(480)
  estimatedTime?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fare?: number;
}

export class UpdateRouteDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  startPoint?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  endPoint?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1000)
  totalDistance?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(480)
  estimatedTime?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fare?: number;

  @IsEnum(RouteStatus)
  @IsOptional()
  status?: RouteStatus;
}

export class RouteQueryDto {
  @IsOptional()
  search?: string;

  @IsEnum(RouteStatus)
  @IsOptional()
  status?: RouteStatus;

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
// STOP DTOs
// =============================================================================

export class CreateStopDto {
  @IsString()
  routeId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsNumber()
  @Min(1)
  sequence: number;

  @IsString()
  @IsOptional()
  pickupTime?: string;

  @IsString()
  @IsOptional()
  dropTime?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  landmark?: string;
}

export class UpdateStopDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  sequence?: number;

  @IsString()
  @IsOptional()
  pickupTime?: string;

  @IsString()
  @IsOptional()
  dropTime?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  landmark?: string;
}

export class StopItemDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsNumber()
  @Min(1)
  sequence: number;

  @IsString()
  @IsOptional()
  pickupTime?: string;

  @IsString()
  @IsOptional()
  dropTime?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  landmark?: string;
}

export class BulkCreateStopsDto {
  @IsString()
  routeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StopItemDto)
  stops: StopItemDto[];
}

// =============================================================================
// VEHICLE DTOs
// =============================================================================

export class CreateVehicleDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  vehicleNumber: string;

  @IsEnum(VehicleType)
  @IsOptional()
  vehicleType?: VehicleType;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  capacity?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  make?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  model?: string;

  @IsNumber()
  @IsOptional()
  @Min(1990)
  @Max(2030)
  year?: number;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  color?: string;

  @IsEnum(FuelType)
  @IsOptional()
  fuelType?: FuelType;

  @IsDateString()
  @IsOptional()
  insuranceExpiry?: string;

  @IsDateString()
  @IsOptional()
  fitnessExpiry?: string;

  @IsDateString()
  @IsOptional()
  permitExpiry?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  driverName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  driverPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  driverLicense?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  conductorName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  conductorPhone?: string;

  @IsString()
  @IsOptional()
  gpsDeviceId?: string;

  @IsString()
  @IsOptional()
  routeId?: string;
}

export class UpdateVehicleDto {
  @IsEnum(VehicleType)
  @IsOptional()
  vehicleType?: VehicleType;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  capacity?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  make?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  model?: string;

  @IsNumber()
  @IsOptional()
  @Min(1990)
  @Max(2030)
  year?: number;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  color?: string;

  @IsEnum(FuelType)
  @IsOptional()
  fuelType?: FuelType;

  @IsDateString()
  @IsOptional()
  insuranceExpiry?: string;

  @IsDateString()
  @IsOptional()
  fitnessExpiry?: string;

  @IsDateString()
  @IsOptional()
  permitExpiry?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  driverName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  driverPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  driverLicense?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  conductorName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  conductorPhone?: string;

  @IsString()
  @IsOptional()
  gpsDeviceId?: string;

  @IsString()
  @IsOptional()
  routeId?: string;

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;
}

export class VehicleQueryDto {
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  routeId?: string;

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @IsEnum(VehicleType)
  @IsOptional()
  vehicleType?: VehicleType;

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
// PASS DTOs
// =============================================================================

export class CreatePassDto {
  @IsString()
  studentId: string;

  @IsString()
  routeId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  stopName: string;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsNumber()
  @Min(0)
  fare: number;
}

export class UpdatePassDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  stopName?: string;

  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fare?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  paidAmount?: number;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsEnum(PassStatus)
  @IsOptional()
  status?: PassStatus;
}

export class PassQueryDto {
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsString()
  @IsOptional()
  routeId?: string;

  @IsEnum(PassStatus)
  @IsOptional()
  status?: PassStatus;

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
// TRACKING DTOs
// =============================================================================

export class CreateTrackingDto {
  @IsString()
  vehicleId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(200)
  speed?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(360)
  heading?: number;

  @IsNumber()
  @IsOptional()
  altitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  accuracy?: number;

  @IsDateString()
  @IsOptional()
  recordedAt?: string;
}

export class TrackingQueryDto {
  @IsString()
  vehicleId: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
