import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserTypesGuard } from '../../auth/guards/user-types.guard';
import { UserTypes } from '../../auth/decorators/user-types.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ClientEmailService } from './client-email.service';
import { type AuthUser, UserType } from '@nlc-ai/types';
import {PrismaService} from "../../prisma/prisma.service";

@ApiTags('Client Email Agent')
@Controller('ai-agents/client-email')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin)
@ApiBearerAuth()
export class ClientEmailController {
  constructor(
    private readonly clientEmailService: ClientEmailService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('sync')
  @ApiOperation({ summary: 'Manually sync client emails and generate responses' })
  @ApiResponse({ status: 200, description: 'Email sync completed successfully' })
  async syncClientEmails(@CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : user.id; // Admin can also trigger sync
    return this.clientEmailService.syncClientEmails(coachID);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending client email responses for approval' })
  @ApiResponse({ status: 200, description: 'Pending responses retrieved successfully' })
  async getPendingResponses(@CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailService.getPendingClientResponses(coachID);
  }

  @Post('approve/:emailID')
  @ApiOperation({ summary: 'Approve and send client email response' })
  @ApiResponse({ status: 200, description: 'Email approved and sent successfully' })
  async approveResponse(
    @CurrentUser() user: AuthUser,
    @Param('emailID') emailID: string,
    @Body() body?: { subject?: string; body?: string }
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailService.approveAndSendResponse(coachID, emailID, body);
  }

  @Delete('reject/:emailID')
  @ApiOperation({ summary: 'Reject/cancel pending email response' })
  @ApiResponse({ status: 200, description: 'Email response rejected successfully' })
  async rejectResponse(
    @CurrentUser() user: AuthUser,
    @Param('emailID') emailID: string
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailService.rejectResponse(coachID, emailID);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get client email statistics for dashboard' })
  @ApiResponse({ status: 200, description: 'Email statistics retrieved successfully' })
  async getEmailStats(@CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailService.getClientEmailStats(coachID);
  }

  @Get('thread/:threadID')
  @ApiOperation({ summary: 'Get detailed email thread with messages and pending response' })
  @ApiResponse({ status: 200, description: 'Email thread retrieved successfully' })
  async getEmailThread(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailService.getClientEmailThread(coachID, threadID);
  }

  @Post('thread/:threadID/regenerate')
  @ApiOperation({ summary: 'Regenerate AI response for email thread' })
  @ApiResponse({ status: 200, description: 'Response regenerated successfully' })
  async regenerateResponse(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string,
    @Body() body?: { customInstructions?: string }
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailService.regenerateResponse(
      coachID,
      threadID,
      body?.customInstructions
    );
  }

  @Get('threads')
  @ApiOperation({ summary: 'Get recent client email threads' })
  @ApiResponse({ status: 200, description: 'Email threads retrieved successfully' })
  async getRecentThreads(
    @CurrentUser() user: AuthUser,
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    const limitNum = limit ? parseInt(limit) : 20;

    // Get recent threads with basic info
    const threads = await this.prismaService.emailThread.findMany({
      where: {
        coachID,
        ...(status && { status })
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
          }
        },
        _count: {
          select: {
            emailMessages: true
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' },
      take: limitNum,
    });

    // Check for pending responses for each thread
    const threadsWithPending = await Promise.all(
      threads.map(async (thread) => {
        const pendingResponse = await this.prismaService.scheduledEmail.findFirst({
          where: {
            coachID,
            status: 'pending_approval',
            metadata: {
              path: ['clientEmailThread'],
              equals: thread.id
            }
          }
        });

        return {
          ...thread,
          messageCount: thread._count.emailMessages,
          hasPendingResponse: !!pendingResponse,
          pendingResponseID: pendingResponse?.id || null,
        };
      })
    );

    return threadsWithPending;
  }

  @Patch('thread/:threadID/status')
  @ApiOperation({ summary: 'Update email thread status (read/unread, priority)' })
  @ApiResponse({ status: 200, description: 'Thread status updated successfully' })
  async updateThreadStatus(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string,
    @Body() body: {
      isRead?: boolean;
      priority?: 'low' | 'normal' | 'high';
      status?: 'active' | 'archived' | 'closed';
    }
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;

    const thread = await this.prismaService.emailThread.findFirst({
      where: { id: threadID, coachID }
    });

    if (!thread) {
      throw new NotFoundException('Email thread not found');
    }

    const updatedThread = await this.prismaService.emailThread.update({
      where: { id: threadID },
      data: {
        isRead: body.isRead,
        priority: body.priority,
        status: body.status,
        updatedAt: new Date(),
      }
    });

    return { success: true, thread: updatedThread };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get email analytics and performance metrics' })
  @ApiResponse({ status: 200, description: 'Email analytics retrieved successfully' })
  async getEmailAnalytics(
    @CurrentUser() user: AuthUser,
    @Query('days') days?: string
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    const daysNum = days ? parseInt(days) : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const [
      totalThreads,
      activeThreads,
      totalResponses,
      approvedResponses,
      rejectedResponses,
      avgDeliverabilityScore
    ] = await Promise.all([
      this.prismaService.emailThread.count({
        where: {
          coachID,
          createdAt: { gte: startDate }
        }
      }),
      this.prismaService.emailThread.count({
        where: {
          coachID,
          status: 'active',
          lastMessageAt: { gte: startDate }
        }
      }),
      this.prismaService.scheduledEmail.count({
        where: {
          coachID,
          createdAt: { gte: startDate },
          metadata: {
            path: ['clientEmailThread'],
            not: null
          }
        }
      }),
      this.prismaService.scheduledEmail.count({
        where: {
          coachID,
          status: 'sent',
          createdAt: { gte: startDate },
          metadata: {
            path: ['clientEmailThread'],
            not: null
          }
        }
      }),
      this.prismaService.scheduledEmail.count({
        where: {
          coachID,
          status: 'cancelled',
          createdAt: { gte: startDate },
          metadata: {
            path: ['clientEmailThread'],
            not: null
          }
        }
      }),
      this.prismaService.scheduledEmail.aggregate({
        where: {
          coachID,
          status: 'sent',
          createdAt: { gte: startDate },
          metadata: {
            path: ['clientEmailThread'],
            not: null
          }
        },
        _avg: {
          // We'll parse this from metadata
        }
      })
    ]);

    // Calculate approval rate
    const approvalRate = totalResponses > 0 ? (approvedResponses / totalResponses) * 100 : 0;

    // Get response time analytics
    const sentEmails = await this.prismaService.scheduledEmail.findMany({
      where: {
        coachID,
        status: 'sent',
        createdAt: { gte: startDate },
        metadata: {
          path: ['clientEmailThread'],
          not: null
        }
      },
      select: { createdAt: true, sentAt: true, metadata: true }
    });

    let avgResponseTimeMinutes = 0;
    let avgDeliverabilityScoreValue = 0;

    if (sentEmails.length > 0) {
      const responseTimes = sentEmails.map(email => {
        if (email.sentAt) {
          return email.sentAt.getTime() - email.createdAt.getTime();
        }
        return 0;
      }).filter(time => time > 0);

      if (responseTimes.length > 0) {
        avgResponseTimeMinutes = Math.round(
          responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / (1000 * 60)
        );
      }

      // Calculate average deliverability score from metadata
      const deliverabilityScores = sentEmails.map(email => {
        try {
          const metadata = JSON.parse(email.metadata || '{}');
          return metadata.deliverabilityScore || 0;
        } catch {
          return 0;
        }
      }).filter(score => score > 0);

      if (deliverabilityScores.length > 0) {
        avgDeliverabilityScoreValue = Math.round(
          deliverabilityScores.reduce((sum, score) => sum + score, 0) / deliverabilityScores.length
        );
      }
    }

    return {
      period: `${daysNum} days`,
      totalThreads,
      activeThreads,
      totalResponses,
      approvedResponses,
      rejectedResponses,
      approvalRate: Math.round(approvalRate),
      avgResponseTimeMinutes,
      avgDeliverabilityScore: avgDeliverabilityScoreValue,
      metrics: {
        threadsPerDay: Math.round(totalThreads / daysNum),
        responsesPerDay: Math.round(totalResponses / daysNum),
        activeThreadsPercent: totalThreads > 0 ? Math.round((activeThreads / totalThreads) * 100) : 0,
      }
    };
  }
}
