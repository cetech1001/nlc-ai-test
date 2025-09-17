import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeadFollowupService } from './lead-followup.service';
import {
  UpdateSequenceRequest,
  UpdateEmailRequest,
  RegenerateEmailsRequest,
  type AuthUser,
  UserType
} from '@nlc-ai/types';
import {CreateSequenceDto, UpdateEmailDto, UpdateSequenceDto} from "./dto/sequence.dto";
import {CurrentUser, UserTypes, UserTypesGuard} from "@nlc-ai/api-auth";

@ApiTags(' Lead Follow-up')
@Controller('lead-followup')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN)
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
    @CurrentUser() user: AuthUser,
  ) {
    if (user.type === UserType.COACH) {
      body.coachID = user.id;
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
    @Body() updates: UpdateSequenceDto,
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
    @Body() updates: UpdateEmailDto,
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
    @CurrentUser() user: AuthUser,
  ) {
    // Ensure coaches can only see their own sequences unless admin
    if (user.type === UserType.COACH && user.id !== coachID) {
      coachID = user.id;
    }

    return this.leadFollowupService.getSequencesForCoach(coachID);
  }

  @Get('sequences/lead/:leadID')
  @ApiOperation({ summary: 'Get all sequences for a lead' })
  @ApiResponse({ status: 200, description: 'Lead sequences retrieved successfully' })
  async getLeadSequences(@Param('leadID') leadID: string) {
    return this.leadFollowupService.getSequencesForLead(leadID);
  }

  @Post('sequence/:sequenceID/pause')
  @ApiOperation({ summary: 'Pause email sequence' })
  @ApiResponse({ status: 200, description: 'Sequence paused successfully' })
  async pauseSequence(@Param('sequenceID') sequenceID: string) {
    await this.leadFollowupService.pauseSequenceEmails(sequenceID);
    return { message: 'Email sequence paused successfully' };
  }

  @Post('sequence/:sequenceID/resume')
  @ApiOperation({ summary: 'Resume email sequence' })
  @ApiResponse({ status: 200, description: 'Sequence resumed successfully' })
  async resumeSequence(@Param('sequenceID') sequenceID: string) {
    await this.leadFollowupService.resumeSequenceEmails(sequenceID);
    return { message: 'Email sequence resumed successfully' };
  }

  @Post('sequence/:sequenceID/cancel')
  @ApiOperation({ summary: 'Cancel email sequence' })
  @ApiResponse({ status: 200, description: 'Sequence cancelled successfully' })
  async cancelSequence(@Param('sequenceID') sequenceID: string) {
    await this.leadFollowupService.cancelSequenceEmails(sequenceID);
    return { message: 'Email sequence cancelled successfully' };
  }

  @Get('email/:emailID/preview')
  @ApiOperation({ summary: 'Preview email with deliverability analysis' })
  @ApiResponse({ status: 200, description: 'Email preview generated successfully' })
  async previewEmail(@Param('emailID') emailID: string) {
    return this.leadFollowupService.getEmailPreview(emailID);
  }
}
