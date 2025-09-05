import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';
import { EmailDeliverabilityService } from './email-deliverability.service';

export class AnalyzeEmailDto {
  subject: string;
  body: string;
  coachID?: string;
  recipientType?: 'lead' | 'client' | 'general';
}

export class QuickCheckDto {
  subject: string;
  body: string;
}

@ApiTags('Email Deliverability')
@Controller('email-deliverability')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin)
@ApiBearerAuth()
export class EmailDeliverabilityController {
  constructor(
    private readonly emailDeliverabilityService: EmailDeliverabilityService
  ) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze email deliverability and get improvement suggestions' })
  @ApiResponse({ status: 200, description: 'Email analysis completed successfully' })
  async analyzeEmail(
    @Body() body: AnalyzeEmailDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.type === UserType.coach) {
      body.coachID = user.id;
    }

    return this.emailDeliverabilityService.analyzeEmailDeliverability(body);
  }

  @Post('quick-check')
  @ApiOperation({ summary: 'Quick deliverability check for real-time feedback' })
  @ApiResponse({ status: 200, description: 'Quick check completed successfully' })
  async quickCheck(
    @Body() body: QuickCheckDto,
  ) {
    return this.emailDeliverabilityService.quickDeliverabilityCheck(body.subject, body.body);
  }

  @Post('analyze-response/:responseID')
  @ApiOperation({ summary: 'Analyze deliverability of generated email response' })
  @ApiResponse({ status: 200, description: 'Response deliverability analyzed' })
  async analyzeGeneratedResponse(
    @Body() body: { responseID: string },
    @CurrentUser() user: AuthUser,
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.emailDeliverabilityService.analyzeGeneratedResponse(coachID, body.responseID);
  }
}
