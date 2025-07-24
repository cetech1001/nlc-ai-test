import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserTypesGuard } from '../../auth/guards/user-types.guard';
import { UserTypes } from '../../auth/decorators/user-types.decorator';
import { EmailDeliverabilityService } from './email-deliverability.service';
import { AuthUser, UserType } from '@nlc-ai/types';
import {AnalyzeEmailDto, QuickCheckDto} from "./dto/analyze-email.dto";

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
    @Request() req: { user: AuthUser }
  ) {
    // If coach, set their ID automatically
    if (req.user.type === UserType.coach) {
      body.coachID = req.user.id;
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
