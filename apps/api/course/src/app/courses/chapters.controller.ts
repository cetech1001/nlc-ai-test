import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto, UpdateChapterDto, ReorderChaptersDto } from './dto';
import { CurrentUser } from '@nlc-ai/api-auth';
import { type AuthUser } from '@nlc-ai/api-types';

@ApiTags('Course Chapters')
@ApiBearerAuth()
@Controller('courses/:courseId/chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chapter' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async create(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() createChapterDto: CreateChapterDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.chaptersService.create(courseId, createChapterDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chapters for a course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async findAll(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.chaptersService.findAll(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chapter by ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  async findOne(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.chaptersService.findOne(courseId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a chapter' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  async update(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChapterDto: UpdateChapterDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.chaptersService.update(courseId, id, updateChapterDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chapter' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.chaptersService.remove(courseId, id, user.id);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder chapters' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async reorder(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() reorderDto: ReorderChaptersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.chaptersService.reorder(courseId, reorderDto.chapterIDs, user.id);
  }
}
