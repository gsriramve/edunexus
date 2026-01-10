import { Controller, Post, Get, Patch, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto, LeadResponseDto, LeadStatus } from './dto/leads.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createLead(@Body() dto: CreateLeadDto): Promise<LeadResponseDto> {
    return this.leadsService.createLead(dto);
  }

  @Get()
  async getLeads(@Query('status') status?: LeadStatus): Promise<LeadResponseDto[]> {
    return this.leadsService.getLeads(status);
  }

  @Get(':id')
  async getLeadById(@Param('id') id: string): Promise<LeadResponseDto | null> {
    return this.leadsService.getLeadById(id);
  }

  @Patch(':id')
  async updateLead(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ): Promise<LeadResponseDto> {
    return this.leadsService.updateLead(id, dto);
  }
}
