import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateBlockDto,
  UpdateBlockDto,
  BlockQueryDto,
  CreateRoomDto,
  UpdateRoomDto,
  RoomQueryDto,
  BulkCreateRoomsDto,
  CreateAllocationDto,
  UpdateAllocationDto,
  TransferAllocationDto,
  AllocationQueryDto,
  CreateHostelFeeDto,
  UpdateHostelFeeDto,
  HostelFeeQueryDto,
  CreateMessMenuDto,
  UpdateMessMenuDto,
  MessMenuQueryDto,
  CreateComplaintDto,
  UpdateComplaintDto,
  ComplaintFeedbackDto,
  ComplaintQueryDto,
} from './dto/hostel.dto';

@Injectable()
export class HostelService {
  constructor(private prisma: PrismaService) {}

  // =============================================================================
  // BLOCKS
  // =============================================================================

  async createBlock(tenantId: string, dto: CreateBlockDto) {
    return this.prisma.hostelBlock.create({
      data: {
        tenantId,
        ...dto,
      },
    });
  }

  async findAllBlocks(tenantId: string, query: BlockQueryDto) {
    const { search, type, status, limit = 50, offset = 0 } = query;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (status) where.status = status;

    const [blocks, total] = await Promise.all([
      this.prisma.hostelBlock.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { rooms: true },
          },
        },
      }),
      this.prisma.hostelBlock.count({ where }),
    ]);

    return { data: blocks, total, limit, offset };
  }

  async findBlockById(tenantId: string, id: string) {
    const block = await this.prisma.hostelBlock.findFirst({
      where: { id, tenantId },
      include: {
        rooms: {
          orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
        },
        _count: {
          select: { rooms: true, complaints: true },
        },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return block;
  }

  async updateBlock(tenantId: string, id: string, dto: UpdateBlockDto) {
    await this.findBlockById(tenantId, id);

    return this.prisma.hostelBlock.update({
      where: { id },
      data: dto,
    });
  }

  async deleteBlock(tenantId: string, id: string) {
    await this.findBlockById(tenantId, id);

    return this.prisma.hostelBlock.delete({
      where: { id },
    });
  }

  // =============================================================================
  // ROOMS
  // =============================================================================

  async createRoom(tenantId: string, dto: CreateRoomDto) {
    // Verify block exists
    const block = await this.prisma.hostelBlock.findFirst({
      where: { id: dto.blockId, tenantId },
    });
    if (!block) {
      throw new NotFoundException('Block not found');
    }

    const room = await this.prisma.hostelRoom.create({
      data: {
        tenantId,
        ...dto,
      },
    });

    // Update block stats
    await this.updateBlockStats(dto.blockId);

    return room;
  }

  async bulkCreateRooms(tenantId: string, dto: BulkCreateRoomsDto) {
    // Verify block exists
    const block = await this.prisma.hostelBlock.findFirst({
      where: { id: dto.blockId, tenantId },
    });
    if (!block) {
      throw new NotFoundException('Block not found');
    }

    const rooms = [];
    for (let i = 0; i < dto.count; i++) {
      const roomNum = dto.startNumber + i;
      const roomNumber = dto.prefix
        ? `${dto.prefix}${dto.floor}${roomNum.toString().padStart(2, '0')}`
        : `${dto.floor}${roomNum.toString().padStart(2, '0')}`;

      rooms.push({
        tenantId,
        blockId: dto.blockId,
        roomNumber,
        floor: dto.floor,
        roomType: dto.roomType || 'double',
        capacity: dto.capacity || 2,
        monthlyRent: dto.monthlyRent || 0,
      });
    }

    await this.prisma.hostelRoom.createMany({
      data: rooms,
      skipDuplicates: true,
    });

    // Update block stats
    await this.updateBlockStats(dto.blockId);

    return { created: rooms.length };
  }

  async findAllRooms(tenantId: string, query: RoomQueryDto) {
    const { blockId, roomType, status, floor, limit = 100, offset = 0 } = query;

    const where: any = { tenantId };

    if (blockId) where.blockId = blockId;
    if (roomType) where.roomType = roomType;
    if (status) where.status = status;
    if (floor !== undefined) where.floor = floor;

    const [rooms, total] = await Promise.all([
      this.prisma.hostelRoom.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
        include: {
          block: {
            select: { id: true, name: true, code: true },
          },
          allocations: {
            where: { status: 'active' },
            include: {
              student: {
                include: {
                  user: {
                    select: { name: true, email: true },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.hostelRoom.count({ where }),
    ]);

    return { data: rooms, total, limit, offset };
  }

  async findRoomById(tenantId: string, id: string) {
    const room = await this.prisma.hostelRoom.findFirst({
      where: { id, tenantId },
      include: {
        block: true,
        allocations: {
          where: { status: 'active' },
          include: {
            student: {
              include: {
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async updateRoom(tenantId: string, id: string, dto: UpdateRoomDto) {
    await this.findRoomById(tenantId, id);

    return this.prisma.hostelRoom.update({
      where: { id },
      data: dto,
    });
  }

  async deleteRoom(tenantId: string, id: string) {
    const room = await this.findRoomById(tenantId, id);

    await this.prisma.hostelRoom.delete({
      where: { id },
    });

    // Update block stats
    await this.updateBlockStats(room.blockId);

    return { deleted: true };
  }

  private async updateBlockStats(blockId: string) {
    const stats = await this.prisma.hostelRoom.aggregate({
      where: { blockId },
      _count: true,
      _sum: { capacity: true },
    });

    await this.prisma.hostelBlock.update({
      where: { id: blockId },
      data: {
        totalRooms: stats._count,
        totalCapacity: stats._sum.capacity || 0,
      },
    });
  }

  // =============================================================================
  // ALLOCATIONS
  // =============================================================================

  async createAllocation(tenantId: string, dto: CreateAllocationDto) {
    // Verify student exists
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify room exists and has capacity
    const room = await this.prisma.hostelRoom.findFirst({
      where: { id: dto.roomId, tenantId },
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    if (room.occupancy >= room.capacity) {
      throw new BadRequestException('Room is at full capacity');
    }

    // Check if student already has an active allocation
    const existingAllocation = await this.prisma.hostelAllocation.findFirst({
      where: { studentId: dto.studentId, tenantId, status: 'active' },
    });
    if (existingAllocation) {
      throw new BadRequestException('Student already has an active allocation');
    }

    // Create allocation
    const allocation = await this.prisma.hostelAllocation.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        roomId: dto.roomId,
        bedNumber: dto.bedNumber,
        checkInDate: new Date(dto.checkInDate),
        expectedCheckOut: dto.expectedCheckOut ? new Date(dto.expectedCheckOut) : null,
        remarks: dto.remarks,
      },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } },
        },
        room: {
          include: { block: { select: { name: true, code: true } } },
        },
      },
    });

    // Update room occupancy
    await this.updateRoomOccupancy(dto.roomId);

    return allocation;
  }

  async findAllAllocations(tenantId: string, query: AllocationQueryDto) {
    const { blockId, roomId, studentId, status, limit = 50, offset = 0 } = query;

    const where: any = { tenantId };

    if (roomId) where.roomId = roomId;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    if (blockId) {
      where.room = { blockId };
    }

    const [allocations, total] = await Promise.all([
      this.prisma.hostelAllocation.findMany({
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
          room: {
            include: { block: { select: { name: true, code: true } } },
          },
        },
      }),
      this.prisma.hostelAllocation.count({ where }),
    ]);

    return { data: allocations, total, limit, offset };
  }

  async findAllocationById(tenantId: string, id: string) {
    const allocation = await this.prisma.hostelAllocation.findFirst({
      where: { id, tenantId },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } },
        },
        room: {
          include: { block: true },
        },
      },
    });

    if (!allocation) {
      throw new NotFoundException('Allocation not found');
    }

    return allocation;
  }

  async getStudentAllocation(tenantId: string, studentId: string) {
    const allocation = await this.prisma.hostelAllocation.findFirst({
      where: { studentId, tenantId, status: 'active' },
      include: {
        room: {
          include: { block: true },
        },
      },
    });

    return allocation;
  }

  async updateAllocation(tenantId: string, id: string, dto: UpdateAllocationDto) {
    const allocation = await this.findAllocationById(tenantId, id);

    const updated = await this.prisma.hostelAllocation.update({
      where: { id },
      data: {
        ...dto,
        checkOutDate: dto.checkOutDate ? new Date(dto.checkOutDate) : undefined,
        expectedCheckOut: dto.expectedCheckOut ? new Date(dto.expectedCheckOut) : undefined,
      },
    });

    // If checked out, update room occupancy
    if (dto.status === 'checked_out') {
      await this.updateRoomOccupancy(allocation.roomId);
    }

    return updated;
  }

  async transferAllocation(tenantId: string, id: string, dto: TransferAllocationDto) {
    const allocation = await this.findAllocationById(tenantId, id);

    // Verify new room exists and has capacity
    const newRoom = await this.prisma.hostelRoom.findFirst({
      where: { id: dto.newRoomId, tenantId },
    });
    if (!newRoom) {
      throw new NotFoundException('New room not found');
    }
    if (newRoom.occupancy >= newRoom.capacity) {
      throw new BadRequestException('New room is at full capacity');
    }

    // Update allocation
    const oldRoomId = allocation.roomId;
    const updated = await this.prisma.hostelAllocation.update({
      where: { id },
      data: {
        roomId: dto.newRoomId,
        bedNumber: dto.newBedNumber,
        remarks: dto.reason
          ? `${allocation.remarks || ''}\nTransferred: ${dto.reason}`
          : allocation.remarks,
      },
    });

    // Update both room occupancies
    await this.updateRoomOccupancy(oldRoomId);
    await this.updateRoomOccupancy(dto.newRoomId);

    return updated;
  }

  private async updateRoomOccupancy(roomId: string) {
    const count = await this.prisma.hostelAllocation.count({
      where: { roomId, status: 'active' },
    });

    const room = await this.prisma.hostelRoom.findUnique({
      where: { id: roomId },
    });

    let status = 'available';
    if (count >= (room?.capacity || 0)) {
      status = 'full';
    } else if (count > 0) {
      status = 'occupied';
    }

    await this.prisma.hostelRoom.update({
      where: { id: roomId },
      data: { occupancy: count, status },
    });
  }

  // =============================================================================
  // HOSTEL FEES
  // =============================================================================

  async createHostelFee(tenantId: string, dto: CreateHostelFeeDto) {
    // Verify student exists
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const totalAmount =
      dto.roomRent +
      (dto.messCharges || 0) +
      (dto.electricityCharges || 0) +
      (dto.otherCharges || 0);

    return this.prisma.hostelFee.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        academicYear: dto.academicYear,
        semester: dto.semester,
        roomRent: dto.roomRent,
        messCharges: dto.messCharges || 0,
        electricityCharges: dto.electricityCharges || 0,
        otherCharges: dto.otherCharges || 0,
        totalAmount,
        dueDate: new Date(dto.dueDate),
        remarks: dto.remarks,
      },
    });
  }

  async findAllHostelFees(tenantId: string, query: HostelFeeQueryDto) {
    const { studentId, academicYear, paymentStatus, limit = 50, offset = 0 } = query;

    const where: any = { tenantId };

    if (studentId) where.studentId = studentId;
    if (academicYear) where.academicYear = academicYear;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [fees, total] = await Promise.all([
      this.prisma.hostelFee.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      }),
      this.prisma.hostelFee.count({ where }),
    ]);

    return { data: fees, total, limit, offset };
  }

  async getStudentHostelFees(tenantId: string, studentId: string) {
    return this.prisma.hostelFee.findMany({
      where: { studentId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateHostelFee(tenantId: string, id: string, dto: UpdateHostelFeeDto) {
    const fee = await this.prisma.hostelFee.findFirst({
      where: { id, tenantId },
    });
    if (!fee) {
      throw new NotFoundException('Hostel fee not found');
    }

    // Recalculate total if charges changed
    let newTotalAmount: number | undefined = undefined;
    if (dto.roomRent !== undefined || dto.messCharges !== undefined ||
        dto.electricityCharges !== undefined || dto.otherCharges !== undefined) {
      newTotalAmount = (dto.roomRent ?? Number(fee.roomRent)) +
                    (dto.messCharges ?? Number(fee.messCharges)) +
                    (dto.electricityCharges ?? Number(fee.electricityCharges)) +
                    (dto.otherCharges ?? Number(fee.otherCharges));
    }

    return this.prisma.hostelFee.update({
      where: { id },
      data: {
        ...dto,
        totalAmount: newTotalAmount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        paidDate: dto.paidDate ? new Date(dto.paidDate) : undefined,
      },
    });
  }

  // =============================================================================
  // MESS MENU
  // =============================================================================

  async createMessMenu(tenantId: string, dto: CreateMessMenuDto) {
    return this.prisma.messMenu.create({
      data: {
        tenantId,
        blockId: dto.blockId || null,
        dayOfWeek: dto.dayOfWeek,
        mealType: dto.mealType,
        items: dto.items,
        timing: dto.timing,
        isVeg: dto.isVeg ?? true,
        specialDay: dto.specialDay,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : new Date(),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      },
    });
  }

  async findAllMessMenus(tenantId: string, query: MessMenuQueryDto) {
    const { blockId, dayOfWeek, mealType } = query;

    const where: any = { tenantId };

    if (blockId) where.blockId = blockId;
    if (dayOfWeek !== undefined) where.dayOfWeek = dayOfWeek;
    if (mealType) where.mealType = mealType;

    const menus = await this.prisma.messMenu.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
    });

    return menus;
  }

  async getWeeklyMenu(tenantId: string, blockId?: string) {
    const where: any = {
      tenantId,
      OR: [{ blockId: blockId || null }, { blockId: null }],
    };

    const menus = await this.prisma.messMenu.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
    });

    // Group by day
    const weeklyMenu: Record<string, typeof menus> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 7; i++) {
      weeklyMenu[days[i]] = menus.filter((m) => m.dayOfWeek === i);
    }

    return weeklyMenu;
  }

  async updateMessMenu(tenantId: string, id: string, dto: UpdateMessMenuDto) {
    const menu = await this.prisma.messMenu.findFirst({
      where: { id, tenantId },
    });
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    return this.prisma.messMenu.update({
      where: { id },
      data: {
        ...dto,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      },
    });
  }

  async deleteMessMenu(tenantId: string, id: string) {
    const menu = await this.prisma.messMenu.findFirst({
      where: { id, tenantId },
    });
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    return this.prisma.messMenu.delete({
      where: { id },
    });
  }

  // =============================================================================
  // COMPLAINTS
  // =============================================================================

  async createComplaint(tenantId: string, dto: CreateComplaintDto) {
    // Verify student exists
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Generate complaint number
    const count = await this.prisma.hostelComplaint.count({ where: { tenantId } });
    const complaintNumber = `HC${String(count + 1).padStart(6, '0')}`;

    return this.prisma.hostelComplaint.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        blockId: dto.blockId,
        roomId: dto.roomId || null,
        complaintNumber,
        category: dto.category,
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority || 'medium',
      },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } },
        },
        block: { select: { name: true, code: true } },
        room: { select: { roomNumber: true, floor: true } },
      },
    });
  }

  async findAllComplaints(tenantId: string, query: ComplaintQueryDto) {
    const { blockId, studentId, category, status, priority, limit = 50, offset = 0 } = query;

    const where: any = { tenantId };

    if (blockId) where.blockId = blockId;
    if (studentId) where.studentId = studentId;
    if (category) where.category = category;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [complaints, total] = await Promise.all([
      this.prisma.hostelComplaint.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          student: {
            include: { user: { select: { name: true, email: true } } },
          },
          block: { select: { name: true, code: true } },
          room: { select: { roomNumber: true, floor: true } },
        },
      }),
      this.prisma.hostelComplaint.count({ where }),
    ]);

    return { data: complaints, total, limit, offset };
  }

  async findComplaintById(tenantId: string, id: string) {
    const complaint = await this.prisma.hostelComplaint.findFirst({
      where: { id, tenantId },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } },
        },
        block: true,
        room: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  async getStudentComplaints(tenantId: string, studentId: string) {
    return this.prisma.hostelComplaint.findMany({
      where: { studentId, tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        block: { select: { name: true } },
        room: { select: { roomNumber: true } },
      },
    });
  }

  async updateComplaint(tenantId: string, id: string, dto: UpdateComplaintDto) {
    await this.findComplaintById(tenantId, id);

    return this.prisma.hostelComplaint.update({
      where: { id },
      data: {
        ...dto,
        resolvedAt: dto.status === 'resolved' ? new Date() : undefined,
      },
    });
  }

  async addComplaintFeedback(tenantId: string, id: string, dto: ComplaintFeedbackDto) {
    const complaint = await this.findComplaintById(tenantId, id);

    if (complaint.status !== 'resolved' && complaint.status !== 'closed') {
      throw new BadRequestException('Can only add feedback to resolved complaints');
    }

    return this.prisma.hostelComplaint.update({
      where: { id },
      data: {
        feedback: dto.feedback,
        rating: dto.rating,
        status: 'closed',
      },
    });
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  async getStats(tenantId: string) {
    const [
      totalBlocks,
      totalRooms,
      totalCapacity,
      activeAllocations,
      pendingFees,
      openComplaints,
    ] = await Promise.all([
      this.prisma.hostelBlock.count({ where: { tenantId, status: 'active' } }),
      this.prisma.hostelRoom.count({ where: { tenantId } }),
      this.prisma.hostelRoom.aggregate({
        where: { tenantId },
        _sum: { capacity: true },
      }),
      this.prisma.hostelAllocation.count({ where: { tenantId, status: 'active' } }),
      this.prisma.hostelFee.aggregate({
        where: { tenantId, paymentStatus: { in: ['pending', 'partial'] } },
        _sum: { totalAmount: true, paidAmount: true },
      }),
      this.prisma.hostelComplaint.count({
        where: { tenantId, status: { in: ['open', 'in_progress'] } },
      }),
    ]);

    const occupancy = totalCapacity._sum.capacity
      ? Math.round((activeAllocations / Number(totalCapacity._sum.capacity)) * 100)
      : 0;

    return {
      totalBlocks,
      totalRooms,
      totalCapacity: Number(totalCapacity._sum.capacity) || 0,
      activeAllocations,
      occupancyRate: occupancy,
      pendingFeeAmount: Number(pendingFees._sum.totalAmount) - Number(pendingFees._sum.paidAmount) || 0,
      openComplaints,
    };
  }
}
