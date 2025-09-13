import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CommunityAnalyticsService } from './community-analytics.service';
import { JwtAuthGuard, UserTypesGuard, UserTypes } from '@nlc-ai/api-auth';
import { UserType } from '@nlc-ai/api-types';
import { AnalyticsQueryDto } from '../dto';

@ApiTags('Community Analytics')
@Controller('community')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.admin)
@ApiBearerAuth()
export class CommunityAnalyticsController {
  constructor(private readonly communityAnalyticsService: CommunityAnalyticsService) {}

  @Get(':communityID/analytics')
  @ApiOperation({ summary: 'Get community analytics data' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Community analytics retrieved successfully' })
  getCommunityAnalytics(
    @Param('communityID') communityID: string,
    @Query() query: AnalyticsQueryDto
  ) {
    return this.communityAnalyticsService.getCommunityAnalytics(communityID, query);
  }

  @Get(':communityID/member-analytics')
  @ApiOperation({ summary: 'Get community member analytics' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Member analytics retrieved successfully' })
  getMemberAnalytics(
    @Param('communityID') communityID: string,
    @Query() query: AnalyticsQueryDto
  ) {
    return this.communityAnalyticsService.getMemberAnalytics(communityID, query);
  }

  @Get(':communityID/engagement-metrics')
  @ApiOperation({ summary: 'Get community engagement metrics' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Engagement metrics retrieved successfully' })
  getEngagementMetrics(
    @Param('communityID') communityID: string,
    @Query() query: AnalyticsQueryDto
  ) {
    return this.communityAnalyticsService.getEngagementMetrics(communityID, query);
  }

  @Get(':communityID/content-analytics')
  @ApiOperation({ summary: 'Get community content analytics' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Content analytics retrieved successfully' })
  getContentAnalytics(
    @Param('communityID') communityID: string,
    @Query() query: AnalyticsQueryDto
  ) {
    return this.communityAnalyticsService.getContentAnalytics(communityID, query);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get communities overview analytics' })
  @ApiResponse({ status: 200, description: 'Communities overview retrieved successfully' })
  getCommunitiesOverview(@Query() query: AnalyticsQueryDto) {
    return this.communityAnalyticsService.getCommunitiesOverview(query);
  }
}
