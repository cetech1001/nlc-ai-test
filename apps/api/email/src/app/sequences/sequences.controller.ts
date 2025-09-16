import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards} from "@nestjs/common";
import {CurrentUser, JwtAuthGuard, UserTypes, UserTypesGuard} from "@nlc-ai/api-auth";
import {UserType} from "@nlc-ai/api-types";
import {SequencesService} from "./sequences.service";
import {type AuthUser} from "@nlc-ai/types";
import {CreateSequenceDto, UpdateSequenceDto} from "./dto";

@ApiTags('Email Sequences')
@Controller('sequences')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach)
@ApiBearerAuth()
export class SequencesController {
  constructor(private readonly emailSequencesService: SequencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get email sequences' })
  @ApiResponse({ status: 200, description: 'Sequences retrieved successfully' })
  async getSequences(
    @CurrentUser('id') userID: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      category,
      isActive: isActive ? isActive === 'true' : undefined,
      search,
    };

    return this.emailSequencesService.getSequences(userID, filters);
  }

  @Get(':sequenceID')
  @ApiOperation({ summary: 'Get specific sequence' })
  @ApiResponse({ status: 200, description: 'Sequence retrieved successfully' })
  async getSequence(
    @CurrentUser('id') userID: string,
    @Param('sequenceID') sequenceID: string,
  ) {
    return this.emailSequencesService.getSequence(userID, sequenceID);
  }

  @Post()
  @ApiOperation({ summary: 'Create email sequence' })
  @ApiResponse({ status: 201, description: 'Sequence created successfully' })
  async createSequence(
    @CurrentUser() user: AuthUser,
    @Body() sequenceData: CreateSequenceDto,
  ) {
    return this.emailSequencesService.createSequence(user, sequenceData);
  }

  @Put(':sequenceID')
  @ApiOperation({ summary: 'Update email sequence' })
  @ApiResponse({ status: 200, description: 'Sequence updated successfully' })
  async updateSequence(
    @CurrentUser('id') userID: string,
    @Param('sequenceID') sequenceID: string,
    @Body() updateData: UpdateSequenceDto,
  ) {
    return this.emailSequencesService.updateSequence(userID, sequenceID, updateData);
  }

  @Delete(':sequenceID')
  @ApiOperation({ summary: 'Delete email sequence' })
  @ApiResponse({ status: 200, description: 'Sequence deleted successfully' })
  async deleteSequence(
    @CurrentUser('id') userID: string,
    @Param('sequenceID') sequenceID: string,
  ) {
    return this.emailSequencesService.deleteSequence(userID, sequenceID);
  }
}
