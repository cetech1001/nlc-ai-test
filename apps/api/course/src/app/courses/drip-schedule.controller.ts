import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DripScheduleService } from './drip-schedule.service';
import { UpdateDripScheduleDto } from './dto/drip-schedule.dto';
import { CurrentUser } from '@nlc-ai/api-auth';
import { type AuthUser } from '@nlc-ai/api-types';

@ApiTags('Course Drip Schedule')
@ApiBearerAuth()
@Controller('courses/:courseId/drip-schedule')
export class DripScheduleController {
  constructor(private readonly dripScheduleService: DripScheduleService) {}

  @Get()
  @ApiOperation({ summary: 'Get drip schedule for course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async getDripSchedule(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.dripScheduleService.getDripSchedule(courseId);
  }

  @Put()
  @ApiOperation({ summary: 'Update drip schedule settings' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async updateDripSchedule(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() updateDto: UpdateDripScheduleDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.dripScheduleService.updateDripSchedule(courseId, updateDto, user.id);
  }

  @Get('preview/:enrollmentId')
  @ApiOperation({ summary: 'Preview drip schedule for specific enrollment' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'enrollmentId', description: 'Enrollment ID' })
  async previewDripSchedule(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.dripScheduleService.previewDripSchedule(courseId, enrollmentId, user.id);
  }
}
