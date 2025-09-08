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
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto, ReorderLessonsDto } from './dto';
import { CurrentUser } from '@nlc-ai/api-auth';
import { type AuthUser } from '@nlc-ai/api-types';

@ApiTags('Course Lessons')
@ApiBearerAuth()
@Controller('courses/:courseId/chapters/:chapterId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'chapterId', description: 'Chapter ID' })
  async create(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.lessonsService.create(courseId, chapterId, createLessonDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lessons for a chapter' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'chapterId', description: 'Chapter ID' })
  async findAll(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string
  ) {
    return this.lessonsService.findAll(courseId, chapterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lesson by ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'chapterId', description: 'Chapter ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  async findOne(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.lessonsService.findOne(courseId, chapterId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'chapterId', description: 'Chapter ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  async update(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.lessonsService.update(courseId, chapterId, id, updateLessonDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'chapterId', description: 'Chapter ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.lessonsService.remove(courseId, chapterId, id, user.id);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder lessons within a chapter' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'chapterId', description: 'Chapter ID' })
  async reorder(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Body() reorderDto: ReorderLessonsDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.lessonsService.reorder(courseId, chapterId, reorderDto.lessonIDs, user.id);
  }
}
