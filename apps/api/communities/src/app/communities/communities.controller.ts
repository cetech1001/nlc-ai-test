import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser, UserTypes, UserTypesGuard } from '@nlc-ai/api-auth';
import { type AuthUser, UserType } from '@nlc-ai/types';
import { CommunitiesService } from './communities.service';
import {
  CreateCommunityDto,
  UpdateCommunityDto,
  CommunityFiltersDto,
} from './dto';

@ApiTags('Community')
@Controller('')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN, UserType.CLIENT)
@ApiBearerAuth()
export class CommunitiesController {
  constructor(private readonly communityService: CommunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new community' })
  @ApiResponse({ status: 201, description: 'Community created successfully' })
  @UserTypes(UserType.COACH, UserType.ADMIN)
  async createCommunity(
    @Body() createDto: CreateCommunityDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.createCommunity(createDto, user.id, user.type);
  }

  @Get()
  @ApiOperation({ summary: 'Get communities' })
  @ApiResponse({ status: 200, description: 'Communities retrieved successfully' })
  async getCommunities(
    @Query() filters: CommunityFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.getCommunities(filters, user);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get overall community statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @UserTypes(UserType.ADMIN)
  async getCommunityStats() {
    return this.communityService.getCommunityStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific community by id' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Community retrieved successfully' })
  async getCommunity(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.getCommunityByID(id, user);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a specific community by slug' })
  @ApiParam({ name: 'slug', description: 'Community Slug' })
  @ApiResponse({ status: 200, description: 'Community retrieved successfully' })
  async getCommunityBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.getCommunityBySlug(slug, user);
  }

  @Get('coach/:coachID')
  @ApiOperation({ summary: 'Get a coach\'s community' })
  @ApiParam({ name: 'coachID', description: 'Coach ID' })
  @ApiResponse({ status: 200, description: 'Community retrieved successfully' })
  async getCoachCommunity(
    @Param('coachID') coachID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.getCoachCommunity(coachID, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update community' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Community updated successfully' })
  @UserTypes(UserType.COACH, UserType.ADMIN)
  async updateCommunity(
    @Param('id') id: string,
    @Body() updateDto: UpdateCommunityDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.updateCommunity(id, updateDto, user);
  }

  @Get('user/:userID')
  @UserTypes(UserType.CLIENT)
  @ApiOperation({ summary: 'Get a user\'s communities' })
  @ApiResponse({ status: 200, description: 'Communities retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyCommunities(@CurrentUser() user: AuthUser) {
    return this.communityService.getUserCommunities(user.id);
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get community activity feed' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Activity feed retrieved successfully' })
  async getCommunityActivity(
    @Param('id') id: string,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.getCommunityActivity(id, limit, user);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get community analytics' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @UserTypes(UserType.COACH, UserType.ADMIN)
  async getCommunityAnalytics(
    @Param('id') id: string,
    @Query('period') period: '7d' | '30d' | '90d' = '30d',
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.getCommunityAnalytics(id, period, user);
  }
}
