import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { CurrentUser, UserTypes, UserTypesGuard } from '@nlc-ai/api-auth';
import { type AuthUser, UserType } from '@nlc-ai/types';

@UseGuards(UserTypesGuard)
@ApiTags('Activity')
@ApiBearerAuth()
@Controller('activity')
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Get('heatmap')
  @UserTypes(UserType.COACH, UserType.CLIENT, UserType.ADMIN)
  @ApiOperation({ summary: 'Get login activity heatmap for current user' })
  @ApiResponse({ status: 200, description: 'Heatmap data retrieved' })
  async getMyHeatmap(
    @CurrentUser() user: AuthUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const data = await this.activity.getUserLoginActivity(
      user.id,
      start,
      end
    );

    return { data };
  }

  @Get('heatmap/:userID')
  @UserTypes(UserType.COACH, UserType.CLIENT, UserType.ADMIN)
  @ApiOperation({ summary: 'Get login activity heatmap for specific user' })
  @ApiResponse({ status: 200, description: 'Heatmap data retrieved' })
  async getUserHeatmap(
    @Param('userID') userID: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const data = await this.activity.getUserLoginActivity(
      userID,
      start,
      end
    );

    return { data };
  }

  @Get('stats')
  @UserTypes(UserType.COACH, UserType.CLIENT, UserType.ADMIN)
  @ApiOperation({ summary: 'Get login statistics for current user' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getMyStats(@CurrentUser() user: AuthUser) {
    return this.activity.getUserLoginStats(user.id);
  }

  @Get('stats/:userID')
  @UserTypes(UserType.COACH, UserType.CLIENT, UserType.ADMIN)
  @ApiOperation({ summary: 'Get login statistics for specific user' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getUserStats(@Param('userID') userID: string) {
    return this.activity.getUserLoginStats(userID);
  }
}
