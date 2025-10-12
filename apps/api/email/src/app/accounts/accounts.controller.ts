import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';
import { AccountsService } from './accounts.service';

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

  @Get('exists')
  @ApiOperation({ summary: 'Check if the authenticated coach has an email account' })
  @ApiResponse({ status: 200, description: 'Email accounts retrieved successfully' })
  hasAnAccount(@CurrentUser() user: AuthUser) {
    return this.accountsService.hasAnAccount(user.id);
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

  @Get(':accountID/status')
  @ApiOperation({ summary: 'Get account connection status' })
  @ApiResponse({ status: 200, description: 'Account status retrieved successfully' })
  getAccountStatus(
    @Param('accountID') accountID: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.accountsService.getAccountStatus(accountID, user.id);
  }
}
