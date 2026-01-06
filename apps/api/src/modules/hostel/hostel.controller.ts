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
} from '@nestjs/common';
import { HostelService } from './hostel.service';
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

@Controller('hostel')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  // =============================================================================
  // BLOCKS
  // =============================================================================

  @Post('blocks')
  createBlock(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateBlockDto,
  ) {
    return this.hostelService.createBlock(tenantId, dto);
  }

  @Get('blocks')
  findAllBlocks(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: BlockQueryDto,
  ) {
    return this.hostelService.findAllBlocks(tenantId, query);
  }

  @Get('blocks/:id')
  findBlockById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.hostelService.findBlockById(tenantId, id);
  }

  @Patch('blocks/:id')
  updateBlock(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBlockDto,
  ) {
    return this.hostelService.updateBlock(tenantId, id, dto);
  }

  @Delete('blocks/:id')
  deleteBlock(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.hostelService.deleteBlock(tenantId, id);
  }

  // =============================================================================
  // ROOMS
  // =============================================================================

  @Post('rooms')
  createRoom(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateRoomDto,
  ) {
    return this.hostelService.createRoom(tenantId, dto);
  }

  @Post('rooms/bulk')
  bulkCreateRooms(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: BulkCreateRoomsDto,
  ) {
    return this.hostelService.bulkCreateRooms(tenantId, dto);
  }

  @Get('rooms')
  findAllRooms(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: RoomQueryDto,
  ) {
    return this.hostelService.findAllRooms(tenantId, query);
  }

  @Get('rooms/:id')
  findRoomById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.hostelService.findRoomById(tenantId, id);
  }

  @Patch('rooms/:id')
  updateRoom(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.hostelService.updateRoom(tenantId, id, dto);
  }

  @Delete('rooms/:id')
  deleteRoom(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.hostelService.deleteRoom(tenantId, id);
  }

  // =============================================================================
  // ALLOCATIONS
  // =============================================================================

  @Post('allocations')
  createAllocation(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateAllocationDto,
  ) {
    return this.hostelService.createAllocation(tenantId, dto);
  }

  @Get('allocations')
  findAllAllocations(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: AllocationQueryDto,
  ) {
    return this.hostelService.findAllAllocations(tenantId, query);
  }

  @Get('allocations/student/:studentId')
  getStudentAllocation(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.hostelService.getStudentAllocation(tenantId, studentId);
  }

  @Get('allocations/:id')
  findAllocationById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.hostelService.findAllocationById(tenantId, id);
  }

  @Patch('allocations/:id')
  updateAllocation(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAllocationDto,
  ) {
    return this.hostelService.updateAllocation(tenantId, id, dto);
  }

  @Post('allocations/:id/transfer')
  transferAllocation(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: TransferAllocationDto,
  ) {
    return this.hostelService.transferAllocation(tenantId, id, dto);
  }

  // =============================================================================
  // HOSTEL FEES
  // =============================================================================

  @Post('fees')
  createHostelFee(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateHostelFeeDto,
  ) {
    return this.hostelService.createHostelFee(tenantId, dto);
  }

  @Get('fees')
  findAllHostelFees(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: HostelFeeQueryDto,
  ) {
    return this.hostelService.findAllHostelFees(tenantId, query);
  }

  @Get('fees/student/:studentId')
  getStudentHostelFees(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.hostelService.getStudentHostelFees(tenantId, studentId);
  }

  @Patch('fees/:id')
  updateHostelFee(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateHostelFeeDto,
  ) {
    return this.hostelService.updateHostelFee(tenantId, id, dto);
  }

  // =============================================================================
  // MESS MENU
  // =============================================================================

  @Post('menu')
  createMessMenu(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateMessMenuDto,
  ) {
    return this.hostelService.createMessMenu(tenantId, dto);
  }

  @Get('menu')
  findAllMessMenus(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: MessMenuQueryDto,
  ) {
    return this.hostelService.findAllMessMenus(tenantId, query);
  }

  @Get('menu/weekly')
  getWeeklyMenu(
    @Headers('x-tenant-id') tenantId: string,
    @Query('blockId') blockId?: string,
  ) {
    return this.hostelService.getWeeklyMenu(tenantId, blockId);
  }

  @Patch('menu/:id')
  updateMessMenu(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMessMenuDto,
  ) {
    return this.hostelService.updateMessMenu(tenantId, id, dto);
  }

  @Delete('menu/:id')
  deleteMessMenu(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.hostelService.deleteMessMenu(tenantId, id);
  }

  // =============================================================================
  // COMPLAINTS
  // =============================================================================

  @Post('complaints')
  createComplaint(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateComplaintDto,
  ) {
    return this.hostelService.createComplaint(tenantId, dto);
  }

  @Get('complaints')
  findAllComplaints(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: ComplaintQueryDto,
  ) {
    return this.hostelService.findAllComplaints(tenantId, query);
  }

  @Get('complaints/student/:studentId')
  getStudentComplaints(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.hostelService.getStudentComplaints(tenantId, studentId);
  }

  @Get('complaints/:id')
  findComplaintById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.hostelService.findComplaintById(tenantId, id);
  }

  @Patch('complaints/:id')
  updateComplaint(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateComplaintDto,
  ) {
    return this.hostelService.updateComplaint(tenantId, id, dto);
  }

  @Post('complaints/:id/feedback')
  addComplaintFeedback(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: ComplaintFeedbackDto,
  ) {
    return this.hostelService.addComplaintFeedback(tenantId, id, dto);
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  @Get('stats')
  getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.hostelService.getStats(tenantId);
  }
}
