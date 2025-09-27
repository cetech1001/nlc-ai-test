import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto';
import { JwtAuthGuard, UserTypesGuard, UserTypes, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly userAnalyticsService: AnalyticsService) {}

  @Get('platform')
  @UserTypes(UserType.admin)
  @ApiOperation({ summary: 'Get platform-wide analytics' })
  @ApiResponse({ status: 200, description: 'Platform analytics retrieved successfully' })
  getPlatformAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.userAnalyticsService.getPlatformAnalytics(query);
  }

  @Get('coaches/overview')
  @UserTypes(UserType.admin)
  @ApiOperation({ summary: 'Get coaches overview analytics' })
  @ApiResponse({ status: 200, description: 'Coaches analytics retrieved successfully' })
  getCoachesOverview(@Query() query: AnalyticsQueryDto) {
    return this.userAnalyticsService.getCoachesOverview(query);
  }

  @Get('clients/overview')
  @UserTypes(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Get clients overview analytics' })
  @ApiResponse({ status: 200, description: 'Clients analytics retrieved successfully' })
  getClientsOverview(@Query() query: AnalyticsQueryDto, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : query.coachID;
    return this.userAnalyticsService.getClientsOverview(query, coachID);
  }

  @Get('coach/:id/detailed')
  @UserTypes(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Get detailed analytics for a specific coach' })
  @ApiResponse({ status: 200, description: 'Coach analytics retrieved successfully' })
  getCoachDetailedAnalytics(
    @Param('id') coachID: string,
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() user: AuthUser
  ) {
    if (user.type === UserType.coach && user.id !== coachID) {
      throw new ForbiddenException('Access denied');
    }
    return this.userAnalyticsService.getCoachDetailedAnalytics(coachID, query);
  }

  @Get('engagement-trends')
  @UserTypes(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Get user engagement trends' })
  @ApiResponse({ status: 200, description: 'Engagement trends retrieved successfully' })
  getEngagementTrends(@Query() query: AnalyticsQueryDto, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : query.coachID;
    return this.userAnalyticsService.getEngagementTrends(query, coachID);
  }
}
