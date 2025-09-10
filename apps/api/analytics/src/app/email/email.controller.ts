import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType } from '@nlc-ai/api-types';

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailAnalyticsService: EmailService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get email metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getEmailMetrics(
    @CurrentUser('id') coachID: string,
    @Query('days') days?: string,
  ) {
    const daysParsed = days ? parseInt(days) : 30;
    const dateRange = {
      start: new Date(Date.now() - daysParsed * 24 * 60 * 60 * 1000),
      end: new Date(),
    };

    return this.emailAnalyticsService.getEmailMetrics(coachID, dateRange);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get template performance' })
  @ApiResponse({ status: 200, description: 'Template performance retrieved successfully' })
  async getTemplatePerformance(
    @CurrentUser('id') coachID: string,
    @Query('days') days?: string,
  ) {
    const daysParsed = days ? parseInt(days) : 30;
    const dateRange = {
      start: new Date(Date.now() - daysParsed * 24 * 60 * 60 * 1000),
      end: new Date(),
    };

    return this.emailAnalyticsService.getTemplatePerformance(coachID, dateRange);
  }

  @Get('sequences')
  @ApiOperation({ summary: 'Get sequence performance' })
  @ApiResponse({ status: 200, description: 'Sequence performance retrieved successfully' })
  async getSequencePerformance(
    @CurrentUser('id') coachID: string,
    @Query('days') days?: string,
  ) {
    const daysParsed = days ? parseInt(days) : 30;
    const dateRange = {
      start: new Date(Date.now() - daysParsed * 24 * 60 * 60 * 1000),
      end: new Date(),
    };

    return this.emailAnalyticsService.getSequencePerformance(coachID, dateRange);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get engagement trends' })
  @ApiResponse({ status: 200, description: 'Engagement trends retrieved successfully' })
  async getEngagementTrends(
    @CurrentUser('id') coachID: string,
    @Query('days') days?: string,
  ) {
    const daysParsed = days ? parseInt(days) : 30;
    return this.emailAnalyticsService.getEngagementTrends(coachID, daysParsed);
  }
}
