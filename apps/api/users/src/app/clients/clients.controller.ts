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
import { CreateClientDto, UpdateClientDto, ClientQueryDto } from './dto';
import { JwtAuthGuard } from '@nlc-ai/api-auth';
import { UserTypes } from '@nlc-ai/api-auth';
import { UserTypesGuard } from '@nlc-ai/api-auth';
import { UserType } from '@nlc-ai/api-types';
import { CurrentUser } from '@nlc-ai/api-auth';
import { type AuthUser } from '@nlc-ai/api-types';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all clients for authenticated coach or admin' })
  @ApiResponse({ status: 200, description: 'Clients retrieved successfully' })
  findAll(@Query() query: ClientQueryDto, @CurrentUser() user: AuthUser) {
    // For coaches, filter by their ID; admins can see all
    const coachID = user.type === UserType.coach ? user.id : query.coachID;
    return this.clientsService.findAll(query, coachID);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get client statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@CurrentUser() user: AuthUser, @Query('coachID') coachID?: string) {
    const targetCoachID = user.type === UserType.coach ? user.id : coachID;
    return this.clientsService.getClientStats(targetCoachID);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific client by ID' })
  @ApiResponse({ status: 200, description: 'Client retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : undefined;
    return this.clientsService.findOne(id, coachID);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  create(@Body() createClientDto: CreateClientDto, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : createClientDto.coachID;
    return this.clientsService.create(createClientDto, coachID);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : undefined;
    return this.clientsService.update(id, updateClientDto, coachID);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : undefined;
    return this.clientsService.remove(id, coachID);
  }
}
