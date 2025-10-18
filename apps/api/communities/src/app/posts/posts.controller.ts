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
import { PostsService } from './posts.service';
import {
  CreatePostDto,
  UpdatePostDto,
  PostFiltersDto,
  ReactToPostDto,
} from './dto';

@ApiTags('Posts')
@Controller(':communityID/posts')
@ApiBearerAuth()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async createPost(
    @Param('communityID', ParseUUIDPipe) communityID: string,
    @Body() createDto: CreatePostDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.postsService.createPost(communityID, createDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get posts' })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  async getPosts(
    @Param('communityID', ParseUUIDPipe) communityID: string,
    @Query() filters: PostFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.postsService.getPosts(communityID, filters, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  async getPost(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.postsService.getPost(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  async updatePost(
    @Param('id') id: string,
    @Body() updateDto: UpdatePostDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.postsService.updatePost(id, updateDto, user);
  }

  @Put(':id/pin')
  @ApiOperation({ summary: 'Pin/unpin post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post pin status updated successfully' })
  async togglePinPost(
    @Param('communityID', ParseUUIDPipe) communityID: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.postsService.togglePinPost(communityID, id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  async deletePost(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.postsService.deletePost(id, user);
  }

  @Post(':id/reactions')
  @ApiOperation({ summary: 'React to post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Reaction added successfully' })
  async reactToPost(
    @Param('id') postID: string,
    @Body() reactionDto: ReactToPostDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.postsService.reactToPost(postID, reactionDto, user);
  }
}
