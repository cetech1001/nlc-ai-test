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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CoachesService } from './coaches.service';
import {CreateCoachDto, UpdateCoachDto, CoachQueryDto, InviteQueryDto, InviteClientDto} from './dto';
import { UserTypesGuard } from '@nlc-ai/api-auth';
import { UserTypes } from '@nlc-ai/api-auth';
import { CurrentUser } from '@nlc-ai/api-auth';
import { type AuthUser, UserType } from '@nlc-ai/types';

@ApiTags('Coaches')
@Controller('coaches')
@UseGuards(UserTypesGuard)
@ApiBearerAuth()
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @UserTypes(UserType.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all coaches with advanced filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Coaches retrieved successfully' })
  findAll(@Query() query: CoachQueryDto) {
    return this.coachesService.findAll(query);
  }

  @Get('stats')
  @UserTypes(UserType.ADMIN)
  @ApiOperation({ summary: 'Get coach statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats() {
    return this.coachesService.getCoachStats();
  }

  @Get(':id')
  @UserTypes(UserType.ADMIN, UserType.COACH)
  @ApiOperation({ summary: 'Get a specific coach by ID' })
  @ApiResponse({ status: 200, description: 'Coach retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    if (user.type === UserType.COACH && user.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.coachesService.findOne(id);
  }

  @Get(':id/kpis')
  @UserTypes(UserType.ADMIN, UserType.COACH)
  @ApiOperation({ summary: 'Get coach KPIs' })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  getKpis(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Query('days') days?: string,
  ) {
    if (user.type === UserType.COACH && user.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.coachesService.getCoachKpis(
      id,
      days ? parseInt(days) : 30,
    );
  }

  @UserTypes(UserType.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new coach' })
  @ApiResponse({ status: 201, description: 'Coach created successfully' })
  create(@Body() createCoachDto: CreateCoachDto) {
    return this.coachesService.create(createCoachDto);
  }

  @Patch(':id')
  @UserTypes(UserType.ADMIN, UserType.COACH)
  @ApiOperation({ summary: 'Update a coach' })
  @ApiResponse({ status: 200, description: 'Coach updated successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  update(@Param('id') id: string, @Body() updateCoachDto: UpdateCoachDto, @CurrentUser() user: AuthUser) {
    if (user.type === UserType.COACH && user.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.coachesService.update(id, updateCoachDto);
  }

  @Patch(':id/toggle-status')
  @UserTypes(UserType.ADMIN)
  @ApiOperation({ summary: 'Toggle coach active status (block/unblock)' })
  @ApiResponse({ status: 200, description: 'Coach status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  toggleStatus(@Param('id') id: string) {
    return this.coachesService.toggleStatus(id);
  }

  @Patch(':id/restore')
  @UserTypes(UserType.ADMIN)
  @ApiOperation({ summary: 'Restore a deleted coach' })
  @ApiResponse({ status: 200, description: 'Coach restored successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  @ApiResponse({ status: 400, description: 'Coach is not deleted' })
  @ApiResponse({ status: 409, description: 'Coach email already exists' })
  restore(@Param('id') id: string) {
    return this.coachesService.restore(id);
  }

  @Delete(':id')
  @UserTypes(UserType.ADMIN)
  @ApiOperation({ summary: 'Deactivate a coach (soft delete)' })
  @ApiResponse({ status: 200, description: 'Coach deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  remove(@Param('id') id: string) {
    return this.coachesService.remove(id);
  }

  @Post(':id/invite-client')
  @UserTypes(UserType.ADMIN, UserType.COACH)
  @ApiOperation({ summary: 'Send client invitation' })
  inviteClient(
    @Param('id') coachID: string,
    @Body() inviteDto: InviteClientDto,
    @CurrentUser() user: AuthUser
  ) {
    if (user.type === UserType.COACH && user.id !== coachID) {
      throw new ForbiddenException('Access denied');
    }
    return this.coachesService.inviteClient(coachID, inviteDto);
  }

  @Get(':id/invites')
  @UserTypes(UserType.ADMIN, UserType.COACH)
  @ApiOperation({ summary: 'Get coach\'s invitations' })
  getInvites(
    @Param('id') coachID: string,
    @Query() query: InviteQueryDto,
    @CurrentUser() user: AuthUser
  ) {
    if (user.type === UserType.COACH && user.id !== coachID) {
      throw new ForbiddenException('Access denied');
    }
    return this.coachesService.getInvites(coachID, query);
  }

  @Delete('invites/:inviteID')
  @UserTypes(UserType.ADMIN, UserType.COACH)
  @ApiOperation({ summary: 'Cancel invitation' })
  cancelInvite(@Param('inviteID') inviteID: string, @CurrentUser() user: AuthUser) {
    return this.coachesService.cancelInvite(inviteID, user.type === UserType.COACH ? user.id : undefined);
  }
}
