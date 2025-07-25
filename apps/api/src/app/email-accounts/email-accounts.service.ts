import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailAccount } from '@nlc-ai/types';

interface EmailProviderConfig {
  clientID: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  profileUrl: string;
}

@Injectable()
export class EmailAccountsService {
  private readonly emailProviderConfigs: Record<string, EmailProviderConfig>;
  private readonly logger = new Logger(EmailAccountsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.emailProviderConfigs = {
      google: {
        clientID: this.configService.get('GOOGLE_CLIENT_ID', ''),
        clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET', ''),
        redirectUri: this.configService.get('GOOGLE_EMAIL_REDIRECT_URI', ''),
        scope: [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.modify',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
        ],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        profileUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      },
      microsoft: {
        clientID: this.configService.get('MICROSOFT_CLIENT_ID', ''),
        clientSecret: this.configService.get('MICROSOFT_CLIENT_SECRET', ''),
        redirectUri: this.configService.get('MICROSOFT_EMAIL_REDIRECT_URI', ''),
        scope: [
          'https://graph.microsoft.com/Mail.Read',
          'https://graph.microsoft.com/Mail.Send',
          'https://graph.microsoft.com/User.Read',
        ],
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        profileUrl: 'https://graph.microsoft.com/v1.0/me',
      },
    };
  }

