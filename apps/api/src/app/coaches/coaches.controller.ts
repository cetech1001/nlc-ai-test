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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoachesService, type CoachStatus } from './coaches.service';
import { CreateCoachDto, UpdateCoachDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Coaches')
@Controller('coaches')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all coaches with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'blocked'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Coaches retrieved successfully' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: CoachStatus,
    @Query('search') search?: string,
  ) {
    return this.coachesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
      search,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get coach statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats() {
    return this.coachesService.getCoachStats();
  }

  @Get('inactive')
  @ApiOperation({ summary: 'Get inactive coaches' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Inactive coaches retrieved successfully' })
  getInactiveCoaches(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.coachesService.getInactiveCoaches(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific coach by ID' })
  @ApiResponse({ status: 200, description: 'Coach retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  findOne(@Param('id') id: string) {
    return this.coachesService.findOne(id);
  }

  @Get(':id/kpis')
  @ApiOperation({ summary: 'Get coach KPIs' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  getKpis(
    @Param('id') id: string,
    @Query('days') days?: string,
  ) {
    return this.coachesService.getCoachKpis(
      id,
      days ? parseInt(days) : 30,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new coach' })
  @ApiResponse({ status: 201, description: 'Coach created successfully' })
  create(@Body() createCoachDto: CreateCoachDto) {
    return this.coachesService.create(createCoachDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a coach' })
  @ApiResponse({ status: 200, description: 'Coach updated successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  update(@Param('id') id: string, @Body() updateCoachDto: UpdateCoachDto) {
    return this.coachesService.update(id, updateCoachDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle coach active status' })
  @ApiResponse({ status: 200, description: 'Coach status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  toggleStatus(@Param('id') id: string) {
    return this.coachesService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a coach' })
  @ApiResponse({ status: 200, description: 'Coach deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  remove(@Param('id') id: string) {
    return this.coachesService.remove(id);
  }
}
