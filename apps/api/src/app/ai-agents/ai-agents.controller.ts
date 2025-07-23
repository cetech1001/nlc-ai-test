import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LeadFollowupService } from './lead-followup/lead-followup.service';
import { EmailSchedulerService } from '../email/email-scheduler.service';
import {type AuthUser, UserType} from "@nlc-ai/types";

@ApiTags('AI Agents')
@Controller('ai-agents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AiAgentsController {
  constructor(
    private leadFollowupService: LeadFollowupService,
    private emailSchedulerService: EmailSchedulerService,
  ) {}

  @Post('lead-followup/:leadID/generate')
  @Roles(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Generate AI follow-up sequence for a lead' })
  @ApiResponse({ status: 201, description: 'Follow-up sequence generated successfully' })
  async generateFollowupSequence(
    @Param('leadID') leadID: string,
    @CurrentUser() user: AuthUser,
  ) {
    const coachID = user.type === UserType.coach ? user.id : undefined;
    return this.leadFollowupService.scheduleFollowupEmails(leadID, coachID);
  }

  @Patch('lead-followup/:leadID/status')
  @Roles(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Update lead status and regenerate sequence' })
  @ApiResponse({ status: 200, description: 'Lead status updated and sequence regenerated' })
  async updateLeadStatus(
    @Param('leadID') leadID: string,
    @Body() body: { status: string },
    @CurrentUser() user: any,
  ) {
    const coachID = user.role === UserType.coach ? user.id : user.coachID;
    return this.leadFollowupService.updateLeadStatus(leadID, body.status, coachID);
  }

  @Get('lead-followup/:leadID/history')
  @Roles(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Get email history for a lead' })
  @ApiResponse({ status: 200, description: 'Email history retrieved successfully' })
  async getEmailHistory(@Param('leadID') leadID: string) {
    return this.leadFollowupService.getLeadEmailHistory(leadID);
  }

  @Get('lead-followup/sequences')
  @Roles(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Get active email sequences for coach' })
  @ApiResponse({ status: 200, description: 'Active sequences retrieved successfully' })
  async getActiveSequences(@CurrentUser() user: any) {
    const coachID = user.role === UserType.coach ? user.id : user.coachID;
    return this.leadFollowupService.getActiveSequences(coachID);
  }

  @Post('lead-followup/:leadID/pause')
  @Roles(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Pause email sequence for a lead' })
  @ApiResponse({ status: 200, description: 'Email sequence paused' })
  async pauseSequence(@Param('leadID') leadID: string) {
    await this.emailSchedulerService.pauseSequenceForLead(leadID);
    return { message: 'Email sequence paused successfully' };
  }

  @Post('lead-followup/:leadID/resume')
  @Roles(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Resume email sequence for a lead' })
  @ApiResponse({ status: 200, description: 'Email sequence resumed' })
  async resumeSequence(@Param('leadID') leadID: string) {
    await this.emailSchedulerService.resumeSequenceForLead(leadID);
    return { message: 'Email sequence resumed successfully' };
  }

  @Post('lead-followup/:leadID/cancel')
  @Roles(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Cancel email sequence for a lead' })
  @ApiResponse({ status: 200, description: 'Email sequence cancelled' })
  async cancelSequence(@Param('leadID') leadID: string) {
    await this.emailSchedulerService.cancelSequenceForLead(leadID);
    return { message: 'Email sequence cancelled successfully' };
  }

  @Get('email-stats')
  @Roles(UserType.admin)
  @ApiOperation({ summary: 'Get email system statistics' })
  @ApiResponse({ status: 200, description: 'Email statistics retrieved successfully' })
  async getEmailStats() {
    return this.emailSchedulerService.getEmailStats();
  }
}
