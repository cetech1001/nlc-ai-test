import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';
import { ThreadsService } from './threads.service';
import { ReplyToThreadDto, UpdateThreadDto } from './dto';

@ApiTags('Email Threads')
@Controller('threads')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach)
@ApiBearerAuth()
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get()
  @ApiOperation({ summary: 'Get email threads for coach' })
  async getThreads(
    @CurrentUser() user: AuthUser,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('isRead') isRead?: string,
    @Query('clientID') clientID?: string,
  ) {
    return this.threadsService.getThreads(user.id, {
      limit: limit ? parseInt(limit) : 20,
      status,
      isRead: isRead ? isRead === 'true' : undefined,
      clientID,
    });
  }

  @Get(':threadID')
  @ApiOperation({ summary: 'Get specific thread with messages' })
  async getThread(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string,
  ) {
    return this.threadsService.getThread(user.id, threadID);
  }

  @Post(':threadID/reply')
  @ApiOperation({ summary: 'Reply to email thread' })
  async replyToThread(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string,
    @Body() dto: ReplyToThreadDto,
  ) {
    return this.threadsService.replyToThread(user.id, threadID, dto);
  }

  @Patch(':threadID')
  @ApiOperation({ summary: 'Update thread properties' })
  async updateThread(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string,
    @Body() dto: UpdateThreadDto,
  ) {
    return this.threadsService.updateThread(user.id, threadID, dto);
  }

  @Get(':threadID/mark-read')
  @ApiOperation({ summary: 'Mark thread as read' })
  async markThreadRead(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string,
  ) {
    return this.threadsService.updateThread(user.id, threadID, { isRead: true });
  }
}
