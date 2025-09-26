import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';
import { ContentPiecesService } from './content-pieces.service';
import {
  CreateContentPieceDto,
  UpdateContentPieceDto,
  ContentPieceQueryDto,
  ContentAnalyticsDto
} from './dto';

@ApiTags('Content Pieces')
@Controller('pieces')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin)
@ApiBearerAuth()
export class ContentPiecesController {
  constructor(private readonly contentPiecesService: ContentPiecesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new content piece' })
  @ApiResponse({ status: 201, description: 'Content piece created successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createContentPieceDto: CreateContentPieceDto
  ) {
    return this.contentPiecesService.create(user.id, user.type, createContentPieceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all content pieces for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Content pieces retrieved successfully' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: ContentPieceQueryDto
  ) {
    return this.contentPiecesService.findAll(user.id, user.type, query);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get content analytics for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(
    @CurrentUser() user: AuthUser,
    @Query() query: ContentAnalyticsDto
  ) {
    return this.contentPiecesService.getAnalytics(user.id, user.type, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific content piece by ID' })
  @ApiResponse({ status: 200, description: 'Content piece retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Content piece not found' })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) contentPieceID: string
  ) {
    return this.contentPiecesService.findOne(user.id, user.type, contentPieceID);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a content piece' })
  @ApiResponse({ status: 200, description: 'Content piece updated successfully' })
  @ApiResponse({ status: 404, description: 'Content piece not found' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) contentPieceID: string,
    @Body() updateContentPieceDto: UpdateContentPieceDto
  ) {
    return this.contentPiecesService.update(user.id, user.type, contentPieceID, updateContentPieceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a content piece' })
  @ApiResponse({ status: 200, description: 'Content piece deleted successfully' })
  @ApiResponse({ status: 404, description: 'Content piece not found' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) contentPieceID: string
  ) {
    return this.contentPiecesService.remove(user.id, user.type, contentPieceID);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a content piece' })
  @ApiResponse({ status: 201, description: 'Content piece duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Content piece not found' })
  async duplicate(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) contentPieceID: string
  ) {
    return this.contentPiecesService.duplicateContentPiece(user.id, user.type, contentPieceID);
  }

  @Patch('bulk/status')
  @ApiOperation({ summary: 'Bulk update status of multiple content pieces' })
  @ApiResponse({ status: 200, description: 'Content pieces updated successfully' })
  async bulkUpdateStatus(
    @CurrentUser() user: AuthUser,
    @Body() body: { contentPieceIDs: string[]; status: string }
  ) {
    return this.contentPiecesService.bulkUpdateStatus(
      user.id,
      user.type,
      body.contentPieceIDs,
      body.status
    );
  }
}
