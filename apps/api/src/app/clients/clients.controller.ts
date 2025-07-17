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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, ClientQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {UserType} from "@nlc-ai/types";

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.coach)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all clients for authenticated coach' })
  @ApiResponse({ status: 200, description: 'Clients retrieved successfully' })
  findAll(@Query() query: ClientQueryDto, @Request() req: any) {
    return this.clientsService.findAll(query, req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get client statistics for authenticated coach' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@Request() req: any) {
    return this.clientsService.getClientStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific client by ID' })
  @ApiResponse({ status: 200, description: 'Client retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.clientsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  create(@Body() createClientDto: CreateClientDto, @Request() req: any) {
    return this.clientsService.create(createClientDto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @Request() req: any) {
    return this.clientsService.update(id, updateClientDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.clientsService.remove(id, req.user.id);
  }
}