  async getEmailAccounts(coachID: string): Promise<EmailAccount[]> {
    try {
      const emailAccounts = await this.prisma.emailAccount.findMany({
        where: { coachID },
        orderBy: [
          { isPrimary: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      return emailAccounts.map(account => ({
        ...account,
        // Don't expose sensitive tokens
        accessToken: account.accessToken ? '***' : null,
        refreshToken: account.refreshToken ? '***' : null,
      }));
    } catch (error: any) {
      throw new BadRequestException('Failed to retrieve email accounts');
    }
  }

  async getEmailAuthUrl(coachID: string, provider: string): Promise<{ authUrl: string; state: string }> {
    const config = this.emailProviderConfigs[provider];
    if (!config) {
      throw new BadRequestException(`Unsupported email provider: ${provider}`);
    }

    // Generate unique state for CSRF protection
    const state = `${coachID}$${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const params = new URLSearchParams({
      client_id: config.clientID,
      scope: config.scope.join(' '),
      redirect_uri: config.redirectUri,
      response_type: 'code',
      state,
      access_type: 'offline', // For Google refresh tokens
      prompt: 'consent', // Force consent screen for refresh token
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;

    console.log(authUrl);

    return { authUrl, state };
  }

  async handleEmailOAuthCallback(
    coachID: string,
    provider: string,
    code: string,
    state?: string,
  ): Promise<EmailAccount> {
    const config = this.emailProviderConfigs[provider];
    if (!config) {
      throw new BadRequestException(`Unsupported email provider: ${provider}`);
    }

    // Verify state parameter
    if (state && !state.startsWith(coachID)) {
      throw new BadRequestException('Invalid state parameter');
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForToken(provider, code, config);

      // Get user profile
      const profileData = await this.getEmailProfile(provider, tokenResponse.access_token, config);

      // Save email account
      return this.saveEmailAccount(coachID, provider, tokenResponse, profileData);
    } catch (error: any) {
      throw new BadRequestException(`Failed to connect ${provider}: ${error.message}`);
    }
  }

  async setPrimaryEmailAccount(coachID: string, accountID: string): Promise<{ success: boolean; message: string }> {
    const emailAccount = await this.findEmailAccountByIDAndCoach(accountID, coachID);

    try {
      // Use transaction to ensure consistency
      await this.prisma.$transaction(async (prisma) => {
        // Remove primary from all other accounts
        await prisma.emailAccount.updateMany({
          where: {
            coachID,
            id: { not: accountID },
          },
          data: { isPrimary: false },
        });

        // Set this account as primary
        await prisma.emailAccount.update({
          where: { id: accountID },
          data: { isPrimary: true },
        });
      });

      return {
        success: true,
        message: `${emailAccount.emailAddress} set as primary email account`,
      };
    } catch (error: any) {
      throw new BadRequestException('Failed to set primary email account');
    }
  }

  async syncEmailAccount(coachID: string, accountID: string): Promise<{ success: boolean; message: string }> {
    const emailAccount = await this.findEmailAccountByIDAndCoach(accountID, coachID);

    try {
      // Refresh token if needed
      await this.refreshTokenIfNeeded(emailAccount);

      // Update last sync time
      await this.prisma.emailAccount.update({
        where: { id: accountID },
        data: { lastSyncAt: new Date() },
      });

      // TODO: Implement actual email syncing logic here
      // This would fetch recent emails and store them in EmailThread/EmailMessage tables

      return {
        success: true,
        message: `Successfully synced ${emailAccount.emailAddress}`,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to sync email account: ${error.message}`);
    }
  }

  async testEmailAccount(coachID: string, accountID: string): Promise<{ success: boolean; message: string }> {
    const emailAccount = await this.findEmailAccountByIDAndCoach(accountID, coachID);

    try {
      // Test connection by getting user profile
      const config = this.emailProviderConfigs[emailAccount.provider];
      const profileData = await this.getEmailProfile(
        emailAccount.provider,
        emailAccount.accessToken!,
        config,
      );

      return {
        success: true,
        message: `Successfully connected to ${profileData.email || emailAccount.emailAddress}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
      };
    }
  }

  async disconnectEmailAccount(coachID: string, accountID: string): Promise<{ success: boolean; message: string }> {
    const emailAccount = await this.findEmailAccountByIDAndCoach(accountID, coachID);

    try {
      await this.prisma.emailAccount.delete({
        where: { id: accountID },
      });

      return {
        success: true,
        message: `Successfully disconnected ${emailAccount.emailAddress}`,
      };
    } catch (error: any) {
      throw new BadRequestException('Failed to disconnect email account');
    }
  }

  async toggleEmailAccountSync(
    coachID: string,
    accountID: string,
    syncEnabled: boolean,
  ): Promise<{ success: boolean; message: string }> {
    const emailAccount = await this.findEmailAccountByIDAndCoach(accountID, coachID);

    try {
      await this.prisma.emailAccount.update({
        where: { id: accountID },
        data: { syncEnabled },
      });

      const action = syncEnabled ? 'enabled' : 'disabled';
      return {
        success: true,
        message: `Email sync ${action} for ${emailAccount.emailAddress}`,
      };
    } catch (error: any) {
      throw new BadRequestException('Failed to toggle email sync');
    }
  }

  async getEmailAccountStats(
    coachID: string,
    accountID: string,
    days: number = 30,
  ): Promise<{
    totalThreads: number;
    totalMessages: number;
    unreadThreads: number;
    lastSync: Date | null;
    syncEnabled: boolean;
  }> {
    const emailAccount = await this.findEmailAccountByIDAndCoach(accountID, coachID);

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const [totalThreads, totalMessages, unreadThreads] = await Promise.all([
      this.prisma.emailThread.count({
        where: {
          emailAccountID: accountID,
          createdAt: { gte: dateFrom },
        },
      }),
      this.prisma.emailMessage.count({
        where: {
          emailThread: {
            emailAccountID: accountID,
            createdAt: { gte: dateFrom },
          },
        },
      }),
      this.prisma.emailThread.count({
        where: {
          emailAccountID: accountID,
          isRead: false,
          createdAt: { gte: dateFrom },
        },
      }),
    ]);

    return {
      totalThreads,
      totalMessages,
      unreadThreads,
      lastSync: emailAccount.lastSyncAt,
      syncEnabled: emailAccount.syncEnabled || false,
    };
  }

  private async findEmailAccountByIDAndCoach(accountID: string, coachID: string): Promise<EmailAccount> {
    const emailAccount = await this.prisma.emailAccount.findFirst({
      where: {
        id: accountID,
        coachID,
      },
    });

    if (!emailAccount) {
      throw new NotFoundException('Email account not found');
    }

    return emailAccount;
  }

  private async exchangeCodeForToken(_: string, code: string, config: EmailProviderConfig): Promise<any> {
    const params = new URLSearchParams({
      client_id: config.clientID,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    });

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return response.json();
  }

  private async getEmailProfile(provider: string, accessToken: string, config: EmailProviderConfig) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    };

    const response = await fetch(config.profileUrl, { headers });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Profile fetch failed: ${error}`);
    }

    const data = await response.json();
    return this.normalizeEmailProfile(provider, data);
  }

  private normalizeEmailProfile(provider: string, rawData: any) {
    switch (provider) {
      case 'google':
        return {
          email: rawData.email,
          name: rawData.name,
          picture: rawData.picture,
          verified: rawData.verified_email,
        };

      case 'microsoft':
        return {
          email: rawData.mail || rawData.userPrincipalName,
          name: rawData.displayName,
          picture: null, // Microsoft Graph doesn't return profile picture in basic profile
          verified: true,
        };

      default:
        return rawData;
    }
  }

  private async saveEmailAccount(
    coachID: string,
    provider: string,
    tokenData: any,
    profileData: any,
  ): Promise<EmailAccount> {
    const emailAddress = profileData.email;

    // Check if account already exists
    const existingAccount = await this.prisma.emailAccount.findFirst({
      where: {
        coachID,
        emailAddress,
      },
    });

    const accountData = {
      coachID,
      emailAddress,
      provider,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : null,
      isPrimary: false, // Will be set manually by user
      isActive: true,
      syncEnabled: true,
      lastSyncAt: new Date(),
    };

    if (existingAccount) {
      // Update existing account
      const updatedAccount = await this.prisma.emailAccount.update({
        where: { id: existingAccount.id },
        data: {
          ...accountData,
          updatedAt: new Date(),
        },
      });

      return {
        ...updatedAccount,
        accessToken: '***',
        refreshToken: updatedAccount.refreshToken ? '***' : null,
      };
    } else {
      // Create new account
      const newAccount = await this.prisma.emailAccount.create({
        data: accountData,
      });

      return {
        ...newAccount,
        accessToken: '***',
        refreshToken: newAccount.refreshToken ? '***' : null,
      };
    }
  }

  private async refreshTokenIfNeeded(emailAccount: EmailAccount): Promise<void> {
    if (!emailAccount.tokenExpiresAt || !emailAccount.refreshToken) {
      return;
    }

    // Check if token expires within next 5 minutes
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (emailAccount.tokenExpiresAt > fiveMinutesFromNow) {
      return;
    }

    try {
      const config = this.emailProviderConfigs[emailAccount.provider];
      const params = new URLSearchParams({
        client_id: config.clientID,
        client_secret: config.clientSecret,
        refresh_token: emailAccount.refreshToken,
        grant_type: 'refresh_token',
      });

      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokenData: any = await response.json();

      // Update tokens in database
      await this.prisma.emailAccount.update({
        where: { id: emailAccount.id },
        data: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || emailAccount.refreshToken,
          tokenExpiresAt: tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null,
        },
      });

      this.logger.log(`Refreshed token for ${emailAccount.emailAddress}`);
    } catch (error: any) {
      this.logger.error(`Failed to refresh token for ${emailAccount.emailAddress}:`, error);
      throw error;
    }
  }
}
