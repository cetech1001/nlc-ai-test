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
import { UserType, type AuthUser } from '@nlc-ai/types';
import { ThreadsService } from './threads.service';
import { ReplyToThreadDto, UpdateThreadDto } from './dto';
import {ThreadsQueryDto} from "./dto";

@ApiTags('Email Threads')
@Controller('threads')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.COACH)
@ApiBearerAuth()
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get()
  @ApiOperation({ summary: 'Get email threads' })
  async getThreads(
    @CurrentUser() user: AuthUser,
    @Query() query: ThreadsQueryDto,
  ) {
    return this.threadsService.getThreads(user.id, query);
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
    return this.threadsService.replyToThread(user.id, user.type, threadID, dto);
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
}
