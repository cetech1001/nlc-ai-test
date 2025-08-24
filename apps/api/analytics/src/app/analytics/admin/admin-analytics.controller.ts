import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAnalyticsService } from './admin-analytics.service';
import { JwtAuthGuard, UserTypesGuard, UserTypes } from '@nlc-ai/api-auth';
import { UserType } from '@nlc-ai/api-types';

@ApiTags('Admin Analytics')
@Controller('admin')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.admin)
@ApiBearerAuth()
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get complete admin dashboard data' })
  @ApiResponse({ status: 200, description: 'Admin dashboard data retrieved successfully' })
  getDashboardData() {
    return this.adminAnalyticsService.getDashboardData();
  }

  @Get('transaction-stats')
  @ApiOperation({ summary: 'Get transaction statistics for admin' })
  @ApiResponse({ status: 200, description: 'Transaction statistics retrieved successfully' })
  getTransactionStats() {
    return this.adminAnalyticsService.getTransactionStats();
  }

  @Get('coach-performance')
  @ApiOperation({ summary: 'Get coach performance metrics' })
  @ApiResponse({ status: 200, description: 'Coach performance metrics retrieved successfully' })
  getCoachPerformance() {
    return this.adminAnalyticsService.getCoachPerformance();
  }

  @Get('revenue-trends')
  @ApiOperation({ summary: 'Get revenue trends analysis' })
  @ApiResponse({ status: 200, description: 'Revenue trends retrieved successfully' })
  getRevenueTrends() {
    return this.adminAnalyticsService.getRevenueTrends();
  }
}
