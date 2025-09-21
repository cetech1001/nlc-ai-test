import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser } from '@nlc-ai/api-auth';
import { type AuthUser } from '@nlc-ai/api-types';
import { CommentsService } from './comments.service';
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentFiltersDto,
  ReactToCommentDto,
} from './dto';

@ApiTags('Comments')
@Controller(':communityID/comments')
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  async createComment(
    @Param('communityID', ParseUUIDPipe) communityID: string,
    @Body() createDto: CreateCommentDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.commentsService.createComment(communityID, createDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get comments' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  async getComments(
    @Param('communityID', ParseUUIDPipe) communityID: string,
    @Query() filters: CommentFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.commentsService.getComments(communityID, filters, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment retrieved successfully' })
  async getComment(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.commentsService.getComment(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  async updateComment(
    @Param('id') id: string,
    @Body() updateDto: UpdateCommentDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.commentsService.updateComment(id, updateDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.commentsService.deleteComment(id, user);
  }

  @Post(':id/reactions')
  @ApiOperation({ summary: 'React to comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Reaction added successfully' })
  async reactToComment(
    @Param('id') commentID: string,
    @Body() reactionDto: ReactToCommentDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.commentsService.reactToComment(commentID, reactionDto, user);
  }

  @Get(':id/replies')
  @ApiOperation({ summary: 'Get comment replies' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully' })
  async getReplies(
    @Param('id') commentID: string,
    @Query() filters: CommentFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.commentsService.getReplies(commentID, filters, user);
  }
}
