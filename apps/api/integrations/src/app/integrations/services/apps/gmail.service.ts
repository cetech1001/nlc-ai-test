import {BadRequestException, Injectable} from "@nestjs/common";
import {
  AppPlatform,
  AuthType,
  Integration,
  IntegrationType,
  OAuthCredentials,
  SyncResult,
  TestResult
} from "@nlc-ai/api-types";
import {BaseIntegrationService} from "../base-integration.service";

@Injectable()
export class GmailService extends BaseIntegrationService {
  platformName = AppPlatform.GMAIL;
  integrationType = IntegrationType.APP;
  authType = AuthType.OAUTH;

  async connect(coachID: string, credentials: OAuthCredentials): Promise<Integration> {
    const profile = await this.getEmailProfile(credentials.accessToken);
    try {
      return this.saveIntegration({
        coachID,
        integrationType: this.integrationType,
        platformName: this.platformName,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        tokenExpiresAt: credentials.tokenExpiresAt,
        config: {
          emailAddress: profile.email,
          name: profile.name,
          picture: profile.picture,
          isPrimary: await this.isFirstEmailAccount(coachID),
        },
        syncSettings: {
          autoSync: true,
          syncFrequency: 'hourly',
          syncEmails: true,
          syncSent: true,
        },
        isActive: true,
      });
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to save gmail integration');
    }
  }

  async test(integration: Integration): Promise<TestResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const validToken = await this.tokenService.ensureValidToken(integration, accessToken);

      await this.getEmailProfile(validToken);
      return { success: true, message: 'Gmail connection working' };
    } catch (error: any) {
      return { success: false, message: `Gmail test failed: ${error.message}` };
    }
  }

  async sync(integration: Integration): Promise<SyncResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const validToken = await this.tokenService.ensureValidToken(integration, accessToken);

      const emails = await this.fetchRecentEmails(validToken);
      const threads = await this.fetchEmailThreads(validToken);

      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          config: {
            ...integration.config,
            emailCount: emails.length,
            threadCount: threads.length,
            lastSync: new Date().toISOString(),
          },
          lastSyncAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Gmail synced successfully',
        data: { emailCount: emails.length, threadCount: threads.length },
      };
    } catch (error: any) {
      return { success: false, message: `Gmail sync failed: ${error.message}` };
    }
  }

  async getAuthUrl(coachID: string): Promise<{ authUrl: string; state: string }> {
    const state = this.stateTokenService.generateState(coachID, this.platformName);

    const params = new URLSearchParams({
      client_id: this.configService.get('GOOGLE_CLIENT_ID', ''),
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' '),
      redirect_uri: `${this.configService.get('API_BASE_URL')}/integrations/auth/gmail/callback`,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return {
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      state,
    };
  }

  async handleCallback(coachID: string, code: string, state: string): Promise<Integration> {
    const tokenData = await this.exchangeCodeForToken(code);
    return this.connect(coachID, tokenData);
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.configService.get('GOOGLE_CLIENT_ID', ''),
      client_secret: this.configService.get('GOOGLE_CLIENT_SECRET', ''),
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${this.configService.get('API_BASE_URL')}/integrations/auth/gmail/callback`,
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokenData: any = await response.json();

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
    };
  }

  private async getEmailProfile(accessToken: string): Promise<any> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    return response.json();
  }

  private async fetchRecentEmails(accessToken: string) {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data: any = await response.json();
    return data.messages || [];
  }

  private async fetchEmailThreads(accessToken: string) {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data: any = await response.json();
    return data.threads || [];
  }

  private async isFirstEmailAccount(coachID: string): Promise<boolean> {
    const existingAccounts = await this.prisma.integration.count({
      where: { coachID, integrationType: 'app', platformName: { in: ['gmail', 'outlook'] } },
    });
    return existingAccounts === 0;
  }
}
