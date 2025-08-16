import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientCoachService } from './client-coach.service';
import { CreateRelationshipDto, UpdateRelationshipDto, RelationshipQueryDto } from './dto';
import { JwtAuthGuard, UserTypesGuard, UserTypes, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';

@ApiTags('Client-Coach Relationships')
@Controller('relationships')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@ApiBearerAuth()
export class ClientCoachController {
  constructor(private readonly clientCoachService: ClientCoachService) {}

  @Get()
  @UserTypes(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Get client-coach relationships' })
  @ApiResponse({ status: 200, description: 'Relationships retrieved successfully' })
  findAll(@Query() query: RelationshipQueryDto, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : query.coachID;
    return this.clientCoachService.findAll(query, coachID);
  }

  @Get(':id')
  @UserTypes(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Get a specific relationship' })
  @ApiResponse({ status: 200, description: 'Relationship retrieved successfully' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.clientCoachService.findOne(id, user.type === UserType.coach ? user.id : undefined);
  }

  @Post()
  @UserTypes(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Create a new client-coach relationship' })
  @ApiResponse({ status: 201, description: 'Relationship created successfully' })
  create(@Body() createRelationshipDto: CreateRelationshipDto, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : createRelationshipDto.coachID;
    return this.clientCoachService.create(createRelationshipDto, coachID, user.id);
  }

  @Patch(':id')
  @UserTypes(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Update a relationship' })
  @ApiResponse({ status: 200, description: 'Relationship updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateRelationshipDto: UpdateRelationshipDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.clientCoachService.update(id, updateRelationshipDto, user.id);
  }

  @Delete(':id')
  @UserTypes(UserType.admin, UserType.coach)
  @ApiOperation({ summary: 'Remove a client-coach relationship' })
  @ApiResponse({ status: 200, description: 'Relationship removed successfully' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.clientCoachService.remove(id, user.id);
  }
}
