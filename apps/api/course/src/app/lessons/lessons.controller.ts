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
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto, ReorderLessonsDto } from './dto';
import { CurrentUser } from '@nlc-ai/api-auth';
import { type AuthUser } from '@nlc-ai/types';

@ApiTags('Course Lessons')
@ApiBearerAuth()
@Controller(':courseID/chapters/:chapterID/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  @ApiParam({ name: 'chapterID', description: 'Chapter ID' })
  async create(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Param('chapterID', ParseUUIDPipe) chapterID: string,
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.lessonsService.create(courseID, chapterID, createLessonDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lessons for a chapter' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  @ApiParam({ name: 'chapterID', description: 'Chapter ID' })
  async findAll(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Param('chapterID', ParseUUIDPipe) chapterID: string
  ) {
    return this.lessonsService.findAll(courseID, chapterID);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lesson by ID' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  @ApiParam({ name: 'chapterID', description: 'Chapter ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  async findOne(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Param('chapterID', ParseUUIDPipe) chapterID: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.lessonsService.findOne(courseID, chapterID, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  @ApiParam({ name: 'chapterID', description: 'Chapter ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  async update(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Param('chapterID', ParseUUIDPipe) chapterID: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.lessonsService.update(courseID, chapterID, id, updateLessonDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  @ApiParam({ name: 'chapterID', description: 'Chapter ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Param('chapterID', ParseUUIDPipe) chapterID: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.lessonsService.remove(courseID, chapterID, id, user.id);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder lessons within a chapter' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  @ApiParam({ name: 'chapterID', description: 'Chapter ID' })
  async reorder(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Param('chapterID', ParseUUIDPipe) chapterID: string,
    @Body() reorderDto: ReorderLessonsDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.lessonsService.reorder(courseID, chapterID, reorderDto.lessonIDs, user.id);
  }
}
