import { Controller, Get, Post, Body, UseGuards, Request, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTypes } from '../auth/decorators/user-types.decorator';
import { UserTypesGuard } from '../auth/guards/user-types.guard';
import {UserType} from "@nlc-ai/types";

@ApiTags('System Settings')
@Controller('system-settings')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.admin)
@ApiBearerAuth()
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get('calendly')
  @ApiOperation({ summary: 'Get Calendly integration settings' })
  @ApiResponse({ status: 200, description: 'Calendly settings retrieved successfully' })
  getCalendlySettings() {
    return this.systemSettingsService.getCalendlySettings();
  }

  @Post('calendly')
  @ApiOperation({ summary: 'Save Calendly integration settings' })
  @ApiResponse({ status: 200, description: 'Calendly settings saved successfully' })
  saveCalendlySettings(
    @Request() req: { user: { id: string } },
    @Body() body: { accessToken: string }
  ) {
    return this.systemSettingsService.saveCalendlySettings(req.user.id, body.accessToken);
  }

  @Delete('calendly')
  @ApiOperation({ summary: 'Delete Calendly integration settings' })
  @ApiResponse({ status: 200, description: 'Calendly settings deleted successfully' })
  deleteCalendlySettings(@Request() req: { user: { id: string } }) {
    return this.systemSettingsService.deleteCalendlySettings(req.user.id);
  }
}
