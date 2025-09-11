import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';
import { ClientEmailService } from './client-email.service';

@ApiTags('Client Email Response Agent')
@Controller('client-email')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin)
@ApiBearerAuth()
export class ClientEmailController {
  constructor(
    private readonly clientEmailResponseService: ClientEmailService,
  ) {}

  @Post('generate/:threadID')
  @ApiOperation({ summary: 'Generate AI response for client email thread' })
  @ApiResponse({ status: 200, description: 'Response generated successfully' })
  async generateResponse(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string,
    @Body() body?: { customInstructions?: string }
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailResponseService.generateResponse(
      coachID,
      threadID,
      body?.customInstructions
    );
  }

  @Post('regenerate/:responseID')
  @ApiOperation({ summary: 'Regenerate existing response with new instructions' })
  @ApiResponse({ status: 200, description: 'Response regenerated successfully' })
  async regenerateResponse(
    @CurrentUser() user: AuthUser,
    @Param('responseID') responseID: string,
    @Body() body?: { customInstructions?: string }
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailResponseService.regenerateResponse(
      coachID,
      responseID,
      body?.customInstructions
    );
  }

  @Get('responses/:threadID')
  @ApiOperation({ summary: 'Get generated responses for thread' })
  @ApiResponse({ status: 200, description: 'Responses retrieved successfully' })
  async getResponsesForThread(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailResponseService.getResponsesForThread(coachID, threadID);
  }

  @Get('responses')
  @ApiOperation({ summary: 'Get all generated responses for coach' })
  @ApiResponse({ status: 200, description: 'Responses retrieved successfully' })
  async getAllResponses(@CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailResponseService.getAllResponses(coachID);
  }

  @Post('responses/:responseID/update')
  @ApiOperation({ summary: 'Update generated response before sending' })
  @ApiResponse({ status: 200, description: 'Response updated successfully' })
  async updateResponse(
    @CurrentUser() user: AuthUser,
    @Param('responseID') responseID: string,
    @Body() body: { subject?: string; body?: string }
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailResponseService.updateResponse(coachID, responseID, body);
  }

  /*@Post('responses/:responseID/analyze-deliverability')
  @ApiOperation({ summary: 'Analyze deliverability of generated response' })
  @ApiResponse({ status: 200, description: 'Deliverability analysis completed' })
  async analyzeDeliverability(
    @CurrentUser() user: AuthUser,
    @Param('responseID') responseID: string
  ) {
    const coachID = user.type === UserType.coach ? user.id : user.id;
    return this.clientEmailResponseService.analyzeResponseDeliverability(coachID, responseID);
  }*/
}
