import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';
import { SchedulingService } from './scheduling.service';
import { ScheduleEmailDto, BulkScheduleDto } from './dto';

@ApiTags('Email Scheduling')
@Controller('scheduling')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach)
@ApiBearerAuth()
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule a single email' })
  @ApiResponse({ status: 201, description: 'Email scheduled successfully' })
  async scheduleEmail(
    @Body() dto: ScheduleEmailDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.schedulingService.scheduleEmail({
      ...dto,
      scheduledFor: new Date(dto.scheduledFor),
      coachID: dto.coachID || user.id,
    });

    return {
      success: true,
      emailID: result.emailID,
      scheduledFor: result.scheduledFor,
      message: 'Email scheduled successfully',
    };
  }

  @Post('schedule-bulk')
  @ApiOperation({ summary: 'Schedule multiple emails' })
  @ApiResponse({ status: 201, description: 'Bulk emails scheduled' })
  async scheduleBulkEmails(
    @Body() dto: BulkScheduleDto,
    @CurrentUser() user: AuthUser,
  ) {
    const emailsWithDates = dto.emails.map(email => ({
      ...email,
      scheduledFor: new Date(email.scheduledFor),
      coachID: email.coachID || user.id,
    }));

    const result = await this.schedulingService.scheduleBulkEmails(emailsWithDates);

    return {
      success: true,
      scheduledCount: result.scheduledCount,
      errors: result.errors,
      message: `Scheduled ${result.scheduledCount}/${dto.emails.length} emails`,
    };
  }

  @Patch('lead/:leadID/pause')
  @ApiOperation({ summary: 'Pause email sequence for lead' })
  async pauseLeadSequence(@Param('leadID') leadID: string) {
    return this.schedulingService.pauseSequenceForLead(leadID);
  }

  @Patch('lead/:leadID/resume')
  @ApiOperation({ summary: 'Resume email sequence for lead' })
  async resumeLeadSequence(@Param('leadID') leadID: string) {
    return this.schedulingService.resumeSequenceForLead(leadID);
  }

  @Patch('lead/:leadID/cancel')
  @ApiOperation({ summary: 'Cancel email sequence for lead' })
  async cancelLeadSequence(
    @Param('leadID') leadID: string,
    @Body() body?: { reason?: string },
  ) {
    return this.schedulingService.cancelSequenceForLead(leadID, body?.reason);
  }

  @Patch('client/:clientID/pause')
  @ApiOperation({ summary: 'Pause email sequence for client' })
  async pauseClientSequence(@Param('clientID') clientID: string) {
    return this.schedulingService.pauseSequenceForClient(clientID);
  }

  @Patch('client/:clientID/resume')
  @ApiOperation({ summary: 'Resume email sequence for client' })
  async resumeClientSequence(@Param('clientID') clientID: string) {
    return this.schedulingService.resumeSequenceForClient(clientID);
  }

  @Patch('client/:clientID/cancel')
  @ApiOperation({ summary: 'Cancel email sequence for client' })
  async cancelClientSequence(@Param('clientID') clientID: string) {
    return this.schedulingService.cancelSequenceForClient(clientID);
  }

  @Post('retry-failed')
  @ApiOperation({ summary: 'Retry failed emails' })
  async retryFailedEmails(
    @CurrentUser() user: AuthUser,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.schedulingService.retryFailedEmails(user.id, limitNum);
  }

  @Patch('coach/:coachID/emergency-pause')
  @ApiOperation({ summary: 'Emergency pause all emails for coach' })
  @UserTypes(UserType.admin) // Restrict to admin
  async emergencyPauseCoach(
    @Param('coachID') coachID: string,
    @Body() body: { reason: string },
  ) {
    return this.schedulingService.pauseAllEmailsForCoach(coachID, body.reason);
  }

  @Patch('coach/:coachID/emergency-resume')
  @ApiOperation({ summary: 'Emergency resume all emails for coach' })
  @UserTypes(UserType.admin)
  async emergencyResumeCoach(@Param('coachID') coachID: string) {
    return this.schedulingService.resumeAllEmailsForCoach(coachID);
  }
}
