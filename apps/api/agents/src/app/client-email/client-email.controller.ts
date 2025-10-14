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
import { ClientEmailService } from './client-email.service';
import { Observable } from 'rxjs';

@ApiTags('Client Email Agent')
@Controller('client-email')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN)
@ApiBearerAuth()
export class ClientEmailController {
  constructor(
    private readonly emailAgentService: ClientEmailService,
  ) {}

  @Post('stream-response')
  @ApiOperation({ summary: 'Stream email response generation' })
  @ApiResponse({ status: 200, description: 'Streaming email response' })
  @Sse()
  async streamEmailResponse(
    @CurrentUser() user: AuthUser,
    @Body() body: {
      threadID: string;
      messageContext?: string;
      saveResponse?: boolean;
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
          let subject = '';
          let emailBody = '';

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

          // Parse the complete response
          const parsed = this.parseEmailContent(fullContent);
          subject = parsed.subject;
          emailBody = parsed.body;

          // Save if requested
          let savedResponse;
          if (body.saveResponse) {
            savedResponse = await this.emailAgentService.saveGeneratedResponse(
              body.threadID,
              subject,
              emailBody,
              0.85
            );
          }

          observer.next({
            data: JSON.stringify({
              type: 'done',
              subject,
              body: emailBody,
              fullContent,
              responseID: savedResponse?.id,
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

  private parseEmailContent(content: string): { subject: string; body: string } {
    const subjectMatch = content.match(/^Subject:\s*(.+?)$/im);

    if (subjectMatch) {
      const subject = subjectMatch[1].trim();
      const body = content.replace(/^Subject:.*$/im, '').trim();
      return { subject, body };
    }

    // Fallback if no subject line found
    return {
      subject: 'Re: Your message',
      body: content.trim()
    };
  }
}
