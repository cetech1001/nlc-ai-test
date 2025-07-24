import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CleanupService } from './cleanup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTypes } from '../auth/decorators/user-types.decorator';
import { UserTypesGuard } from '../auth/guards/user-types.guard';

@ApiTags('Cleanup')
@Controller('cleanup')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes('admin')
@ApiBearerAuth()
export class CleanupController {
  constructor(private readonly cleanupService: CleanupService) {}

  @Post('coaches/expired')
  @ApiOperation({ summary: 'Manually cleanup expired coach deletions (30+ days)' })
  @ApiResponse({ status: 200, description: 'Expired coaches cleaned up successfully' })
  async cleanupExpiredCoaches() {
    return this.cleanupService.cleanupExpiredCoaches();
  }

  @Post('plans/expired')
  @ApiOperation({ summary: 'Manually cleanup expired plan deletions (30+ days)' })
  @ApiResponse({ status: 200, description: 'Expired plans cleaned up successfully' })
  async cleanupExpiredPlans() {
    return this.cleanupService.cleanupExpiredPlans();
  }

  @Post('all-expired')
  @ApiOperation({ summary: 'Manually cleanup all expired deletions (coaches + plans)' })
  @ApiResponse({ status: 200, description: 'All expired records cleaned up successfully' })
  async cleanupAllExpired() {
    return this.cleanupService.cleanupAll();
  }
}
