import { Controller, Get, Post, Body, UseGuards, Request, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('System Settings')
@Controller('system-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get('calendly')
  @ApiOperation({ summary: 'Get Calendly integration settings' })
  @ApiResponse({ status: 200, description: 'Calendly settings retrieved successfully' })
  getCalendlySettings(@Request() req: { user: { id: string } }) {
    return this.systemSettingsService.getCalendlySettings(req.user.id);
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
