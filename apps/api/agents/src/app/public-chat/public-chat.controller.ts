import {
  Controller,
  Get,
  Post,
  Body,
  Param, Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReplicaService } from '../replica/replica.service';
import {Public} from "@nlc-ai/api-auth";
import {Observable} from "rxjs";

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

  @Get('coach/:coachID/thread/:threadID/messages')
  @ApiOperation({ summary: 'Get all messages in thread (public)' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getThreadMessages(
    @Param('coachID') coachID: string,
    @Param('threadID') threadID: string,
  ) {
    return this.replica.getThreadMessages(coachID, threadID);
  }

  @Post('coach/:coachID/thread/:threadID/stream')
  @ApiOperation({ summary: 'Stream assistant response (public)' })
  @ApiResponse({ status: 200, description: 'Streaming response' })
  @Sse()
  async streamAssistantResponse(
    @Param('coachID') coachID: string,
    @Param('threadID') threadID: string,
    @Body() body: { message: string }
  ): Promise<Observable<MessageEvent>> {
    return new Observable((observer) => {
      (async () => {
        try {
          const stream = await this.replica.streamAssistantResponse(
            coachID,
            threadID,
            body.message
          );

          let fullContent = '';

          stream
            .on('textCreated', () => {
              observer.next({ data: JSON.stringify({ type: 'start' }) } as MessageEvent);
            })
            .on('textDelta', (textDelta) => {
              const content = textDelta.value || '';
              fullContent += content;
              observer.next({
                data: JSON.stringify({
                  type: 'content',
                  content
                })
              } as MessageEvent);
            })
            .on('messageDone', async (message) => {
              // Save assistant message to database
              await this.replica.saveAssistantMessage(
                coachID,
                threadID,
                message.id,
                fullContent
              );

              observer.next({
                data: JSON.stringify({
                  type: 'done',
                  messageID: message.id,
                  fullContent
                })
              } as MessageEvent);
              observer.complete();
            })
            .on('error', (error) => {
              observer.error(error);
            });

        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }
}
