import {
  Controller,
  Get,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CoachAnalyticsService } from './coach-analytics.service';
import { JwtAuthGuard, UserTypesGuard, UserTypes, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';

@ApiTags('Coach Analytics')
@Controller('coach')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin)
@ApiBearerAuth()
export class CoachAnalyticsController {
  constructor(private readonly coachAnalyticsService: CoachAnalyticsService) {}

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get complete coach dashboard data' })
  @ApiResponse({ status: 200, description: 'Coach dashboard data retrieved successfully' })
  getDashboardData(
    @Param('id') coachID: string,
    @CurrentUser() user: AuthUser
  ) {
    console.log("User: ", user);
    console.log("Coach ID: ", coachID);
    console.log("Is Equal: ", user.id === coachID);
    // Only allow coaches to access their own data, admins can access any
    if (user.type === UserType.coach && user.id !== coachID) {
      throw new ForbiddenException('Access denied');
    }

    return this.coachAnalyticsService.getDashboardData(coachID);
  }

  @Get(':id/client-email-stats')
  @ApiOperation({ summary: 'Get client email agent statistics' })
  @ApiResponse({ status: 200, description: 'Client email stats retrieved successfully' })
  getClientEmailStats(
    @Param('id') coachID: string,
    @CurrentUser() user: AuthUser
  ) {
    if (user.type === UserType.coach && user.id !== coachID) {
      throw new ForbiddenException('Access denied');
    }

    return this.coachAnalyticsService.getClientEmailStats(coachID);
  }

  @Get(':id/client-retention-stats')
  @ApiOperation({ summary: 'Get client retention agent statistics' })
  @ApiResponse({ status: 200, description: 'Client retention stats retrieved successfully' })
  getClientRetentionStats(
    @Param('id') coachID: string,
    @CurrentUser() user: AuthUser
  ) {
    if (user.type === UserType.coach && user.id !== coachID) {
      throw new ForbiddenException('Access denied');
    }

    return this.coachAnalyticsService.getClientRetentionStats(coachID);
  }

  @Get(':id/lead-followup-stats')
  @ApiOperation({ summary: 'Get lead follow-up agent statistics' })
  @ApiResponse({ status: 200, description: 'Lead follow-up stats retrieved successfully' })
  getLeadFollowUpStats(
    @Param('id') coachID: string,
    @CurrentUser() user: AuthUser
  ) {
    if (user.type === UserType.coach && user.id !== coachID) {
      throw new ForbiddenException('Access denied');
    }

    return this.coachAnalyticsService.getLeadFollowUpStats(coachID);
  }

  @Get(':id/content-creation-stats')
  @ApiOperation({ summary: 'Get content creation agent statistics' })
  @ApiResponse({ status: 200, description: 'Content creation stats retrieved successfully' })
  getContentCreationStats(
    @Param('id') coachID: string,
    @CurrentUser() user: AuthUser
  ) {
    if (user.type === UserType.coach && user.id !== coachID) {
      throw new ForbiddenException('Access denied');
    }

    return this.coachAnalyticsService.getContentCreationStats(coachID);
  }

  @Get(':id/coach-replica-stats')
  @ApiOperation({ summary: 'Get coach replica agent statistics' })
  @ApiResponse({ status: 200, description: 'Coach replica stats retrieved successfully' })
  getCoachReplicaStats(
    @Param('id') coachID: string,
    @CurrentUser() user: AuthUser
  ) {
    if (user.type === UserType.coach && user.id !== coachID) {
      throw new ForbiddenException('Access denied');
    }

    return this.coachAnalyticsService.getCoachReplicaStats(coachID);
  }
}
