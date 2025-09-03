import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CourseStructureService } from './course-structure.service';
import {
  CourseStructureRequestDto,
  CourseStructureSuggestionDto,
} from './dto';

@ApiTags('Course Structure')
@ApiBearerAuth()
@Controller('course-structure')
export class CourseStructureController {
  constructor(private readonly courseStructureService: CourseStructureService) {}

  @Post('suggest')
  @ApiOperation({
    summary: 'Generate course structure suggestions',
    description: 'Uses AI to analyze course description and generate comprehensive course structure with chapters and lessons',
  })
  @ApiResponse({
    status: 200,
    description: 'Course structure suggestions generated successfully',
    type: CourseStructureSuggestionDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'AI service error',
  })
  async suggestCourseStructure(
    @Body() request: CourseStructureRequestDto,
  ): Promise<CourseStructureSuggestionDto> {
    return this.courseStructureService.generateCourseStructure(request);
  }
}
