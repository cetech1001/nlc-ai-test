import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReplicaService } from '../replica/replica.service';
import {Public} from "@nlc-ai/api-auth";

@Public()
@ApiTags('Public Chatbot')
@Controller('public/chat')
export class PublicChatController {
  constructor(
    private readonly replica: ReplicaService,
  ) {}

  @Get('coach/:coachID/info')
  @ApiOperation({ summary: 'Get public chatbot info for a coach' })
  @ApiResponse({ status: 200, description: 'Chatbot info retrieved' })
  async getChatbotInfo(@Param('coachID') coachID: string) {
    const config = await this.replica.getAssistantInfo(coachID, true);

    return {
      coachName: `${config.coach.firstName} ${config.coach.lastName}`,
      assistantName: config.assistant.name,
      available: true,
    };
  }

  @Post('coach/:coachID/thread/create')
  @ApiOperation({ summary: 'Create new conversation thread (public)' })
  @ApiResponse({ status: 200, description: 'Thread created successfully' })
  async createThread(@Param('coachID') coachID: string) {
    return this.replica.createThread(coachID);
  }

  @Post('coach/:coachID/thread/:threadID/message')
  @ApiOperation({ summary: 'Add message to thread (public)' })
  @ApiResponse({ status: 200, description: 'Message added successfully' })
  async addMessageToThread(
    @Param('coachID') coachID: string,
    @Param('threadID') threadID: string,
    @Body() body: { message: string },
  ) {
    return this.replica.addMessageToThread(
      coachID,
      threadID,
      body.message,
    );
  }

  @Post('coach/:coachID/thread/:threadID/run')
  @ApiOperation({ summary: 'Run assistant on thread (public)' })
  @ApiResponse({ status: 200, description: 'Assistant run started' })
  async runAssistant(
    @Param('coachID') coachID: string,
    @Param('threadID') threadID: string,
  ) {
    return this.replica.runAssistant(coachID, threadID);
  }

  @Get('coach/:coachID/thread/:threadID/run/:runID/status')
  @ApiOperation({ summary: 'Get run status (public)' })
  @ApiResponse({ status: 200, description: 'Run status retrieved' })
  async getRunStatus(
    @Param('coachID') coachID: string,
    @Param('threadID') threadID: string,
    @Param('runID') runID: string,
  ) {
    return this.replica.getRunStatus(coachID, threadID, runID);
  }

  @Get('coach/:coachID/thread/:threadID/messages')
  @ApiOperation({ summary: 'Get all messages in thread (public)' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getThreadMessages(
    @Param('coachID') coachID: string,
    @Param('threadID') threadID: string,
  ) {
    return this.replica.getThreadMessages(coachID, threadID);
  }
}
