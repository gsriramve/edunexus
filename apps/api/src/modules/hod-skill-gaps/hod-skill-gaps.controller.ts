import { Controller, Get, Query, Headers, BadRequestException } from '@nestjs/common';
import { HodSkillGapsService } from './hod-skill-gaps.service';
import { QuerySkillGapsDto } from './dto/hod-skill-gaps.dto';

@Controller('hod-skill-gaps')
export class HodSkillGapsController {
  constructor(private readonly hodSkillGapsService: HodSkillGapsService) {}

  /**
   * Get skill gaps analysis for HOD's department
   */
  @Get()
  async getSkillGaps(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QuerySkillGapsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.hodSkillGapsService.getSkillGaps(tenantId, userId, query);
  }
}
