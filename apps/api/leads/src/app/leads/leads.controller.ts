import {Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,} from '@nestjs/common';
import {ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {CurrentUser, JwtAuthGuard, AntiSpamGuard, Public, UserTypes, UserTypesGuard} from '@nlc-ai/api-auth';
import {type AuthUser, UserType} from '@nlc-ai/api-types';
import {LeadsService} from './leads.service';
import {CreateLandingLeadDto, CreateLeadDto, LeadQueryDto, UpdateLeadDto} from './dto';

@ApiTags('Leads')
@Controller('')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.coach, UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all leads with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  findAll(@Query() query: LeadQueryDto, @CurrentUser() user: AuthUser) {
    const coachID = user.type === UserType.coach ? user.id : query.coachID;
    return this.leadsService.findAll({
      ...query,
      coachID
    });
  }

  @Get('qualified')
  @Public()
  @ApiOperation({ summary: 'Get qualified leads count' })
  @ApiResponse({ status: 200, description: 'Qualified leads count retrieved successfully' })
  getQualifiedLeads() {
    return this.leadsService.getQualifiedLeads();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.coach, UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@CurrentUser() user: AuthUser) {
    return this.leadsService.getStats(user.type === UserType.coach ? user.id : undefined);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.coach, UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.coach, UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(
    @Body() createLeadDto: CreateLeadDto,
    @CurrentUser() user: AuthUser,
  ) {
    let coachID = undefined;
    if (user.type === UserType.coach) {
      coachID = user.id;
    }
    return this.leadsService.create(createLeadDto, coachID);
  }

  @Post('landing')
  @Public()
  @UseGuards(AntiSpamGuard)
  @ApiOperation({ summary: 'Create a new lead from landing page form' })
  @ApiHeader({
    name: 'x-anti-spam-token',
    required: true,
    description: 'Shared secret token for form submissions'
  })
  @ApiHeader({
    name: 'x-anti-spam-timestamp',
    required: true,
    description: 'Unix epoch milliseconds when the request was signed'
  })
  @ApiHeader({
    name: 'x-anti-spam-signature',
    required: true,
    description: 'HMAC-SHA256 of method|path|rawBody|timestamp using the shared secret'
  })
  @ApiResponse({ status: 201, description: 'Landing lead created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Missing or invalid landing headers' })
  @ApiResponse({ status: 403, description: 'Replay detected' })
  createFromLanding(@Body() dto: CreateLandingLeadDto) {
    return this.leadsService.createFromLanding(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.coach, UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.coach, UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lead status' })
  @ApiResponse({ status: 200, description: 'Lead status updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: string }
  ) {
    return this.leadsService.updateStatus(id, statusDto.status);
  }

  @Post(':id/contact')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.coach, UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark lead as contacted' })
  @ApiResponse({ status: 200, description: 'Lead marked as contacted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  markAsContacted(
    @Param('id') id: string,
    @Body() contactDto: {
      contactMethod: 'email' | 'phone' | 'meeting';
      notes?: string;
    }
  ) {
    return this.leadsService.markAsContacted(id, contactDto.contactMethod, contactDto.notes);
  }

  @Post(':id/schedule-meeting')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.coach, UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule meeting for lead' })
  @ApiResponse({ status: 200, description: 'Meeting scheduled successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  scheduleMeeting(
    @Param('id') id: string,
    @Body() meetingDto: {
      meetingDate: string;
      meetingTime?: string;
    }
  ) {
    return this.leadsService.scheduleMeeting(id, meetingDto.meetingDate, meetingDto.meetingTime);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.coach, UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a lead (permanent deletion)' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
