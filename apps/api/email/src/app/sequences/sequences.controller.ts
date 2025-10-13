import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery
} from "@nestjs/swagger";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { CurrentUser, UserTypes, UserTypesGuard } from "@nlc-ai/api-auth";
import { SequencesService } from "./sequences.service";
import {type AuthUser, EmailSequenceStatus, UserType} from "@nlc-ai/types";
import { CreateSequenceDto, UpdateSequenceDto, ExecuteSequenceDto } from "./dto";

@ApiTags('Email Sequences')
@Controller('sequences')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN)
@ApiBearerAuth()
export class SequencesController {
  constructor(private readonly sequencesService: SequencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all email sequences' })
  @ApiResponse({ status: 200, description: 'Sequences retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, enum: EmailSequenceStatus })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getSequences(
    @CurrentUser('id') userID: string,
    @Query('status') status?: EmailSequenceStatus,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      status,
      isActive: isActive ? isActive === 'true' : undefined,
      search,
    };

    return this.sequencesService.getSequences(userID, filters);
  }

  @Get(':sequenceID')
  @ApiOperation({ summary: 'Get specific sequence' })
  @ApiResponse({ status: 200, description: 'Sequence retrieved successfully' })
  async getSequence(
    @CurrentUser('id') userID: string,
    @Param('sequenceID', ParseUUIDPipe) sequenceID: string,
  ) {
    return this.sequencesService.getSequence(userID, sequenceID);
  }

  @Get(':sequenceID/analytics')
  @ApiOperation({ summary: 'Get sequence analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getSequenceAnalytics(
    @CurrentUser('id') userID: string,
    @Param('sequenceID', ParseUUIDPipe) sequenceID: string,
  ) {
    return this.sequencesService.getSequenceAnalytics(userID, sequenceID);
  }

  @Post()
  @ApiOperation({ summary: 'Create email sequence' })
  @ApiResponse({ status: 201, description: 'Sequence created successfully' })
  async createSequence(
    @CurrentUser() user: AuthUser,
    @Body() sequenceData: CreateSequenceDto,
  ) {
    return this.sequencesService.createSequence(user, sequenceData);
  }

  @Post(':sequenceID/execute')
  @ApiOperation({ summary: 'Execute sequence for a target' })
  @ApiResponse({ status: 200, description: 'Sequence execution started' })
  async executeSequence(
    @CurrentUser('id') userID: string,
    @Param('sequenceID', ParseUUIDPipe) sequenceID: string,
    @Body() executeData: ExecuteSequenceDto,
  ) {
    return this.sequencesService.executeSequence(
      userID,
      sequenceID,
      executeData.targetID,
      executeData.targetType,
      {
        templateVariables: executeData.templateVariables,
        startDate: executeData.startDate,
      }
    );
  }

  @Post(':sequenceID/pause/:targetID')
  @ApiOperation({ summary: 'Pause sequence for a specific target' })
  @ApiResponse({ status: 200, description: 'Sequence paused successfully' })
  async pauseSequenceForTarget(
    @CurrentUser('id') userID: string,
    @Param('sequenceID', ParseUUIDPipe) sequenceID: string,
    @Param('targetID', ParseUUIDPipe) targetID: string,
    @Query('targetType') targetType: UserType,
  ) {
    return this.sequencesService.pauseSequenceForTarget(
      userID,
      sequenceID,
      targetID,
      targetType
    );
  }

  @Post(':sequenceID/resume/:targetID')
  @ApiOperation({ summary: 'Resume sequence for a specific target' })
  @ApiResponse({ status: 200, description: 'Sequence resumed successfully' })
  async resumeSequenceForTarget(
    @CurrentUser('id') userID: string,
    @Param('sequenceID', ParseUUIDPipe) sequenceID: string,
    @Param('targetID', ParseUUIDPipe) targetID: string,
    @Query('targetType') targetType: UserType,
  ) {
    return this.sequencesService.resumeSequenceForTarget(
      userID,
      sequenceID,
      targetID,
      targetType
    );
  }

  @Put(':sequenceID')
  @ApiOperation({ summary: 'Update email sequence' })
  @ApiResponse({ status: 200, description: 'Sequence updated successfully' })
  async updateSequence(
    @CurrentUser('id') userID: string,
    @Param('sequenceID', ParseUUIDPipe) sequenceID: string,
    @Body() updateData: UpdateSequenceDto,
  ) {
    return this.sequencesService.updateSequence(userID, sequenceID, updateData);
  }

  @Delete(':sequenceID')
  @ApiOperation({ summary: 'Delete email sequence' })
  @ApiResponse({ status: 200, description: 'Sequence deleted successfully' })
  async deleteSequence(
    @CurrentUser('id') userID: string,
    @Param('sequenceID', ParseUUIDPipe) sequenceID: string,
  ) {
    return this.sequencesService.deleteSequence(userID, sequenceID);
  }
}
