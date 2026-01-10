import { Controller, Post, Get, Patch, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto, LeadResponseDto, LeadStatus } from './dto/leads.dto';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new lead from contact form' })
  @ApiResponse({ status: 201, description: 'Lead created successfully', type: LeadResponseDto })
  async createLead(@Body() dto: CreateLeadDto): Promise<LeadResponseDto> {
    return this.leadsService.createLead(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leads' })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  @ApiResponse({ status: 200, description: 'List of leads', type: [LeadResponseDto] })
  async getLeads(@Query('status') status?: LeadStatus): Promise<LeadResponseDto[]> {
    return this.leadsService.getLeads(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead details', type: LeadResponseDto })
  async getLeadById(@Param('id') id: string): Promise<LeadResponseDto | null> {
    return this.leadsService.getLeadById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lead status or notes' })
  @ApiResponse({ status: 200, description: 'Lead updated', type: LeadResponseDto })
  async updateLead(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ): Promise<LeadResponseDto> {
    return this.leadsService.updateLead(id, dto);
  }
}
