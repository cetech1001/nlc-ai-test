import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { LeadsService} from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTypes } from '../auth/decorators/user-types.decorator';
import { UserTypesGuard } from '../auth/guards/user-types.guard';
import {CreateLeadDto, LeadQueryDto, UpdateLeadDto, CreateLandingLeadDto} from "./dto";
import {AuthUser, UserType} from "@nlc-ai/types";
import { Public } from '../auth/decorators/public.decorator';
import { LandingTokenGuard } from '../auth/guards/landing-token.guard';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin)
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all leads with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  findAll(@Query() query: LeadQueryDto, @Req() req: { user: AuthUser }) {
    if (req.user.type === UserType.coach) {
      query.coachID = req.user.id;
    }
    return this.leadsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@Req() req: { user: AuthUser }) {
    let coachID = req.user.type === UserType.coach ? req.user.id : undefined;
    return this.leadsService.getStats(coachID);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @Public()
  @UseGuards(LandingTokenGuard)
  @ApiOperation({ summary: 'Create a new lead (simple shape)' })
  @ApiHeader({ name: 'X-Landing-Token', required: true, description: 'Shared secret token for landing page submissions' })
  @ApiHeader({ name: 'X-Landing-Timestamp', required: true, description: 'Unix epoch milliseconds when the request was signed' })
  @ApiHeader({ name: 'X-Landing-Signature', required: true, description: 'HMAC-SHA256 of method|path|rawBody|timestamp using the shared secret' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Missing or invalid landing headers' })
  @ApiResponse({ status: 403, description: 'Replay detected' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Post('landing')
  @Public()
  @UseGuards(LandingTokenGuard)
  @ApiOperation({ summary: 'Create a new lead from landing page form' })
  @ApiHeader({ name: 'X-Landing-Token', required: true, description: 'Shared secret token for landing page submissions' })
  @ApiHeader({ name: 'X-Landing-Timestamp', required: true, description: 'Unix epoch milliseconds when the request was signed' })
  @ApiHeader({ name: 'X-Landing-Signature', required: true, description: 'HMAC-SHA256 of method|path|rawBody|timestamp using the shared secret' })
  @ApiResponse({ status: 201, description: 'Landing lead created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Missing or invalid landing headers' })
  @ApiResponse({ status: 403, description: 'Replay detected' })
  createFromLanding(@Body() dto: CreateLandingLeadDto) {
    return this.leadsService.createFromLanding(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update lead status' })
  @ApiResponse({ status: 200, description: 'Lead status updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: string }
  ) {
    return this.leadsService.updateStatus(id, statusDto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lead (permanent deletion)' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
