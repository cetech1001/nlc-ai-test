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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateCategoryDto, UpdateCategoryDto, ContentQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {UserType} from "@nlc-ai/types";

@ApiTags('Content')
@Controller('content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.coach)
@ApiBearerAuth()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // Categories
  @Get('categories')
  @ApiOperation({ summary: 'Get all categories for authenticated coach' })
  getCategories(@Request() req: any) {
    return this.contentService.getCategories(req.user.id);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  getCategory(@Param('id') id: string, @Request() req: any) {
    return this.contentService.getCategory(id, req.user.id);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create new category' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
    return this.contentService.createCategory(createCategoryDto, req.user.id);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update category' })
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Request() req: any) {
    return this.contentService.updateCategory(id, updateCategoryDto, req.user.id);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete category' })
  deleteCategory(@Param('id') id: string, @Request() req: any) {
    return this.contentService.deleteCategory(id, req.user.id);
  }

  // Videos
  @Get('videos')
  @ApiOperation({ summary: 'Get videos with filtering and pagination' })
  getVideos(@Query() query: ContentQueryDto, @Request() req: any) {
    return this.contentService.getVideos(query, req.user.id);
  }

  @Get('videos/:id')
  @ApiOperation({ summary: 'Get video by ID' })
  getVideo(@Param('id') id: string, @Request() req: any) {
    return this.contentService.getVideo(id, req.user.id);
  }

  @Post('videos/upload')
  @ApiOperation({ summary: 'Upload new video' })
  @UseInterceptors(FileInterceptor('file'))
  uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req: any
  ) {
    return this.contentService.uploadVideo(file, body, req.user.id);
  }

  @Patch('videos/:id')
  @ApiOperation({ summary: 'Update video metadata' })
  updateVideo(@Param('id') id: string, @Body() updateData: any, @Request() req: any) {
    return this.contentService.updateVideo(id, updateData, req.user.id);
  }

  @Delete('videos/:id')
  @ApiOperation({ summary: 'Delete video' })
  deleteVideo(@Param('id') id: string, @Request() req: any) {
    return this.contentService.deleteVideo(id, req.user.id);
  }

  @Post('videos/:id/view')
  @ApiOperation({ summary: 'Increment video view count' })
  incrementViews(@Param('id') id: string, @Request() req: any) {
    return this.contentService.incrementViews(id, req.user.id);
  }

  // Stats
  @Get('stats')
  @ApiOperation({ summary: 'Get content statistics' })
  getStats(@Request() req: any) {
    return this.contentService.getStats(req.user.id);
  }

  @Get('categories/:id/stats')
  @ApiOperation({ summary: 'Get category statistics' })
  getCategoryStats(@Param('id') id: string, @Request() req: any) {
    return this.contentService.getCategoryStats(id, req.user.id);
  }
}
