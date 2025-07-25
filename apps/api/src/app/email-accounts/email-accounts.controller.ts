import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailAccountsService } from './email-accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTypes } from '../auth/decorators/user-types.decorator';
import { UserTypesGuard } from '../auth/guards/user-types.guard';
import { UserType } from '@nlc-ai/types';

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
  getEmailAccounts(@Request() req: { user: { id: string } }) {
    return this.emailAccountsService.getEmailAccounts(req.user.id);
  }

  @Get('auth/:provider/url')
  @ApiOperation({ summary: 'Get OAuth authorization URL for email provider' })
  @ApiResponse({ status: 200, description: 'Authorization URL generated' })
  getEmailAuthUrl(
    @Request() req: { user: { id: string } },
    @Param('provider') provider: string
  ) {
    return this.emailAccountsService.getEmailAuthUrl(req.user.id, provider);
  }

  @Post('auth/:provider/callback')
  @ApiOperation({ summary: 'Handle OAuth callback from email provider' })
  @ApiResponse({ status: 200, description: 'OAuth callback processed successfully' })
  handleEmailOAuthCallback(
    @Request() req: { user: { id: string } },
    @Param('provider') provider: string,
    @Body() body: { code: string; state?: string }
  ) {
    return this.emailAccountsService.handleEmailOAuthCallback(
      req.user.id,
      provider,
      body.code,
      body.state
    );
  }

  @Post(':accountID/set-primary')
  @ApiOperation({ summary: 'Set email account as primary' })
  @ApiResponse({ status: 200, description: 'Primary email account updated' })
  setPrimaryEmailAccount(
    @Request() req: { user: { id: string } },
    @Param('accountID') accountID: string
  ) {
    return this.emailAccountsService.setPrimaryEmailAccount(req.user.id, accountID);
  }

  @Post(':accountID/sync')
  @ApiOperation({ summary: 'Manually sync email account' })
  @ApiResponse({ status: 200, description: 'Email sync initiated' })
  syncEmailAccount(
    @Request() req: { user: { id: string } },
    @Param('accountID') accountID: string
  ) {
    return this.emailAccountsService.syncEmailAccount(req.user.id, accountID);
  }

  @Post(':accountID/test')
  @ApiOperation({ summary: 'Test email account connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  testEmailAccount(
    @Request() req: { user: { id: string } },
    @Param('accountID') accountID: string
  ) {
    return this.emailAccountsService.testEmailAccount(req.user.id, accountID);
  }

  @Delete(':accountID')
  @ApiOperation({ summary: 'Disconnect email account' })
  @ApiResponse({ status: 200, description: 'Email account disconnected' })
  disconnectEmailAccount(
    @Request() req: { user: { id: string } },
    @Param('accountID') accountID: string
  ) {
    return this.emailAccountsService.disconnectEmailAccount(req.user.id, accountID);
  }

  @Post(':accountID/toggle')
  @ApiOperation({ summary: 'Toggle email account sync' })
  @ApiResponse({ status: 200, description: 'Email account sync toggled' })
  toggleEmailAccountSync(
    @Request() req: { user: { id: string } },
    @Param('accountID') accountID: string,
    @Body() body: { syncEnabled: boolean }
  ) {
    return this.emailAccountsService.toggleEmailAccountSync(
      req.user.id,
      accountID,
      body.syncEnabled
    );
  }

  @Get(':accountID/stats')
  @ApiOperation({ summary: 'Get email account statistics' })
  @ApiResponse({ status: 200, description: 'Email account stats retrieved' })
  getEmailAccountStats(
    @Request() req: { user: { id: string } },
    @Param('accountID') accountID: string,
    @Query('days') days?: string
  ) {
    const daysParsed = days ? parseInt(days) : 30;
    return this.emailAccountsService.getEmailAccountStats(req.user.id, accountID, daysParsed);
  }
}
