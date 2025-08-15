import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType } from '@nlc-ai/api-types';
import { PreferencesService } from './preferences.service';
import { UpdatePreferencesDto } from './dto';

@ApiTags('Notification Preferences')
@Controller('preferences')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin, UserType.client)
@ApiBearerAuth()
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved successfully' })
  async getPreferences(
    @CurrentUser('id') userID: string,
    @CurrentUser('type') userType: UserType,
  ) {
    return this.preferencesService.getPreferences(userID, userType);
  }

  @Put()
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(
    @CurrentUser('id') userID: string,
    @CurrentUser('type') userType: UserType,
    @Body() updateDto: UpdatePreferencesDto,
  ) {
    return this.preferencesService.updatePreferences(userID, userType, updateDto);
  }
}
