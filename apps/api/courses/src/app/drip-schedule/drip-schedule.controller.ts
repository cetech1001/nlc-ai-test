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
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DripScheduleService } from './drip-schedule.service';
import { UpdateDripScheduleDto, UpdateLessonDripScheduleDto } from './dto';
import { CurrentUser } from '@nlc-ai/api-auth';
import { type AuthUser } from '@nlc-ai/api-types';

@ApiTags('Course Drip Schedule')
@ApiBearerAuth()
@Controller(':courseID/drip-schedule')
export class DripScheduleController {
  constructor(private readonly dripScheduleService: DripScheduleService) {}

  @Get()
  @ApiOperation({ summary: 'Get drip schedule for course' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  async getDripSchedule(@Param('courseID', ParseUUIDPipe) courseID: string) {
    return this.dripScheduleService.getDripSchedule(courseID);
  }

  @Put()
  @ApiOperation({ summary: 'Update drip schedule settings' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  async updateDripSchedule(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Body() updateDto: UpdateDripScheduleDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.dripScheduleService.updateDripSchedule(courseID, updateDto, user.id);
  }

  @Put('lessons')
  @ApiOperation({ summary: 'Update lesson-specific drip schedule' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  async updateLessonDripSchedule(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Body() updateDto: UpdateLessonDripScheduleDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.dripScheduleService.updateLessonDripSchedule(courseID, updateDto, user.id);
  }

  @Get('preview/:enrollmentID')
  @ApiOperation({ summary: 'Preview drip schedule for specific enrollment' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  @ApiParam({ name: 'enrollmentID', description: 'Enrollment ID' })
  async previewDripSchedule(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Param('enrollmentID', ParseUUIDPipe) enrollmentID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.dripScheduleService.previewDripSchedule(courseID, enrollmentID, user.id);
  }
}
