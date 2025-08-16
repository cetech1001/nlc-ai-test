import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserTypesGuard } from '../../auth/guards/user-types.guard';
import { UserTypes } from '../../auth/decorators/user-types.decorator';
import { EmailDeliverabilityService } from './email-deliverability.service';
import { type AuthUser, UserType } from '@nlc-ai/types';
import {AnalyzeEmailDto, QuickCheckDto} from "./dto/analyze-email.dto";
import {CurrentUser} from "../../auth/decorators/current-user.decorator";

@ApiTags('Email Deliverability')
@Controller('ai-agents/email-deliverability')
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
}
