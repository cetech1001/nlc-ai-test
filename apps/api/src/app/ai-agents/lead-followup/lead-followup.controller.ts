import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserTypesGuard } from '../../auth/guards/user-types.guard';
import { UserTypes } from '../../auth/decorators/user-types.decorator';
import { LeadFollowupService } from './lead-followup.service';
import {
  UpdateSequenceRequest,
  UpdateEmailRequest,
  RegenerateEmailsRequest,
  AuthUser,
  UserType
} from '@nlc-ai/types';
import {CreateSequenceDto} from "./dto/sequence.dto";

@ApiTags(' Lead Follow-up')
@Controller('ai-agents/lead-followup')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin)
@ApiBearerAuth()
export class LeadFollowupController {
  constructor(
    private readonly leadFollowupService: LeadFollowupService
  ) {}

  @Post('create-sequence')
  @ApiOperation({ summary: 'Create email follow-up sequence' })
  @ApiResponse({ status: 201, description: 'Email sequence created successfully' })
  async createSequence(
    @Body() body: CreateSequenceDto,
    @Request() req: { user: AuthUser }
  ) {
    // Set coachID for coach users
    if (req.user.type === UserType.coach) {
      body.coachID = req.user.id;
    }

    return this.leadFollowupService.createSequence(body);
  }

  @Get('sequence/:sequenceID')
  @ApiOperation({ summary: 'Get email sequence with all emails' })
  @ApiResponse({ status: 200, description: 'Sequence retrieved successfully' })
  async getSequence(@Param('sequenceID') sequenceID: string) {
    return this.leadFollowupService.getSequenceWithEmails(sequenceID);
  }

  @Patch('sequence/:sequenceID')
  @ApiOperation({ summary: 'Update email sequence configuration' })
  @ApiResponse({ status: 200, description: 'Sequence updated successfully' })
  async updateSequence(
    @Param('sequenceID') sequenceID: string,
    @Body() updates: Omit<UpdateSequenceRequest, 'sequenceID'>
  ) {
    const request: UpdateSequenceRequest = {
      sequenceID,
      updates
    };
    return this.leadFollowupService.updateSequence(request);
  }

  @Patch('email/:emailID')
  @ApiOperation({ summary: 'Update specific email in sequence' })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
  async updateEmail(
    @Param('emailID') emailID: string,
    @Body() updates: Omit<UpdateEmailRequest, 'emailID'>
  ) {
    const request: UpdateEmailRequest = {
      emailID,
      updates
    };
    return this.leadFollowupService.updateEmail(request);
  }

  @Post('sequence/:sequenceID/regenerate')
  @ApiOperation({ summary: 'Regenerate specific emails in sequence' })
  @ApiResponse({ status: 200, description: 'Emails regenerated successfully' })
  async regenerateEmails(
    @Param('sequenceID') sequenceID: string,
    @Body() body: Omit<RegenerateEmailsRequest, 'sequenceID'>
  ) {
    const request: RegenerateEmailsRequest = {
      sequenceID,
      ...body
    };
    return this.leadFollowupService.regenerateEmails(request);
  }

  @Get('sequences/coach/:coachID')
  @ApiOperation({ summary: 'Get all sequences for a coach' })
  @ApiResponse({ status: 200, description: 'Sequences retrieved successfully' })
  async getCoachSequences(
    @Param('coachID') coachID: string,
    @Request() req: { user: AuthUser }
  ) {
    // Ensure coaches can only see their own sequences unless admin
    if (req.user.type === UserType.coach && req.user.id !== coachID) {
      coachID = req.user.id;
    }

    return this.getSequencesForCoach(coachID);
  }

  @Get('sequences/lead/:leadID')
  @ApiOperation({ summary: 'Get all sequences for a lead' })
  @ApiResponse({ status: 200, description: 'Lead sequences retrieved successfully' })
  async getLeadSequences(@Param('leadID') leadID: string) {
    return this.getSequencesForLead(leadID);
  }

  @Post('sequence/:sequenceID/pause')
  @ApiOperation({ summary: 'Pause email sequence' })
  @ApiResponse({ status: 200, description: 'Sequence paused successfully' })
  async pauseSequence(@Param('sequenceID') sequenceID: string) {
    await this.pauseSequenceEmails(sequenceID);
    return { message: 'Email sequence paused successfully' };
  }

  @Post('sequence/:sequenceID/resume')
  @ApiOperation({ summary: 'Resume email sequence' })
  @ApiResponse({ status: 200, description: 'Sequence resumed successfully' })
  async resumeSequence(@Param('sequenceID') sequenceID: string) {
    await this.resumeSequenceEmails(sequenceID);
    return { message: 'Email sequence resumed successfully' };
  }

  @Post('sequence/:sequenceID/cancel')
  @ApiOperation({ summary: 'Cancel email sequence' })
  @ApiResponse({ status: 200, description: 'Sequence cancelled successfully' })
  async cancelSequence(@Param('sequenceID') sequenceID: string) {
    await this.cancelSequenceEmails(sequenceID);
    return { message: 'Email sequence cancelled successfully' };
  }

  @Get('email/:emailID/preview')
  @ApiOperation({ summary: 'Preview email with deliverability analysis' })
  @ApiResponse({ status: 200, description: 'Email preview generated successfully' })
  async previewEmail(@Param('emailID') emailID: string) {
    return this.getEmailPreview(emailID);
  }

  // Helper methods for the controller
  private async getSequencesForCoach(coachID: string) {
    // Implementation would query sequences for coach
    // This is a simplified version - you'd want to add pagination, filtering, etc.
    return {
      sequences: [], // Would contain actual sequences
      totalCount: 0,
      activeCount: 0,
      completedCount: 0
    };
  }

  private async getSequencesForLead(leadID: string) {
    // Implementation would query sequences for lead
    return {
      sequences: [], // Would contain actual sequences
      currentSequence: null,
      sequenceHistory: []
    };
  }

  private async pauseSequenceEmails(sequenceID: string) {
    // Pause all scheduled emails in sequence
    // Implementation would update email statuses to 'paused'
  }

  private async resumeSequenceEmails(sequenceID: string) {
    // Resume all paused emails in sequence
    // Implementation would update email statuses back to 'scheduled'
  }

  private async cancelSequenceEmails(sequenceID: string) {
    // Cancel all unsent emails in sequence
    // Implementation would update email statuses to 'cancelled'
  }

  private async getEmailPreview(emailID: string) {
    // Get email with deliverability analysis
    // Implementation would return email content + analysis
    return {
      email: null, // Would contain email data
      deliverabilityAnalysis: null, // Would contain analysis
      suggestions: [] // Would contain improvement suggestions
    };
  }
}
