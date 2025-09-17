import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CoachReplicaService } from './coach-replica.service';
import { type AuthUser, UserType, type CoachReplicaRequest } from '@nlc-ai/types';
import {CurrentUser, UserTypes, UserTypesGuard} from "@nlc-ai/api-auth";

@ApiTags('Coach Replica Agent')
@Controller('coach-replica')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN)
@ApiBearerAuth()
export class CoachReplicaController {
  constructor(private readonly coachReplicaService: CoachReplicaService) {}

  @Get('profile/:coachID')
  @ApiOperation({ summary: 'Get coach knowledge profile' })
  @ApiResponse({ status: 200, description: 'Coach knowledge profile retrieved successfully' })
  async getCoachProfile(
    @CurrentUser() user: AuthUser,
    @Param('coachID') coachID: string,
    @Query('refresh') refresh?: string,
  ) {
    if (user.type === UserType.COACH && user.id !== coachID) {
      coachID = user.id;
    }

    const forceRefresh = refresh === 'true';
    return this.coachReplicaService.getCoachKnowledgeProfile(coachID, forceRefresh);
  }

  @Get('profile/:coachID/stats')
  @ApiOperation({ summary: 'Get knowledge profile statistics' })
  @ApiResponse({ status: 200, description: 'Profile stats retrieved successfully' })
  async getProfileStats(
    @Param('coachID') coachID: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.type === UserType.COACH && user.id !== coachID) {
      coachID = user.id;
    }

    return this.coachReplicaService.getKnowledgeProfileStats(coachID);
  }

  @Post('generate-response')
  @ApiOperation({ summary: 'Generate AI response using coach replica' })
  @ApiResponse({ status: 200, description: 'Response generated successfully' })
  async generateResponse(
    @Body() request: CoachReplicaRequest,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.type === UserType.COACH && user.id !== request.coachID) {
      request.coachID = user.id;
    }

    return this.coachReplicaService.generateCoachResponse(request);
  }

  @Post('test/:coachID')
  @ApiOperation({ summary: 'Test coach replica with sample query' })
  @ApiResponse({ status: 200, description: 'Test completed successfully' })
  async testReplica(
    @Param('coachID') coachID: string,
    @Body() body: { query: string },
    @CurrentUser() user: AuthUser,
  ) {
    if (user.type === UserType.COACH && user.id !== coachID) {
      coachID = user.id;
    }

    return this.coachReplicaService.testCoachReplica(coachID, body.query);
  }

  @Post('clear-cache/:coachID')
  @ApiOperation({ summary: 'Clear knowledge profile cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearCache(
    @Param('coachID') coachID: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.type === UserType.COACH && user.id !== coachID) {
      coachID = user.id;
    }

    this.coachReplicaService.clearCoachCache(coachID);
    return { message: 'Cache cleared successfully' };
  }

  @Get('knowledge/:coachID')
  @ApiOperation({ summary: 'Get coach knowledge for other AI agents (internal use)' })
  @ApiResponse({ status: 200, description: 'Coach knowledge retrieved for agent use' })
  async getCoachKnowledge(
    @Param('coachID') coachID: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.type === UserType.COACH && user.id !== coachID) {
      coachID = user.id;
    }

    return this.coachReplicaService.getCoachKnowledgeProfile(coachID);
  }
}
