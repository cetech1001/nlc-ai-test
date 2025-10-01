import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags,} from '@nestjs/swagger';
import {CoursesService} from './courses.service';
import {
  CourseQueryDto,
  CourseResponseDto,
  CourseStatsResponseDto,
  CreateCourseDto,
  PaginatedCoursesResponseDto,
  UpdateCourseDto,
} from './dto';
import {CurrentUser} from "@nlc-ai/api-auth";
import {type AuthUser} from "@nlc-ai/api-types";

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: CourseResponseDto,
  })
  async create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: AuthUser) {
    return this.coursesService.create(createCourseDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get courses with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    type: PaginatedCoursesResponseDto,
  })
  async findAll(@Query() query: CourseQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course retrieved successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 204, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course published successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.publish(id);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course unpublished successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.unpublish(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get course statistics' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course statistics retrieved successfully',
    type: CourseStatsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getStats(id);
  }
}
