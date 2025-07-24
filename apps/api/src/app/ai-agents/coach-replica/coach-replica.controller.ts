import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CoachReplicaService } from './coach-replica.service';
import { AuthUser, UserType, type CoachReplicaRequest } from '@nlc-ai/types';

@ApiTags('Coach Replica Agent')
@Controller('ai-agents/coach-replica')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.coach, UserType.admin)
@ApiBearerAuth()
export class CoachReplicaController {
  constructor(private readonly coachReplicaService: CoachReplicaService) {}

  @Get('profile/:coachID')
  @ApiOperation({ summary: 'Get coach knowledge profile' })
  @ApiResponse({ status: 200, description: 'Coach knowledge profile retrieved successfully' })
  async getCoachProfile(
    @Request() req: { user: AuthUser },
    @Param('coachID') coachID: string,
    @Query('refresh') refresh?: string,
  ) {
    // Ensure coaches can only access their own profile unless admin
    if (req.user.type === UserType.coach && req.user.id !== coachID) {
      coachID = req.user.id;
    }

    const forceRefresh = refresh === 'true';
    return this.coachReplicaService.getCoachKnowledgeProfile(coachID, forceRefresh);
  }

  @Get('profile/:coachID/stats')
  @ApiOperation({ summary: 'Get knowledge profile statistics' })
  @ApiResponse({ status: 200, description: 'Profile stats retrieved successfully' })
  async getProfileStats(
    @Param('coachID') coachID: string,
    @Request() req: { user: AuthUser }
  ) {
    // Ensure coaches can only access their own stats unless admin
    if (req.user.type === UserType.coach && req.user.id !== coachID) {
      coachID = req.user.id;
    }

    return this.coachReplicaService.getKnowledgeProfileStats(coachID);
  }

  @Post('generate-response')
  @ApiOperation({ summary: 'Generate AI response using coach replica' })
  @ApiResponse({ status: 200, description: 'Response generated successfully' })
  async generateResponse(
    @Body() request: CoachReplicaRequest,
    @Request() req: { user: AuthUser }
  ) {
    // Ensure coaches can only generate responses for themselves unless admin
    if (req.user.type === UserType.coach && req.user.id !== request.coachID) {
      request.coachID = req.user.id;
    }

    return this.coachReplicaService.generateCoachResponse(request);
  }

  @Post('test/:coachID')
  @ApiOperation({ summary: 'Test coach replica with sample query' })
  @ApiResponse({ status: 200, description: 'Test completed successfully' })
  async testReplica(
    @Param('coachID') coachID: string,
    @Body() body: { query: string },
    @Request() req: { user: AuthUser }
  ) {
    // Ensure coaches can only test their own replica unless admin
    if (req.user.type === UserType.coach && req.user.id !== coachID) {
      coachID = req.user.id;
    }

    return this.coachReplicaService.testCoachReplica(coachID, body.query);
  }

  @Post('clear-cache/:coachID')
  @ApiOperation({ summary: 'Clear knowledge profile cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearCache(
    @Param('coachID') coachID: string,
    @Request() req: { user: AuthUser }
  ) {
    // Ensure coaches can only clear their own cache unless admin
    if (req.user.type === UserType.coach && req.user.id !== coachID) {
      coachID = req.user.id;
    }

    this.coachReplicaService.clearCoachCache(coachID);
    return { message: 'Cache cleared successfully' };
  }

  // Helper endpoint for other agents to get coach knowledge
  @Get('knowledge/:coachID')
  @ApiOperation({ summary: 'Get coach knowledge for other AI agents (internal use)' })
  @ApiResponse({ status: 200, description: 'Coach knowledge retrieved for agent use' })
  async getCoachKnowledge(
    @Param('coachID') coachID: string,
    @Request() req: { user: AuthUser }
  ) {
    // This endpoint is for internal agent use
    // Still enforce permissions
    if (req.user.type === UserType.coach && req.user.id !== coachID) {
      coachID = req.user.id;
    }

    return this.coachReplicaService.getCoachKnowledgeProfile(coachID);
  }
}
