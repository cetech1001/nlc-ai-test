import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/types';
import { EmailAgentService } from './email-agent.service';
import { Observable } from 'rxjs';

@ApiTags('Email Agent')
@Controller('email-agent')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN)
@ApiBearerAuth()
export class EmailAgentController {
  constructor(
    private readonly emailAgentService: EmailAgentService,
  ) {}

  @Post('generate-response')
  @ApiOperation({ summary: 'Generate email response for a thread' })
  @ApiResponse({ status: 200, description: 'Response generated successfully' })
  async generateEmailResponse(
    @CurrentUser() user: AuthUser,
    @Body() body: {
      threadID: string;
      messageContext?: string;
      saveResponse?: boolean;
    }
  ) {
    const { subject, body: emailBody } = await this.emailAgentService.generateEmailResponse(
      user.id,
      body.threadID,
      body.messageContext
    );

    let savedResponse;
    if (body.saveResponse) {
      savedResponse = await this.emailAgentService.saveGeneratedResponse(
        body.threadID,
        subject,
        emailBody,
        0.85
      );
    }

    return {
      subject,
      body: emailBody,
      threadID: body.threadID,
      responseID: savedResponse?.id,
    };
  }

  @Post('stream-response')
  @ApiOperation({ summary: 'Stream email response generation' })
  @ApiResponse({ status: 200, description: 'Streaming response' })
  @Sse()
  async streamEmailResponse(
    @CurrentUser() user: AuthUser,
    @Body() body: {
      threadID: string;
      messageContext?: string;
    }
  ): Promise<Observable<MessageEvent>> {
    return new Observable((observer) => {
      (async () => {
        try {
          const stream = await this.emailAgentService.streamEmailResponse(
            user.id,
            body.threadID,
            body.messageContext
          );

          let fullContent = '';

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullContent += content;

            observer.next({
              data: JSON.stringify({
                type: 'content',
                content,
              })
            } as MessageEvent);
          }

          observer.next({
            data: JSON.stringify({
              type: 'done',
              fullContent,
            })
          } as MessageEvent);

          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }

  @Post('response/:responseID/update')
  @ApiOperation({ summary: 'Update generated response with actual sent content' })
  @ApiResponse({ status: 200, description: 'Response updated successfully' })
  async updateGeneratedResponse(
    @CurrentUser() user: AuthUser,
    @Param('responseID') responseID: string,
    @Body() body: {
      actualSubject: string;
      actualBody: string;
    }
  ) {
    const updated = await this.emailAgentService.updateGeneratedResponse(
      responseID,
      body.actualSubject,
      body.actualBody
    );

    return {
      message: 'Response updated successfully',
      responseID: updated.id,
    };
  }

  @Get('info')
  @ApiOperation({ summary: 'Get email agent information and capabilities' })
  @ApiResponse({ status: 200, description: 'Email agent info retrieved successfully' })
  async getEmailAgentInfo(@CurrentUser() user: AuthUser) {
    return this.emailAgentService.getCoachEmailAgentInfo(user.id);
  }
}
