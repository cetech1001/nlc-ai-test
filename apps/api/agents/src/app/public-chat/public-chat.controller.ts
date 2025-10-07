import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReplicaService } from '../replica/replica.service';
import { PrismaService } from '@nlc-ai/api-database';
import {Public} from "@nlc-ai/api-auth";

@Public()
@ApiTags('Public Chatbot')
@Controller('public/chat')
export class PublicChatController {
  constructor(
    private readonly replicaService: ReplicaService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('coach/:coachID/info')
  @ApiOperation({ summary: 'Get public chatbot info for a coach' })
  @ApiResponse({ status: 200, description: 'Chatbot info retrieved' })
  async getChatbotInfo(@Param('coachID') coachID: string) {
    // Verify coach exists and has AI configured
    const config = await this.prisma.coachAIConfig.findUnique({
      where: { coachID },
      include: {
        coach: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!config || !config.assistantID) {
      throw new NotFoundException('Chatbot not found or not configured');
    }

    return {
      coachName: `${config.coach.firstName} ${config.coach.lastName}`,
      assistantName: config.assistantName,
      available: true,
    };
  }

  @Post('coach/:coachID/thread/create')
  @ApiOperation({ summary: 'Create new conversation thread (public)' })
  @ApiResponse({ status: 200, description: 'Thread created successfully' })
  async createThread(@Param('coachID') coachID: string) {
    // Verify coach has AI configured
    const config = await this.prisma.coachAIConfig.findUnique({
      where: { coachID },
    });

    if (!config || !config.assistantID) {
      throw new NotFoundException('Chatbot not configured');
    }

    return this.replicaService.createThread(coachID);
  }

  @Post('coach/:coachID/thread/:threadID/message')
  @ApiOperation({ summary: 'Add message to thread (public)' })
  @ApiResponse({ status: 200, description: 'Message added successfully' })
  async addMessageToThread(
    @Param('coachID') coachID: string,
    @Param('threadID') threadID: string,
    @Body() body: { message: string },
  ) {
    // Verify thread belongs to this coach
    const thread = await this.prisma.coachReplicaThread.findFirst({
      where: { coachID, openaiThreadID: threadID },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    return this.replicaService.addMessageToThread(
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
    // Verify thread belongs to this coach
    const thread = await this.prisma.coachReplicaThread.findFirst({
      where: { coachID, openaiThreadID: threadID },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    return this.replicaService.runAssistant(coachID, threadID);
  }

  @Get('coach/:coachID/thread/:threadID/run/:runID/status')
  @ApiOperation({ summary: 'Get run status (public)' })
  @ApiResponse({ status: 200, description: 'Run status retrieved' })
  async getRunStatus(
    @Param('coachID') coachID: string,
    @Param('threadID') threadID: string,
    @Param('runID') runID: string,
  ) {
    // Verify thread belongs to this coach
    const thread = await this.prisma.coachReplicaThread.findFirst({
      where: { coachID, openaiThreadID: threadID },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    return this.replicaService.getRunStatus(coachID, threadID, runID);
  }

  @Get('coach/:coachID/thread/:threadID/messages')
  @ApiOperation({ summary: 'Get all messages in thread (public)' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getThreadMessages(
    @Param('coachID') coachID: string,
    @Param('threadID') threadID: string,
  ) {
    // Verify thread belongs to this coach
    const thread = await this.prisma.coachReplicaThread.findFirst({
      where: { coachID, openaiThreadID: threadID },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    return this.replicaService.getThreadMessages(coachID, threadID);
  }
}
