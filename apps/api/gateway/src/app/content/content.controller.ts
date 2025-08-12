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
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import {CreateCategoryDto, UpdateCategoryDto, ContentQueryDto, UpdateVideoDto, UploadVideoDto} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTypes } from '../auth/decorators/user-types.decorator';
import { UserTypesGuard } from '../auth/guards/user-types.guard';
import { UserType } from "@nlc-ai/types";

@ApiTags('Content')
@Controller('content')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@ApiBearerAuth()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @UserTypes(UserType.coach, UserType.admin)
  getCategories(@Request() req: any) {
    const coachID = req.user.userType === UserType.coach ? req.user.id : undefined;
    return this.contentService.getCategories(coachID);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  @UserTypes(UserType.coach, UserType.admin)
  getCategory(@Param('id') id: string, @Request() req: any) {
    const coachID = req.user.userType === UserType.coach ? req.user.id : undefined;
    return this.contentService.getCategory(id, coachID);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create new category' })
  @UserTypes(UserType.admin)
  createCategory(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
    return this.contentService.createCategory(createCategoryDto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update category' })
  @UserTypes(UserType.admin)
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Request() req: any) {
    return this.contentService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete category' })
  @UserTypes(UserType.admin)
  deleteCategory(@Param('id') id: string, @Request() req: any) {
    return this.contentService.deleteCategory(id);
  }

  @Get('videos')
  @ApiOperation({ summary: 'Get videos with filtering and pagination' })
  @UserTypes(UserType.coach)
  getVideos(@Query() query: ContentQueryDto, @Request() req: any) {
    return this.contentService.getVideos(query, req.user.id);
  }

  @Get('videos/:id')
  @ApiOperation({ summary: 'Get video by ID' })
  @UserTypes(UserType.coach)
  getVideo(@Param('id') id: string, @Request() req: any) {
    return this.contentService.getVideo(id, req.user.id);
  }

  @Post('videos/upload')
  @ApiOperation({ summary: 'Upload new video' })
  @UseInterceptors(FileInterceptor('file'))
  @UserTypes(UserType.coach)
  uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadVideoDto,
    @Request() req: any
  ) {
    return this.contentService.uploadVideo(file, body, req.user.id);
  }

  @Patch('videos/:id')
  @ApiOperation({ summary: 'Update video metadata' })
  @UserTypes(UserType.coach)
  updateVideo(@Param('id') id: string, @Body() updateData: UpdateVideoDto, @Request() req: any) {
    return this.contentService.updateVideo(id, updateData, req.user.id);
  }

  @Delete('videos/:id')
  @ApiOperation({ summary: 'Delete video' })
  @UserTypes(UserType.coach)
  deleteVideo(@Param('id') id: string, @Request() req: any) {
    return this.contentService.deleteVideo(id, req.user.id);
  }

  @Post('videos/:id/view')
  @ApiOperation({ summary: 'Increment video view count' })
  @UserTypes(UserType.coach)
  incrementViews(@Param('id') id: string, @Request() req: any) {
    return this.contentService.incrementViews(id, req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get content statistics' })
  @UserTypes(UserType.coach)
  getStats(@Request() req: any) {
    return this.contentService.getStats(req.user.id);
  }

  @Get('categories/:id/stats')
  @ApiOperation({ summary: 'Get category statistics' })
  @UserTypes(UserType.coach)
  getCategoryStats(@Param('id') id: string, @Request() req: any) {
    return this.contentService.getCategoryStats(id, req.user.id);
  }

  @Get('admin/all-content')
  @ApiOperation({ summary: 'Get all content across all coaches (Admin only)' })
  @UserTypes(UserType.admin)
  getAllContent(@Query() query: ContentQueryDto) {
    return this.contentService.getVideos(query, undefined as any);
  }

  @Get('admin/categories')
  @ApiOperation({ summary: 'Get all categories (Admin only)' })
  @UserTypes(UserType.admin)
  getAllCategories() {
    return this.contentService.getCategories();
  }
}
