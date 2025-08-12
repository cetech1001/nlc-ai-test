import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto';
import { PlanFilters } from './types/plan.interfaces';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data or plan name already exists' })
  async createPlan(@Body() data: CreatePlanDto) {
    return this.plansService.createPlan(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all plans with filtering' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async findAllPlans(@Query() filters: PlanFilters) {
    return this.plansService.findAllPlans(filters);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active plans' })
  @ApiResponse({ status: 200, description: 'Active plans retrieved successfully' })
  async findActivePlans() {
    return this.plansService.findActivePlans();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async findPlanById(@Param('id') id: string) {
    return this.plansService.findPlanById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a plan' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async updatePlan(@Param('id') id: string, @Body() data: UpdatePlanDto) {
    return this.plansService.updatePlan(id, data);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a plan' })
  @ApiResponse({ status: 200, description: 'Plan deactivated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot deactivate plan with active subscriptions' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async deactivatePlan(@Param('id') id: string) {
    return this.plansService.deactivatePlan(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a plan' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete plan with existing subscriptions or transactions' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async softDeletePlan(@Param('id') id: string) {
    return this.plansService.softDeletePlan(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get plan statistics' })
  @ApiResponse({ status: 200, description: 'Plan statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlanStats(@Param('id') id: string) {
    return this.plansService.getPlanStats(id);
  }
}
