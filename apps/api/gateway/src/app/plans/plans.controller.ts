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
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTypes } from '../auth/decorators/user-types.decorator';
import { UserTypesGuard } from '../auth/guards/user-types.guard';
import {UserType} from "@nlc-ai/types";

@ApiTags('Plans')
@Controller('plans')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@ApiBearerAuth()
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UserTypes(UserType.admin)
  @ApiOperation({ summary: 'Create a new subscription plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Plan name already exists' })
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  findAll(
    @Query('includeInactive') includeInactive?: string,
    @Query('includeDeleted') includeDeleted?: string
  ) {
    return this.plansService.findAll(
      includeInactive === 'true',
      includeDeleted === 'true'
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Get(':id/analytics')
  @UserTypes(UserType.admin)
  @ApiOperation({ summary: 'Get plan transactions' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  getAnalytics(@Param('id') id: string) {
    return this.plansService.getPlanAnalytics(id);
  }

  @Patch(':id')
  @UserTypes(UserType.admin)
  @ApiOperation({ summary: 'Update a subscription plan' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 409, description: 'Plan name already exists' })
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Patch(':id/toggle-status')
  @UserTypes(UserType.admin)
  @ApiOperation({ summary: 'Toggle plan active status' })
  @ApiResponse({ status: 200, description: 'Plan status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  toggleStatus(@Param('id') id: string) {
    return this.plansService.toggleStatus(id);
  }

  @Patch(':id/restore')
  @UserTypes(UserType.admin)
  @ApiOperation({ summary: 'Restore a deleted subscription plan' })
  @ApiResponse({ status: 200, description: 'Plan restored successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 400, description: 'Plan is not deleted' })
  @ApiResponse({ status: 409, description: 'Plan name already exists' })
  restore(@Param('id') id: string) {
    return this.plansService.restore(id);
  }

  @Delete(':id')
  @UserTypes(UserType.admin)
  @ApiOperation({ summary: 'Soft delete a subscription plan' })
  @ApiResponse({ status: 200, description: 'Plan marked for deletion successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete plan with active subscription' })
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
