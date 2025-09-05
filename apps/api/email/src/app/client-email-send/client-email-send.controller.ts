import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';
import { ClientEmailSendService } from './client-email-send.service';

@ApiTags('Client Email Send')
@Controller('client-email-send')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin)
@ApiBearerAuth()
export class ClientEmailSendController {
  constructor(
    private readonly clientEmailSendService: ClientEmailSendService,
  ) {}

  @Post('send/:responseID')
  @ApiOperation({ summary: 'Send generated client email response immediately' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendResponse(
    @CurrentUser() user: AuthUser,
    @Param('responseID') responseID: string,
    @Body() body?: { subject?: string; body?: string }
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailSendService.sendResponse(coachID, responseID, body);
  }

  @Post('schedule/:responseID')
  @ApiOperation({ summary: 'Schedule generated client email response for later' })
  @ApiResponse({ status: 200, description: 'Email scheduled successfully' })
  async scheduleResponse(
    @CurrentUser() user: AuthUser,
    @Param('responseID') responseID: string,
    @Body() body: { scheduledFor: string; subject?: string; body?: string }
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailSendService.scheduleResponse(
      coachID,
      responseID,
      new Date(body.scheduledFor),
      { subject: body.subject, body: body.body }
    );
  }

  @Post('send-custom')
  @ApiOperation({ summary: 'Send custom email to client (not from generated response)' })
  @ApiResponse({ status: 200, description: 'Custom email sent successfully' })
  async sendCustomEmail(
    @CurrentUser() user: AuthUser,
    @Body() body: {
      clientID: string;
      threadID?: string;
      subject: string;
      body: string;
      scheduledFor?: string;
    }
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailSendService.sendCustomEmail(coachID, body);
  }

  @Post('cancel-scheduled/:scheduledEmailID')
  @ApiOperation({ summary: 'Cancel scheduled client email' })
  @ApiResponse({ status: 200, description: 'Scheduled email cancelled' })
  async cancelScheduledEmail(
    @CurrentUser() user: AuthUser,
    @Param('scheduledEmailID') scheduledEmailID: string
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailSendService.cancelScheduledEmail(coachID, scheduledEmailID);
  }
}
