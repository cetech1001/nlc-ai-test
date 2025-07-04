import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get complete dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  getDashboardData() {
    return this.dashboardService.getDashboardData();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue data by period' })
  @ApiQuery({ name: 'period', enum: ['week', 'month', 'year'], required: false })
  @ApiResponse({ status: 200, description: 'Revenue data retrieved successfully' })
  getRevenueData(@Query('period') period: 'week' | 'month' | 'year' = 'year') {
    return this.dashboardService.getRevenueData(period);
  }

  @Get('recent-coaches')
  @ApiOperation({ summary: 'Get recently joined coaches' })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({ status: 200, description: 'Recent coaches retrieved successfully' })
  getRecentCoaches(@Query('limit') limit: string = '6') {
    return this.dashboardService.getRecentCoaches(parseInt(limit));
  }
}
