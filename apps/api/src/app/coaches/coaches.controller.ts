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
import { CoachesService } from './coaches.service';
import { CreateCoachDto, UpdateCoachDto } from './dto';
import { CoachQueryDto } from './dto/coach-query.dto';
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
  @ApiOperation({ summary: 'Get all coaches with advanced filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Coaches retrieved successfully' })
  findAll(@Query() query: CoachQueryDto) {
    return this.coachesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get coach statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats() {
    return this.coachesService.getCoachStats();
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
  @ApiOperation({ summary: 'Toggle coach active status (block/unblock)' })
  @ApiResponse({ status: 200, description: 'Coach status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  toggleStatus(@Param('id') id: string) {
    return this.coachesService.toggleStatus(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a deleted coach' })
  @ApiResponse({ status: 200, description: 'Coach restored successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  @ApiResponse({ status: 400, description: 'Coach is not deleted' })
  @ApiResponse({ status: 409, description: 'Coach email already exists' })
  restore(@Param('id') id: string) {
    return this.coachesService.restore(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a coach (soft delete)' })
  @ApiResponse({ status: 200, description: 'Coach deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  remove(@Param('id') id: string) {
    return this.coachesService.remove(id);
  }
}
