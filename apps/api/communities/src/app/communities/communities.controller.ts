import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { type AuthUser, UserType } from '@nlc-ai/api-types';
import { CommunitiesService } from './communities.service';
import {
  CreateCommunityDto,
  UpdateCommunityDto,
  CommunityFiltersDto,
  AddMemberDto,
  CommunityMemberFiltersDto,
} from './dto';

@ApiTags('Community')
@Controller('')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin, UserType.client)
@ApiBearerAuth()
export class CommunitiesController {
  constructor(private readonly communityService: CommunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new community' })
  @ApiResponse({ status: 201, description: 'Community created successfully' })
  @UserTypes(UserType.coach, UserType.admin)
  async createCommunity(
    @Body() createDto: CreateCommunityDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.createCommunity(createDto, user);
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific community' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Community retrieved successfully' })
  async getCommunity(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.getCommunity(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update community' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Community updated successfully' })
  @UserTypes(UserType.coach, UserType.admin)
  async updateCommunity(
    @Param('id') id: string,
    @Body() updateDto: UpdateCommunityDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.updateCommunity(id, updateDto, user);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to community' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @UserTypes(UserType.coach, UserType.admin)
  async addMember(
    @Param('id') communityID: string,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.addMemberToCommunity(
      communityID,
      addMemberDto.userID,
      addMemberDto.userType,
      addMemberDto.role,
      user.id
    );
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get community members' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Members retrieved successfully' })
  async getCommunityMembers(
    @Param('id') id: string,
    @Query() filters: CommunityMemberFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.getCommunityMembers(id, filters, user);
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
  @UserTypes(UserType.coach, UserType.admin)
  async getCommunityAnalytics(
    @Param('id') id: string,
    @Query('period') period: '7d' | '30d' | '90d' = '30d',
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.getCommunityAnalytics(id, period, user);
  }

  @Delete(':id/members/:userID/:userType')
  @ApiOperation({ summary: 'Remove member from community' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiParam({ name: 'userID', description: 'User ID' })
  @ApiParam({ name: 'userType', description: 'User Type' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @UserTypes(UserType.coach, UserType.admin)
  async removeMember(
    @Param('id') communityID: string,
    @Param('userID') userID: string,
    @Param('userType') userType: UserType,
    @CurrentUser() user: AuthUser
  ) {
    return this.communityService.removeMemberFromCommunity(
      communityID,
      userID,
      userType,
      user,
    );
  }
}
