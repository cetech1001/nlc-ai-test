import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';
import { SyncService } from './sync.service';
import { SyncAccountDto, BulkSyncDto } from './dto';

@ApiTags('Email Sync')
@Controller('sync')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach)
@ApiBearerAuth()
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('account')
  @ApiOperation({ summary: 'Sync a specific email account' })
  @ApiResponse({ status: 200, description: 'Sync job queued successfully' })
  async syncAccount(@Body() body: SyncAccountDto) {
    return this.syncService.syncAccount(body);
  }

  @Post('all')
  @ApiOperation({ summary: 'Sync all email accounts for the authenticated coach' })
  @ApiResponse({ status: 200, description: 'Sync jobs queued successfully' })
  async syncAllAccounts(@CurrentUser('id') id: string) {
    return this.syncService.syncAllAccountsForCoach(id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk sync multiple accounts' })
  @ApiResponse({ status: 200, description: 'Bulk sync jobs queued successfully' })
  async bulkSync(@Body() body: BulkSyncDto) {
    return this.syncService.bulkSync(body);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get email sync statistics' })
  @ApiResponse({ status: 200, description: 'Email stats retrieved successfully' })
  async getSyncStats(@CurrentUser() user: AuthUser) {
    return this.syncService.getSyncStats(user.id);
  }

  @Post('account/:accountID')
  @ApiOperation({ summary: 'Sync specific account by ID' })
  @ApiResponse({ status: 200, description: 'Sync job queued successfully' })
  async syncAccountByID(
    @Param('accountID') accountID: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.syncService.syncAccount({
      accountID,
      forceFull: false,
    });
  }
}
