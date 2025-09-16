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
import { InvitesService } from '../services/invites.service';
import { CreateInviteDto, InviteQueryDto } from '../dto';
import { JwtAuthGuard, UserTypesGuard, UserTypes, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';

@ApiTags('Client Invitations')
@Controller('invites')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin)
@ApiBearerAuth()
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Get()
  @ApiOperation({ summary: 'Get client invitations' })
  @ApiResponse({ status: 200, description: 'Invitations retrieved successfully' })
  findAll(@Query() query: InviteQueryDto, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : query.coachID;
    return this.invitesService.findAll(query, coachID);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific invitation' })
  @ApiResponse({ status: 200, description: 'Invitation retrieved successfully' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : undefined;
    return this.invitesService.findOne(id, coachID);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new client invitation' })
  @ApiResponse({ status: 201, description: 'Invitation created successfully' })
  create(@Body() createInviteDto: CreateInviteDto, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : createInviteDto.coachID;
    return this.invitesService.create(createInviteDto, coachID!);
  }

  @Patch(':id/resend')
  @ApiOperation({ summary: 'Resend an invitation' })
  @ApiResponse({ status: 200, description: 'Invitation resent successfully' })
  resend(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : undefined;
    return this.invitesService.resend(id, coachID);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an invitation' })
  @ApiResponse({ status: 200, description: 'Invitation cancelled successfully' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : undefined;
    return this.invitesService.remove(id, coachID);
  }
}
