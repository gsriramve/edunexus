import {
  Controller,
  Get,
  Param,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ParentsService } from './parents.service';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  /**
   * Get all children linked to a parent user
   * Endpoint: GET /parents/children/:userId
   */
  @Get('children/:userId')
  getChildren(
    @Headers('x-tenant-id') tenantId: string,
    @Param('userId') userId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.parentsService.getChildren(tenantId, userId);
  }

  /**
   * Get parent profile by user ID
   * Endpoint: GET /parents/profile/:userId
   */
  @Get('profile/:userId')
  getProfile(
    @Headers('x-tenant-id') tenantId: string,
    @Param('userId') userId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.parentsService.getProfile(tenantId, userId);
  }

  /**
   * Get a specific child's details (validates parent has access)
   * Endpoint: GET /parents/children/:userId/:studentId
   */
  @Get('children/:userId/:studentId')
  getChild(
    @Headers('x-tenant-id') tenantId: string,
    @Param('userId') userId: string,
    @Param('studentId') studentId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    if (!studentId) {
      throw new BadRequestException('Student ID is required');
    }
    return this.parentsService.getChild(tenantId, userId, studentId);
  }
}
