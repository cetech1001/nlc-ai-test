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
import { ClientsService } from './clients.service';
import {CreateClientDto, UpdateClientDto, ClientQueryDto, AssignCoachDto} from './dto';
import { UserTypes, CurrentUser, UserTypesGuard } from '@nlc-ai/api-auth';
import { type AuthUser, UserType } from '@nlc-ai/types';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(UserTypesGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @UserTypes(UserType.ADMIN, UserType.COACH)
  @ApiOperation({ summary: 'Get all clients for authenticated coach or admin' })
  @ApiResponse({ status: 200, description: 'Clients retrieved successfully' })
  findAll(@Query() query: ClientQueryDto, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.COACH ? user.id : query.coachID;
    return this.clientsService.findAll(query, coachID);
  }

  @Get('stats')
  @UserTypes(UserType.ADMIN, UserType.COACH)
  @ApiOperation({ summary: 'Get client statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@CurrentUser() user: AuthUser, @Query('coachID') coachID?: string) {
    const targetCoachID = user.type === UserType.COACH ? user.id : coachID;
    return this.clientsService.getClientStats(targetCoachID);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific client by ID' })
  @ApiResponse({ status: 200, description: 'Client retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.COACH ? user.id : undefined;
    return this.clientsService.findOne(id, coachID);
  }

  @Post()
  @UserTypes(UserType.ADMIN, UserType.COACH)
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  create(@Body() createClientDto: CreateClientDto, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.COACH ? user.id : createClientDto.coachID;
    return this.clientsService.create(createClientDto, coachID);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentUser() user: AuthUser
  ) {
    const coachID = user.type === UserType.COACH ? user.id : undefined;
    return this.clientsService.update(id, updateClientDto, coachID);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.COACH ? user.id : undefined;
    return this.clientsService.remove(id, coachID);
  }

  @Post(':id/assign-coach')
  @UserTypes(UserType.ADMIN, UserType.COACH)
  @ApiOperation({ summary: 'Assign a coach to a client' })
  assignCoach(
    @Param('id') clientID: string,
    @Body() assignCoachDto: AssignCoachDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.clientsService.assignCoach(clientID, assignCoachDto, user.id);
  }

  @Delete(':id/coaches/:coachID')
  @UserTypes(UserType.ADMIN, UserType.COACH)
  @ApiOperation({ summary: 'Remove coach from client' })
  removeCoach(
    @Param('id') clientID: string,
    @Param('coachID') coachID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.clientsService.removeCoach(clientID, coachID, user.id);
  }

  @Get(':id/coaches')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({ summary: 'Get client\'s coaches' })
  getClientCoaches(@Param('id') clientID: string, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.COACH ? user.id : undefined;
    return this.clientsService.getClientCoaches(clientID, coachID);
  }

  @Patch(':id/primary-coach')
  @UserTypes(UserType.ADMIN, UserType.COACH)
  @ApiOperation({ summary: 'Set primary coach for client' })
  setPrimaryCoach(
    @Param('id') clientID: string,
    @Body('coachID') coachID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.clientsService.setPrimaryCoach(clientID, coachID, user.id);
  }
}
