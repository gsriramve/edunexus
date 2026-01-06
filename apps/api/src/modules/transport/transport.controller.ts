import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransportService } from './transport.service';
import {
  CreateRouteDto,
  UpdateRouteDto,
  RouteQueryDto,
  CreateStopDto,
  UpdateStopDto,
  BulkCreateStopsDto,
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleQueryDto,
  CreatePassDto,
  UpdatePassDto,
  PassQueryDto,
  CreateTrackingDto,
  TrackingQueryDto,
} from './dto/transport.dto';

@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  // =============================================================================
  // ROUTES
  // =============================================================================

  @Post('routes')
  createRoute(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateRouteDto,
  ) {
    return this.transportService.createRoute(tenantId, dto);
  }

  @Get('routes')
  findAllRoutes(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: RouteQueryDto,
  ) {
    return this.transportService.findAllRoutes(tenantId, query);
  }

  @Get('routes/:id')
  findRouteById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.transportService.findRouteById(tenantId, id);
  }

  @Patch('routes/:id')
  updateRoute(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.transportService.updateRoute(tenantId, id, dto);
  }

  @Delete('routes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteRoute(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.transportService.deleteRoute(tenantId, id);
  }

  // =============================================================================
  // STOPS
  // =============================================================================

  @Post('stops')
  createStop(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateStopDto,
  ) {
    return this.transportService.createStop(tenantId, dto);
  }

  @Post('stops/bulk')
  bulkCreateStops(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: BulkCreateStopsDto,
  ) {
    return this.transportService.bulkCreateStops(tenantId, dto);
  }

  @Get('routes/:routeId/stops')
  findStopsByRoute(
    @Headers('x-tenant-id') tenantId: string,
    @Param('routeId') routeId: string,
  ) {
    return this.transportService.findStopsByRoute(tenantId, routeId);
  }

  @Patch('stops/:id')
  updateStop(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStopDto,
  ) {
    return this.transportService.updateStop(tenantId, id, dto);
  }

  @Delete('stops/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteStop(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.transportService.deleteStop(tenantId, id);
  }

  // =============================================================================
  // VEHICLES
  // =============================================================================

  @Post('vehicles')
  createVehicle(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.transportService.createVehicle(tenantId, dto);
  }

  @Get('vehicles')
  findAllVehicles(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: VehicleQueryDto,
  ) {
    return this.transportService.findAllVehicles(tenantId, query);
  }

  @Get('vehicles/locations')
  getAllVehicleLocations(@Headers('x-tenant-id') tenantId: string) {
    return this.transportService.getAllVehicleLocations(tenantId);
  }

  @Get('vehicles/:id')
  findVehicleById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.transportService.findVehicleById(tenantId, id);
  }

  @Patch('vehicles/:id')
  updateVehicle(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.transportService.updateVehicle(tenantId, id, dto);
  }

  @Delete('vehicles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteVehicle(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.transportService.deleteVehicle(tenantId, id);
  }

  // =============================================================================
  // PASSES
  // =============================================================================

  @Post('passes')
  createPass(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreatePassDto,
  ) {
    return this.transportService.createPass(tenantId, dto);
  }

  @Get('passes')
  findAllPasses(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: PassQueryDto,
  ) {
    return this.transportService.findAllPasses(tenantId, query);
  }

  @Get('passes/student/:studentId')
  findPassByStudent(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.transportService.findPassByStudent(tenantId, studentId);
  }

  @Get('passes/:id')
  findPassById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.transportService.findPassById(tenantId, id);
  }

  @Patch('passes/:id')
  updatePass(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePassDto,
  ) {
    return this.transportService.updatePass(tenantId, id, dto);
  }

  @Patch('passes/:id/cancel')
  cancelPass(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.transportService.cancelPass(tenantId, id);
  }

  // =============================================================================
  // TRACKING
  // =============================================================================

  @Post('tracking')
  createTracking(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateTrackingDto,
  ) {
    return this.transportService.createTracking(tenantId, dto);
  }

  @Get('tracking/vehicle/:vehicleId')
  getLatestTracking(
    @Headers('x-tenant-id') tenantId: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.transportService.getLatestTracking(tenantId, vehicleId);
  }

  @Get('tracking/history')
  getTrackingHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: TrackingQueryDto,
  ) {
    return this.transportService.getTrackingHistory(tenantId, query);
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  @Get('stats')
  getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.transportService.getStats(tenantId);
  }
}
