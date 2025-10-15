import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/types';
import { LeadFollowupService } from './lead-followup.service';
import {GenerateSequenceDto, RegenerateEmailsDto} from "./dto";

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
  @ApiOperation({ summary: 'Generate AI follow-up sequence content for a lead' })
  @ApiResponse({ status: 200, description: 'Email content generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Lead or coach replica not found' })
  async generateFollowupSequence(
    @CurrentUser() user: AuthUser,
    @Body() dto: GenerateSequenceDto,
  ) {
    const result = await this.leadFollowupService.generateFollowupSequence(
      user.id,
      dto.leadID,
      dto.sequenceConfig || {}
    );

    return {
      message: 'Follow-up sequence content generated successfully',
      ...result,
    };
  }

  @Post('regenerate')
  @ApiOperation({ summary: 'Regenerate specific emails in a sequence with AI' })
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
      message: 'Emails regenerated successfully',
      emails,
    };
  }
}
