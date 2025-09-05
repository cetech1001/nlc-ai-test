import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';
import { ToggleEmailSyncRequest, EmailAccountStatsQuery } from '@nlc-ai/api-types';
import { EmailAccountsService } from './email-accounts.service';

@ApiTags('Email Accounts')
@Controller('email-accounts')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach)
@ApiBearerAuth()
export class EmailAccountsController {
  constructor(private readonly emailAccountsService: EmailAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all email accounts for the authenticated coach' })
  @ApiResponse({ status: 200, description: 'Email accounts retrieved successfully' })
  getEmailAccounts(@CurrentUser() user: AuthUser) {
    return this.emailAccountsService.getEmailAccounts(user.id);
  }

  @Get('auth/:provider/url')
  @ApiOperation({ summary: 'Get OAuth authorization URL for email provider' })
  @ApiResponse({ status: 200, description: 'Authorization URL generated' })
  getEmailAuthUrl(
    @CurrentUser() user: AuthUser,
    @Param('provider') provider: string
  ) {
    return this.emailAccountsService.getEmailAuthUrl(user.id, provider);
  }

  @Post('auth/:provider/callback')
  @ApiOperation({ summary: 'Handle OAuth callback from email provider' })
  @ApiResponse({ status: 200, description: 'OAuth callback processed successfully' })
  handleEmailOAuthCallback(
    @CurrentUser() user: AuthUser,
    @Param('provider') provider: string,
    @Body() body: { code: string; state?: string }
  ) {
    return this.emailAccountsService.handleEmailOAuthCallback(
      user.id,
      user.type,
      provider,
      body.code,
      body.state
    );
  }

  @Post(':accountID/set-primary')
  @ApiOperation({ summary: 'Set email account as primary' })
  @ApiResponse({ status: 200, description: 'Primary email account updated' })
  setPrimaryEmailAccount(
    @CurrentUser() user: AuthUser,
    @Param('accountID') accountID: string
  ) {
    return this.emailAccountsService.setPrimaryEmailAccount(user.id, accountID);
  }

  @Post(':accountID/sync')
  @ApiOperation({ summary: 'Manually sync email account' })
  @ApiResponse({ status: 200, description: 'Email sync initiated' })
  syncEmailAccount(
    @CurrentUser() user: AuthUser,
    @Param('accountID') accountID: string
  ) {
    return this.emailAccountsService.syncEmailAccount(user.id, user.type, accountID);
  }

  @Post(':accountID/test')
  @ApiOperation({ summary: 'Test email account connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  testEmailAccount(
    @CurrentUser() user: AuthUser,
    @Param('accountID') accountID: string
  ) {
    return this.emailAccountsService.testEmailAccount(user.id, accountID);
  }

  @Delete(':accountID')
  @ApiOperation({ summary: 'Disconnect email account' })
  @ApiResponse({ status: 200, description: 'Email account disconnected' })
  disconnectEmailAccount(
    @CurrentUser() user: AuthUser,
    @Param('accountID') accountID: string
  ) {
    return this.emailAccountsService.disconnectEmailAccount(user.id, user.type, accountID);
  }

  @Post(':accountID/toggle')
  @ApiOperation({ summary: 'Toggle email account sync' })
  @ApiResponse({ status: 200, description: 'Email account sync toggled' })
  toggleEmailAccountSync(
    @CurrentUser() user: AuthUser,
    @Param('accountID') accountID: string,
    @Body() body: ToggleEmailSyncRequest
  ) {
    return this.emailAccountsService.toggleEmailAccountSync(
      user.id,
      accountID,
      body.syncEnabled
    );
  }

  @Get(':accountID/stats')
  @ApiOperation({ summary: 'Get email account statistics' })
  @ApiResponse({ status: 200, description: 'Email account stats retrieved' })
  getEmailAccountStats(
    @CurrentUser() user: AuthUser,
    @Param('accountID') accountID: string,
    @Query() query: EmailAccountStatsQuery
  ) {
    const daysParsed = query.days ? parseInt(query.days) : 30;
    return this.emailAccountsService.getEmailAccountStats(user.id, accountID, daysParsed);
  }
}
