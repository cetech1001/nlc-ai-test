import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';
import { AccountsService } from './accounts.service';
import { SyncAccountDto, BulkSyncDto } from './dto';

@ApiTags('Accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all email accounts for the authenticated coach' })
  @ApiResponse({ status: 200, description: 'Email accounts retrieved successfully' })
  getEmailAccounts(@CurrentUser() user: AuthUser) {
    return this.accountsService.getEmailAccounts(user.id);
  }

  @Post(':accountID/set-primary')
  @ApiOperation({ summary: 'Set email account as primary' })
  @ApiResponse({ status: 200, description: 'Primary email account updated' })
  setPrimaryEmailAccount(
    @Param('accountID') accountID: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.accountsService.setPrimaryEmailAccount(accountID, user.id);
  }

  @Post('sync')
  async syncAccount(@Body() body: SyncAccountDto) {
    return this.accountsService.syncAccount(body);
  }

  @Post('sync/bulk')
  async bulkSync(@Body() body: BulkSyncDto) {
    return this.accountsService.bulkSync(body);
  }
}
