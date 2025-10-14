import {
  Controller,
  Get,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { S3EmailService } from '../sync/services/s3-email.service';
import { PrismaService } from '@nlc-ai/api-database';

@ApiTags('Internal')
@Controller('internal')
export class EmailInternalController {
  constructor(
    private readonly s3EmailService: S3EmailService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Verify internal service request
   */
  private verifyInternalRequest(headers: any): void {
    const internalServiceHeader = headers['x-internal-service'];

    if (internalServiceHeader !== 'agents') {
      throw new UnauthorizedException('Invalid internal service credentials');
    }
  }

  @Get('threads/:threadID/messages')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: '[INTERNAL] Get thread messages from S3' })
  @ApiResponse({ status: 200, description: 'Thread messages retrieved successfully' })
  async getThreadMessages(
    @Param('threadID') threadID: string,
    @Headers() headers: any,
  ) {
    this.verifyInternalRequest(headers);

    const coachID = headers['x-coach-id'];
    if (!coachID) {
      throw new UnauthorizedException('Missing coach ID header');
    }

    // Get thread from database to get the provider threadID
    const emailThread = await this.prisma.emailThread.findFirst({
      where: {
        id: threadID,
        userID: coachID,
      },
    });

    if (!emailThread) {
      return { messages: [] };
    }

    // Fetch messages from S3
    const messages = await this.s3EmailService.getThreadMessages(
      coachID,
      emailThread.threadID
    );

    return { messages };
  }

  @Get('fine-tuning/coach/:coachID/emails')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: '[INTERNAL] Get coach emails for fine-tuning' })
  @ApiResponse({ status: 200, description: 'Coach emails retrieved successfully' })
  async getCoachEmailsForFineTuning(
    @Param('coachID') coachID: string,
    @Headers() headers: any,
  ) {
    this.verifyInternalRequest(headers);

    // Get email cache entries
    const emailCache = await this.prisma.coachEmailCache.findMany({
      where: {
        coachID,
        isFromCoach: true,
        isToClientOrLead: true,
      },
      orderBy: { sentAt: 'asc' },
    });

    // Fetch full content from S3
    const emails = await Promise.all(
      emailCache.map(async (cache) => {
        const content = await this.s3EmailService.getEmailContent(cache.s3Key);
        return {
          id: cache.id,
          threadID: cache.threadID,
          messageID: cache.messageID,
          from: cache.from,
          to: cache.to,
          subject: cache.subject,
          text: content.text,
          sentAt: cache.sentAt,
          isFromCoach: cache.isFromCoach,
        };
      })
    );

    return { emails };
  }

  @Get('health')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: '[INTERNAL] Health check' })
  async healthCheck() {
    return { status: 'ok', service: 'email' };
  }
}
