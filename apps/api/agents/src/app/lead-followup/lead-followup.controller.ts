import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/types';
import { LeadFollowupService } from './lead-followup.service';

class GenerateSequenceDto {
  leadID!: string;
  sequenceConfig?: {
    emailCount?: number;
    sequenceType?: 'aggressive' | 'standard' | 'nurturing' | 'minimal';
    customInstructions?: string;
    timings?: string[];
  };
}

class UpdateEmailDto {
  subject?: string;
  body?: string;
  scheduledFor?: string;
  timing?: string;
}

class RegenerateEmailsDto {
  sequenceID!: string;
  emailOrders!: number[];
  customInstructions?: string;
}

@ApiTags('Lead Follow-up Agent')
@Controller('lead-followup')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN)
@ApiBearerAuth()
export class LeadFollowupController {
  constructor(
    private readonly leadFollowupService: LeadFollowupService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate AI follow-up sequence for a lead' })
  @ApiResponse({ status: 200, description: 'Sequence generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Lead or coach replica not found' })
  async generateFollowupSequence(
    @CurrentUser() user: AuthUser,
    @Body() dto: GenerateSequenceDto,
  ) {
    const sequence = await this.leadFollowupService.generateFollowupSequence(
      user.id,
      dto.leadID,
      dto.sequenceConfig || {}
    );

    return {
      success: true,
      message: 'Follow-up sequence generated successfully',
      sequence,
    };
  }

  @Get('lead/:leadID/sequences')
  @ApiOperation({ summary: 'Get all sequences for a specific lead' })
  @ApiResponse({ status: 200, description: 'Sequences retrieved successfully' })
  async getSequencesForLead(
    @CurrentUser() user: AuthUser,
    @Param('leadID', ParseUUIDPipe) leadID: string,
  ) {
    return this.leadFollowupService.getSequencesForLead(user.id, leadID);
  }

  @Post('sequence/:sequenceID/pause')
  @ApiOperation({ summary: 'Pause an active sequence' })
  @ApiResponse({ status: 200, description: 'Sequence paused successfully' })
  async pauseSequence(
    @CurrentUser() user: AuthUser,
    @Param('sequenceID', ParseUUIDPipe) sequenceID: string,
  ) {
    return this.leadFollowupService.pauseSequence(user.id, sequenceID);
  }

  @Post('sequence/:sequenceID/resume')
  @ApiOperation({ summary: 'Resume a paused sequence' })
  @ApiResponse({ status: 200, description: 'Sequence resumed successfully' })
  async resumeSequence(
    @CurrentUser() user: AuthUser,
    @Param('sequenceID', ParseUUIDPipe) sequenceID: string,
  ) {
    return this.leadFollowupService.resumeSequence(user.id, sequenceID);
  }

  @Post('sequence/:sequenceID/cancel')
  @ApiOperation({ summary: 'Cancel a sequence' })
  @ApiResponse({ status: 200, description: 'Sequence cancelled successfully' })
  async cancelSequence(
    @CurrentUser() user: AuthUser,
    @Param('sequenceID', ParseUUIDPipe) sequenceID: string,
  ) {
    return this.leadFollowupService.cancelSequence(user.id, sequenceID);
  }

  @Get('email/:emailID')
  @ApiOperation({ summary: 'Get specific email details' })
  @ApiResponse({ status: 200, description: 'Email retrieved successfully' })
  async getEmailByID(
    @CurrentUser() user: AuthUser,
    @Param('emailID', ParseUUIDPipe) emailID: string,
  ) {
    return this.leadFollowupService.getEmailByID(user.id, emailID);
  }

  @Patch('email/:emailID')
  @ApiOperation({ summary: 'Update email content, subject, or timing' })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
  async updateEmail(
    @CurrentUser() user: AuthUser,
    @Param('emailID', ParseUUIDPipe) emailID: string,
    @Body() dto: UpdateEmailDto,
  ) {
    return this.leadFollowupService.updateEmail(user.id, emailID, dto);
  }

  @Post('regenerate')
  @ApiOperation({ summary: 'Regenerate specific emails in a sequence' })
  @ApiResponse({ status: 200, description: 'Emails regenerated successfully' })
  async regenerateEmails(
    @CurrentUser() user: AuthUser,
    @Body() dto: RegenerateEmailsDto,
  ) {
    const emails = await this.leadFollowupService.regenerateEmails(user.id, {
      sequenceID: dto.sequenceID,
      emailOrders: dto.emailOrders,
      customInstructions: dto.customInstructions,
    });

    return {
      success: true,
      message: 'Emails regenerated successfully',
      emails,
    };
  }
}
