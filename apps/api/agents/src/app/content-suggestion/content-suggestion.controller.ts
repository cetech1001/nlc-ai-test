import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/types';
import { ContentSuggestionService } from './content-suggestion.service';

@ApiTags('Content Suggestion Agent')
@Controller('content-suggestion')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN)
@ApiBearerAuth()
export class ContentSuggestionController {
  constructor(
    private readonly contentSuggestionService: ContentSuggestionService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate content suggestion with script' })
  @ApiResponse({ status: 200, description: 'Content suggestion generated successfully' })
  async generateContentSuggestion(
    @CurrentUser() user: AuthUser,
    @Body() body: {
      idea: string;
      contentType?: string;
      targetPlatforms?: string[];
      customInstructions?: string;
    }
  ) {
    return this.contentSuggestionService.generateContentSuggestion(
      user.id,
      user.type,
      body.idea,
      body.contentType,
      body.targetPlatforms,
      body.customInstructions
    );
  }

  @Post('regenerate/:suggestionID')
  @ApiOperation({ summary: 'Regenerate existing content suggestion' })
  @ApiResponse({ status: 200, description: 'Content suggestion regenerated successfully' })
  async regenerateContentSuggestion(
    @CurrentUser() user: AuthUser,
    @Param('suggestionID') suggestionID: string,
    @Body() body?: { customInstructions?: string }
  ) {
    return this.contentSuggestionService.regenerateContentSuggestion(
      user.id,
      user.type,
      suggestionID,
      body?.customInstructions
    );
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get all generated content suggestions for coach' })
  @ApiResponse({ status: 200, description: 'Content suggestions retrieved successfully' })
  async getAllSuggestions(@CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.COACH ? user.id : user.id;
    return this.contentSuggestionService.getAllSuggestions(coachID);
  }

  @Get('suggestions/:suggestionID')
  @ApiOperation({ summary: 'Get specific content suggestion' })
  @ApiResponse({ status: 200, description: 'Content suggestion retrieved successfully' })
  async getSuggestion(
    @CurrentUser() user: AuthUser,
    @Param('suggestionID') suggestionID: string
  ) {
    const coachID = user.type === UserType.COACH ? user.id : user.id;
    return this.contentSuggestionService.getSuggestion(coachID, suggestionID);
  }

  @Post('suggestions/:suggestionID/update')
  @ApiOperation({ summary: 'Update content suggestion script' })
  @ApiResponse({ status: 200, description: 'Content suggestion updated successfully' })
  async updateSuggestion(
    @CurrentUser() user: AuthUser,
    @Param('suggestionID') suggestionID: string,
    @Body() body: {
      title?: string;
      script?: string;
      hook?: string;
      mainContent?: string;
      callToAction?: string;
    }
  ) {
    const coachID = user.type === UserType.COACH ? user.id : user.id;
    return this.contentSuggestionService.updateSuggestion(coachID, suggestionID, body);
  }

  @Get('analytics/top-performing')
  @ApiOperation({ summary: 'Get top performing content for suggestions' })
  @ApiResponse({ status: 200, description: 'Top performing content retrieved successfully' })
  async getTopPerformingContent(@CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.COACH ? user.id : user.id;
    return this.contentSuggestionService.getTopPerformingContent(coachID);
  }

  @Post('analyze-trends')
  @ApiOperation({ summary: 'Analyze content trends for better suggestions' })
  @ApiResponse({ status: 200, description: 'Content trends analyzed successfully' })
  async analyzeContentTrends(@CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.COACH ? user.id : user.id;
    return this.contentSuggestionService.analyzeContentTrends(coachID);
  }
}
