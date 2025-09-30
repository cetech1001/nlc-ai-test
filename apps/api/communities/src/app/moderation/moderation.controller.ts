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
  ApiQuery,
} from '@nestjs/swagger';
import { CurrentUser, UserTypes, UserTypesGuard } from '@nlc-ai/api-auth';
import { type AuthUser, UserType } from '@nlc-ai/api-types';
import { ModerationService } from './moderation.service';
import {
  ModerationFiltersDto,
  ModerationActionDto,
  CreateModerationRuleDto,
  UpdateModerationRuleDto,
  ReportContentDto,
} from './dto';

@ApiTags('Moderation')
@Controller(':communityID/moderation')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.admin, UserType.coach)
@ApiBearerAuth()
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get moderation statistics' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Moderation stats retrieved successfully' })
  async getModerationStats(
    @Param('communityID') communityID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.moderationService.getModerationStats(communityID, user);
  }

  @Get('flagged')
  @ApiOperation({ summary: 'Get flagged content' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Flagged content retrieved successfully' })
  async getFlaggedContent(
    @Param('communityID') communityID: string,
    @Query() filters: ModerationFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.moderationService.getFlaggedContent(communityID, filters, user);
  }

  @Get('actions')
  @ApiOperation({ summary: 'Get moderation actions log' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Moderation actions retrieved successfully' })
  async getModerationActions(
    @Param('communityID') communityID: string,
    @Query() filters: ModerationFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.moderationService.getModerationActions(communityID, filters, user);
  }

  @Post('content/:contentID/action')
  @ApiOperation({ summary: 'Take moderation action on content' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiParam({ name: 'contentID', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Moderation action completed successfully' })
  async moderateContent(
    @Param('communityID') communityID: string,
    @Param('contentID') contentID: string,
    @Body() action: ModerationActionDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.moderationService.moderateContent(communityID, contentID, action, user);
  }

  @Post('members/:memberID/action')
  @ApiOperation({ summary: 'Take moderation action on member' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiParam({ name: 'memberID', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Member moderation completed successfully' })
  async moderateMember(
    @Param('communityID') communityID: string,
    @Param('memberID') memberID: string,
    @Body() action: ModerationActionDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.moderationService.moderateMember(communityID, memberID, action, user);
  }

  @Post('report')
  @ApiOperation({ summary: 'Report content for moderation' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 201, description: 'Content reported successfully' })
  @UserTypes(UserType.admin, UserType.coach, UserType.client)
  async reportContent(
    @Param('communityID') communityID: string,
    @Body() report: ReportContentDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.moderationService.reportContent(communityID, report, user);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get moderation rules' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Moderation rules retrieved successfully' })
  async getModerationRules(
    @Param('communityID') communityID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.moderationService.getModerationRules(communityID, user);
  }

  @Post('rules')
  @ApiOperation({ summary: 'Create moderation rule' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 201, description: 'Moderation rule created successfully' })
  async createModerationRule(
    @Param('communityID') communityID: string,
    @Body() rule: CreateModerationRuleDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.moderationService.createModerationRule(communityID, rule, user);
  }

  @Put('rules/:ruleID')
  @ApiOperation({ summary: 'Update moderation rule' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiParam({ name: 'ruleID', description: 'Rule ID' })
  @ApiResponse({ status: 200, description: 'Moderation rule updated successfully' })
  async updateModerationRule(
    @Param('communityID') communityID: string,
    @Param('ruleID') ruleID: string,
    @Body() updates: UpdateModerationRuleDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.moderationService.updateModerationRule(communityID, ruleID, updates, user);
  }

  @Delete('rules/:ruleID')
  @ApiOperation({ summary: 'Delete moderation rule' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiParam({ name: 'ruleID', description: 'Rule ID' })
  @ApiResponse({ status: 200, description: 'Moderation rule deleted successfully' })
  async deleteModerationRule(
    @Param('communityID') communityID: string,
    @Param('ruleID') ruleID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.moderationService.deleteModerationRule(communityID, ruleID, user);
  }

  @Get('ai-insights')
  @ApiOperation({ summary: 'Get AI moderation insights' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d'] })
  @ApiResponse({ status: 200, description: 'AI insights retrieved successfully' })
  async getAIModerationInsights(
    @Param('communityID') communityID: string,
    @Query('period') period: '7d' | '30d' | '90d' = '30d',
    @CurrentUser() user: AuthUser
  ) {
    return this.moderationService.getAIModerationInsights(communityID, period, user);
  }
}
