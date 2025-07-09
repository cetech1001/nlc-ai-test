import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService} from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {CreateLeadDto, LeadQueryDto, UpdateLeadDto} from "./dto";

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all leads with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  findAll(@Query() query: LeadQueryDto) {
    return this.leadsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats() {
    return this.leadsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update lead status' })
  @ApiResponse({ status: 200, description: 'Lead status updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: string }
  ) {
    return this.leadsService.updateStatus(id, statusDto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lead (permanent deletion)' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
