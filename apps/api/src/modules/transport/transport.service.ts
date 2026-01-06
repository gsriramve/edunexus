import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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

@Injectable()
export class TransportService {
  constructor(private prisma: PrismaService) {}

  // =============================================================================
  // ROUTES
  // =============================================================================

  async createRoute(tenantId: string, dto: CreateRouteDto) {
    // Check if route code already exists
    const existing = await this.prisma.transportRoute.findFirst({
      where: { tenantId, code: dto.code },
    });

    if (existing) {
      throw new ConflictException('Route code already exists');
    }

    return this.prisma.transportRoute.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        startPoint: dto.startPoint,
        endPoint: dto.endPoint,
        totalDistance: dto.totalDistance,
        estimatedTime: dto.estimatedTime,
        fare: dto.fare || 0,
      },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        vehicles: true,
        _count: { select: { passes: true } },
      },
    });
  }

  async findAllRoutes(tenantId: string, query: RouteQueryDto) {
    const { search, status, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (status) {
      where.status = status.toLowerCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { startPoint: { contains: search, mode: 'insensitive' } },
        { endPoint: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [routes, total] = await Promise.all([
      this.prisma.transportRoute.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
        include: {
          stops: { orderBy: { sequence: 'asc' } },
          vehicles: { select: { id: true, vehicleNumber: true, driverName: true } },
          _count: { select: { passes: true } },
        },
      }),
      this.prisma.transportRoute.count({ where }),
    ]);

    return { data: routes, total, limit, offset };
  }

  async findRouteById(tenantId: string, id: string) {
    const route = await this.prisma.transportRoute.findFirst({
      where: { id, tenantId },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        vehicles: true,
        passes: {
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async updateRoute(tenantId: string, id: string, dto: UpdateRouteDto) {
    const existing = await this.prisma.transportRoute.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Route not found');
    }

    return this.prisma.transportRoute.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        startPoint: dto.startPoint,
        endPoint: dto.endPoint,
        totalDistance: dto.totalDistance,
        estimatedTime: dto.estimatedTime,
        fare: dto.fare,
        status: dto.status?.toLowerCase(),
      },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        vehicles: true,
      },
    });
  }

  async deleteRoute(tenantId: string, id: string) {
    const existing = await this.prisma.transportRoute.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { passes: true } } },
    });

    if (!existing) {
      throw new NotFoundException('Route not found');
    }

    if (existing._count.passes > 0) {
      throw new BadRequestException(
        'Cannot delete route with active passes. Deactivate or transfer passes first.',
      );
    }

    await this.prisma.transportRoute.delete({ where: { id } });
  }

  // =============================================================================
  // STOPS
  // =============================================================================

  async createStop(tenantId: string, dto: CreateStopDto) {
    // Verify route exists
    const route = await this.prisma.transportRoute.findFirst({
      where: { id: dto.routeId, tenantId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return this.prisma.transportStop.create({
      data: {
        tenantId,
        routeId: dto.routeId,
        name: dto.name,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        sequence: dto.sequence,
        pickupTime: dto.pickupTime,
        dropTime: dto.dropTime,
        landmark: dto.landmark,
      },
    });
  }

  async bulkCreateStops(tenantId: string, dto: BulkCreateStopsDto) {
    // Verify route exists
    const route = await this.prisma.transportRoute.findFirst({
      where: { id: dto.routeId, tenantId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    // Delete existing stops and create new ones
    await this.prisma.transportStop.deleteMany({
      where: { routeId: dto.routeId },
    });

    const stops = await this.prisma.transportStop.createMany({
      data: dto.stops.map((stop, index) => ({
        tenantId,
        routeId: dto.routeId,
        name: stop.name,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
        sequence: stop.sequence || index + 1,
        pickupTime: stop.pickupTime,
        dropTime: stop.dropTime,
        landmark: stop.landmark,
      })),
    });

    return { created: stops.count };
  }

  async findStopsByRoute(tenantId: string, routeId: string) {
    return this.prisma.transportStop.findMany({
      where: { tenantId, routeId },
      orderBy: { sequence: 'asc' },
    });
  }

  async updateStop(tenantId: string, id: string, dto: UpdateStopDto) {
    const existing = await this.prisma.transportStop.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Stop not found');
    }

    return this.prisma.transportStop.update({
      where: { id },
      data: {
        name: dto.name,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        sequence: dto.sequence,
        pickupTime: dto.pickupTime,
        dropTime: dto.dropTime,
        landmark: dto.landmark,
      },
    });
  }

  async deleteStop(tenantId: string, id: string) {
    const existing = await this.prisma.transportStop.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Stop not found');
    }

    await this.prisma.transportStop.delete({ where: { id } });
  }

  // =============================================================================
  // VEHICLES
  // =============================================================================

  async createVehicle(tenantId: string, dto: CreateVehicleDto) {
    // Check if vehicle number already exists
    const existing = await this.prisma.transportVehicle.findFirst({
      where: { tenantId, vehicleNumber: dto.vehicleNumber },
    });

    if (existing) {
      throw new ConflictException('Vehicle number already exists');
    }

    // Verify route if provided
    if (dto.routeId) {
      const route = await this.prisma.transportRoute.findFirst({
        where: { id: dto.routeId, tenantId },
      });
      if (!route) {
        throw new NotFoundException('Route not found');
      }
    }

    return this.prisma.transportVehicle.create({
      data: {
        tenantId,
        vehicleNumber: dto.vehicleNumber.toUpperCase(),
        vehicleType: dto.vehicleType || 'bus',
        capacity: dto.capacity || 40,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        color: dto.color,
        fuelType: dto.fuelType || 'diesel',
        insuranceExpiry: dto.insuranceExpiry ? new Date(dto.insuranceExpiry) : null,
        fitnessExpiry: dto.fitnessExpiry ? new Date(dto.fitnessExpiry) : null,
        permitExpiry: dto.permitExpiry ? new Date(dto.permitExpiry) : null,
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        driverLicense: dto.driverLicense,
        conductorName: dto.conductorName,
        conductorPhone: dto.conductorPhone,
        gpsDeviceId: dto.gpsDeviceId,
        routeId: dto.routeId,
      },
      include: {
        route: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async findAllVehicles(tenantId: string, query: VehicleQueryDto) {
    const { search, routeId, status, vehicleType, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (routeId) {
      where.routeId = routeId;
    }

    if (status) {
      where.status = status.toLowerCase();
    }

    if (vehicleType) {
      where.vehicleType = vehicleType.toLowerCase();
    }

    if (search) {
      where.OR = [
        { vehicleNumber: { contains: search, mode: 'insensitive' } },
        { driverName: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      this.prisma.transportVehicle.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { vehicleNumber: 'asc' },
        include: {
          route: { select: { id: true, name: true, code: true } },
        },
      }),
      this.prisma.transportVehicle.count({ where }),
    ]);

    return { data: vehicles, total, limit, offset };
  }

  async findVehicleById(tenantId: string, id: string) {
    const vehicle = await this.prisma.transportVehicle.findFirst({
      where: { id, tenantId },
      include: {
        route: {
          include: {
            stops: { orderBy: { sequence: 'asc' } },
          },
        },
        tracking: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async updateVehicle(tenantId: string, id: string, dto: UpdateVehicleDto) {
    const existing = await this.prisma.transportVehicle.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Vehicle not found');
    }

    // Verify route if provided
    if (dto.routeId) {
      const route = await this.prisma.transportRoute.findFirst({
        where: { id: dto.routeId, tenantId },
      });
      if (!route) {
        throw new NotFoundException('Route not found');
      }
    }

    return this.prisma.transportVehicle.update({
      where: { id },
      data: {
        vehicleType: dto.vehicleType,
        capacity: dto.capacity,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        color: dto.color,
        fuelType: dto.fuelType,
        insuranceExpiry: dto.insuranceExpiry ? new Date(dto.insuranceExpiry) : undefined,
        fitnessExpiry: dto.fitnessExpiry ? new Date(dto.fitnessExpiry) : undefined,
        permitExpiry: dto.permitExpiry ? new Date(dto.permitExpiry) : undefined,
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        driverLicense: dto.driverLicense,
        conductorName: dto.conductorName,
        conductorPhone: dto.conductorPhone,
        gpsDeviceId: dto.gpsDeviceId,
        routeId: dto.routeId,
        status: dto.status?.toLowerCase(),
      },
      include: {
        route: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async deleteVehicle(tenantId: string, id: string) {
    const existing = await this.prisma.transportVehicle.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.prisma.transportVehicle.delete({ where: { id } });
  }

  // =============================================================================
  // PASSES
  // =============================================================================

  async createPass(tenantId: string, dto: CreatePassDto) {
    // Verify student exists
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify route exists
    const route = await this.prisma.transportRoute.findFirst({
      where: { id: dto.routeId, tenantId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    // Check for existing active pass
    const existingPass = await this.prisma.transportPass.findFirst({
      where: {
        tenantId,
        studentId: dto.studentId,
        status: 'active',
        validUntil: { gte: new Date() },
      },
    });

    if (existingPass) {
      throw new ConflictException('Student already has an active transport pass');
    }

    // Generate pass number
    const passCount = await this.prisma.transportPass.count({ where: { tenantId } });
    const passNumber = `TP${String(passCount + 1).padStart(6, '0')}`;

    return this.prisma.transportPass.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        routeId: dto.routeId,
        passNumber,
        stopName: dto.stopName,
        validFrom: new Date(dto.validFrom),
        validUntil: new Date(dto.validUntil),
        fare: dto.fare,
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        route: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async findAllPasses(tenantId: string, query: PassQueryDto) {
    const { search, studentId, routeId, status, paymentStatus, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (studentId) {
      where.studentId = studentId;
    }

    if (routeId) {
      where.routeId = routeId;
    }

    if (status) {
      where.status = status.toLowerCase();
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus.toLowerCase();
    }

    if (search) {
      where.OR = [
        { passNumber: { contains: search, mode: 'insensitive' } },
        { stopName: { contains: search, mode: 'insensitive' } },
        { student: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { student: { rollNo: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [passes, total] = await Promise.all([
      this.prisma.transportPass.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
              department: { select: { name: true, code: true } },
            },
          },
          route: { select: { id: true, name: true, code: true } },
        },
      }),
      this.prisma.transportPass.count({ where }),
    ]);

    return { data: passes, total, limit, offset };
  }

  async findPassById(tenantId: string, id: string) {
    const pass = await this.prisma.transportPass.findFirst({
      where: { id, tenantId },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true, code: true } },
          },
        },
        route: {
          include: {
            stops: { orderBy: { sequence: 'asc' } },
            vehicles: { select: { id: true, vehicleNumber: true, driverName: true, driverPhone: true } },
          },
        },
      },
    });

    if (!pass) {
      throw new NotFoundException('Pass not found');
    }

    return pass;
  }

  async findPassByStudent(tenantId: string, studentId: string) {
    const pass = await this.prisma.transportPass.findFirst({
      where: { tenantId, studentId, status: 'active' },
      include: {
        route: {
          include: {
            stops: { orderBy: { sequence: 'asc' } },
            vehicles: {
              include: {
                tracking: { orderBy: { recordedAt: 'desc' }, take: 1 },
              },
            },
          },
        },
      },
    });

    return pass;
  }

  async updatePass(tenantId: string, id: string, dto: UpdatePassDto) {
    const existing = await this.prisma.transportPass.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Pass not found');
    }

    return this.prisma.transportPass.update({
      where: { id },
      data: {
        stopName: dto.stopName,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        fare: dto.fare,
        paidAmount: dto.paidAmount,
        paymentStatus: dto.paymentStatus?.toLowerCase(),
        status: dto.status?.toLowerCase(),
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        route: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async cancelPass(tenantId: string, id: string) {
    const existing = await this.prisma.transportPass.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Pass not found');
    }

    return this.prisma.transportPass.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  // =============================================================================
  // TRACKING
  // =============================================================================

  async createTracking(tenantId: string, dto: CreateTrackingDto) {
    // Verify vehicle exists
    const vehicle = await this.prisma.transportVehicle.findFirst({
      where: { id: dto.vehicleId, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return this.prisma.transportTracking.create({
      data: {
        tenantId,
        vehicleId: dto.vehicleId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        speed: dto.speed,
        heading: dto.heading,
        altitude: dto.altitude,
        accuracy: dto.accuracy,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
      },
    });
  }

  async getLatestTracking(tenantId: string, vehicleId: string) {
    const tracking = await this.prisma.transportTracking.findFirst({
      where: { tenantId, vehicleId },
      orderBy: { recordedAt: 'desc' },
      include: {
        vehicle: {
          select: {
            id: true,
            vehicleNumber: true,
            driverName: true,
            driverPhone: true,
            route: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    return tracking;
  }

  async getTrackingHistory(tenantId: string, query: TrackingQueryDto) {
    const { vehicleId, from, to, limit = 100 } = query;

    const where: any = { tenantId, vehicleId };

    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt.gte = new Date(from);
      if (to) where.recordedAt.lte = new Date(to);
    }

    return this.prisma.transportTracking.findMany({
      where,
      take: limit,
      orderBy: { recordedAt: 'desc' },
    });
  }

  async getAllVehicleLocations(tenantId: string) {
    // Get latest location for each active vehicle
    const vehicles = await this.prisma.transportVehicle.findMany({
      where: { tenantId, status: 'active' },
      include: {
        route: { select: { id: true, name: true, code: true } },
        tracking: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    return vehicles.map((v) => ({
      vehicleId: v.id,
      vehicleNumber: v.vehicleNumber,
      driverName: v.driverName,
      driverPhone: v.driverPhone,
      route: v.route,
      location: v.tracking[0] || null,
    }));
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  async getStats(tenantId: string) {
    const [
      totalRoutes,
      activeRoutes,
      totalVehicles,
      activeVehicles,
      totalPasses,
      activePasses,
      pendingPayments,
    ] = await Promise.all([
      this.prisma.transportRoute.count({ where: { tenantId } }),
      this.prisma.transportRoute.count({ where: { tenantId, status: 'active' } }),
      this.prisma.transportVehicle.count({ where: { tenantId } }),
      this.prisma.transportVehicle.count({ where: { tenantId, status: 'active' } }),
      this.prisma.transportPass.count({ where: { tenantId } }),
      this.prisma.transportPass.count({ where: { tenantId, status: 'active' } }),
      this.prisma.transportPass.count({
        where: { tenantId, paymentStatus: { in: ['pending', 'partial'] } },
      }),
    ]);

    // Get fare collection
    const feeAgg = await this.prisma.transportPass.aggregate({
      where: { tenantId },
      _sum: { fare: true, paidAmount: true },
    });

    return {
      routes: { total: totalRoutes, active: activeRoutes },
      vehicles: { total: totalVehicles, active: activeVehicles },
      passes: { total: totalPasses, active: activePasses, pendingPayments },
      revenue: {
        totalFare: Number(feeAgg._sum.fare || 0),
        collected: Number(feeAgg._sum.paidAmount || 0),
        pending: Number(feeAgg._sum.fare || 0) - Number(feeAgg._sum.paidAmount || 0),
      },
    };
  }
}
