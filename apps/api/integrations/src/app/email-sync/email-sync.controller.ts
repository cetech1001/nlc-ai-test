import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';
import { EmailSyncService } from './email-sync.service';

@ApiTags('Email Sync')
@Controller('email-sync')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach)
@ApiBearerAuth()
export class EmailSyncController {
  constructor(private readonly emailSyncService: EmailSyncService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Manually sync client emails for authenticated coach' })
  @ApiResponse({ status: 200, description: 'Email sync completed successfully' })
  async syncClientEmails(@CurrentUser() user: AuthUser) {
    return this.emailSyncService.syncClientEmails(user.id, user.type);
  }

  @Get('threads')
  @ApiOperation({ summary: 'Get client email threads' })
  @ApiResponse({ status: 200, description: 'Email threads retrieved successfully' })
  async getEmailThreads(
    @CurrentUser() user: AuthUser,
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ) {
    const limitNum = limit ? parseInt(limit) : 20;
    return this.emailSyncService.getEmailThreads(user.id, limitNum, status);
  }

  @Get('threads/:threadID')
  @ApiOperation({ summary: 'Get detailed email thread with messages' })
  @ApiResponse({ status: 200, description: 'Email thread retrieved successfully' })
  async getEmailThread(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string
  ) {
    return this.emailSyncService.getEmailThread(user.id, threadID);
  }

  @Post('threads/:threadID/mark-read')
  @ApiOperation({ summary: 'Mark thread as read/unread' })
  @ApiResponse({ status: 200, description: 'Thread status updated' })
  async markThreadRead(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string,
    @Body() body: { isRead: boolean }
  ) {
    return this.emailSyncService.updateThreadStatus(user.id, threadID, { isRead: body.isRead });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get email sync statistics' })
  @ApiResponse({ status: 200, description: 'Email stats retrieved successfully' })
  async getSyncStats(@CurrentUser() user: AuthUser) {
    return this.emailSyncService.getSyncStats(user.id);
  }
}
