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
import { ChaptersService } from './chapters.service';
import { CreateChapterDto, UpdateChapterDto, ReorderChaptersDto } from './dto';
import { CurrentUser } from '@nlc-ai/api-auth';
import { type AuthUser } from '@nlc-ai/types';

@ApiTags('Course Chapters')
@ApiBearerAuth()
@Controller(':courseID/chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chapter' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  async create(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Body() createChapterDto: CreateChapterDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.chaptersService.create(courseID, createChapterDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chapters for a course' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  async findAll(@Param('courseID', ParseUUIDPipe) courseID: string) {
    return this.chaptersService.findAll(courseID);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chapter by ID' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  async findOne(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.chaptersService.findOne(courseID, id);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder chapters' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  async reorder(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Body() reorderDto: ReorderChaptersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.chaptersService.reorder(courseID, reorderDto.chapterIDs, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a chapter' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  async update(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChapterDto: UpdateChapterDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.chaptersService.update(courseID, id, updateChapterDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chapter' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.chaptersService.remove(courseID, id, user.id);
  }
}
