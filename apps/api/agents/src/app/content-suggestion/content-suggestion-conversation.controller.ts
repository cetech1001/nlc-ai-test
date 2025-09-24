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
import { ContentSuggestionConversationService } from './content-suggestion-conversation.service';

@ApiTags('Content Creation Assistant')
@Controller('content-suggestion/chat')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN)
@ApiBearerAuth()
export class ContentSuggestionConversationController {
  constructor(
    private readonly conversationService: ContentSuggestionConversationService,
  ) {}

  @Post('start')
  @ApiOperation({ summary: 'Start new content creation conversation' })
  @ApiResponse({ status: 201, description: 'Conversation started successfully' })
  async startConversation(
    @CurrentUser() user: AuthUser,
    @Body() body: {
      message: string;
      title?: string;
    }
  ) {
    const coachID = user.type === UserType.COACH ? user.id : user.id;
    return this.conversationService.startContentConversation(
      coachID,
      body.message,
      body.title
    );
  }

  @Post(':conversationID/message')
  @ApiOperation({ summary: 'Send message in conversation' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  async sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('conversationID') conversationID: string,
    @Body() body: { message: string }
  ) {
    const coachID = user.type === UserType.COACH ? user.id : user.id;
    return this.conversationService.sendMessage(conversationID, body.message, coachID);
  }

  @Get(':conversationID')
  @ApiOperation({ summary: 'Get conversation with full history' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully' })
  async getConversation(
    @CurrentUser() user: AuthUser,
    @Param('conversationID') conversationID: string
  ) {
    const coachID = user.type === UserType.COACH ? user.id : user.id;
    return this.conversationService.getConversation(conversationID, coachID);
  }

  @Get()
  @ApiOperation({ summary: 'Get all content creation conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  async getConversations(@CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.COACH ? user.id : user.id;
    return this.conversationService.getConversations(coachID);
  }

  @Post(':conversationID/artifact')
  @ApiOperation({ summary: 'Generate content artifact' })
  @ApiResponse({ status: 201, description: 'Artifact created successfully' })
  async createArtifact(
    @CurrentUser() user: AuthUser,
    @Param('conversationID') conversationID: string,
    @Body() body: {
      type: 'content_script' | 'social_post' | 'blog_outline';
      title: string;
      requirements: {
        platform?: string[];
        contentType?: string;
        targetAudience?: string;
        tone?: string;
        length?: string;
      };
    }
  ) {
    const coachID = user.type === UserType.COACH ? user.id : user.id;
    return this.conversationService.generateContentArtifact(
      conversationID,
      coachID,
      body.type,
      body.title,
      body.requirements
    );
  }

  @Post(':conversationID/artifact/:artifactID/refine')
  @ApiOperation({ summary: 'Refine existing artifact' })
  @ApiResponse({ status: 200, description: 'Artifact refined successfully' })
  async refineArtifact(
    @CurrentUser() user: AuthUser,
    @Param('conversationID') conversationID: string,
    @Param('artifactID') artifactID: string,
    @Body() body: {
      refinements: string;
      changes?: {
        tone?: string;
        length?: string;
        focus?: string;
      };
    }
  ) {
    const coachID = user.type === UserType.COACH ? user.id : user.id;
    return this.conversationService.refineArtifact(
      conversationID,
      artifactID,
      coachID,
      body.refinements,
      body.changes
    );
  }
}
