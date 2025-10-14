import {Injectable} from "@nestjs/common";
import {BaseIntegrationService} from "../base-integration.service";
import {
  AppPlatform,
  AuthType,
  Integration,
  IntegrationType,
  OAuthCredentials,
  SyncResult,
  TestResult, UserType
} from "@nlc-ai/types";

@Injectable()
export class OutlookService extends BaseIntegrationService {
  platformName = AppPlatform.OUTLOOK;
  integrationType = IntegrationType.APP;
  authType = AuthType.OAUTH;

  async connect(userID: string, userType: UserType, credentials: OAuthCredentials): Promise<Integration> {
    const profile = await this.getEmailProfile(credentials.accessToken);

    return this.saveIntegration({
      userID,
      userType,
      integrationType: this.integrationType,
      platformName: this.platformName,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      tokenExpiresAt: credentials.tokenExpiresAt,
      config: {
        emailAddress: profile.mail || profile.userPrincipalName,
        name: profile.displayName,
        isPrimary: await this.isFirstEmailAccount(userID, userType),
      },
      syncSettings: {
        autoSync: true,
        syncFrequency: 'hourly',
        syncEmails: true,
        syncCalendar: true,
      },
      isActive: true,
    });
  }

  async test(integration: Integration): Promise<TestResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      await this.getEmailProfile(accessToken);
      return { success: true, message: 'Outlook connection working' };
    } catch (error: any) {
      return { success: false, message: `Outlook test failed: ${error.message}` };
    }
  }

  async sync(integration: Integration): Promise<SyncResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const emails = await this.fetchRecentEmails(accessToken);

      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          config: {
            ...integration.config,
            emailCount: emails.length,
            lastSync: new Date().toISOString(),
          },
          lastSyncAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Outlook synced successfully',
        data: { emailCount: emails.length },
      };
    } catch (error: any) {
      return { success: false, message: `Outlook sync failed: ${error.message}` };
    }
  }

  async getAuthUrl(userID: string, userType: UserType): Promise<{ authUrl: string; state: string }> {
    const state = this.stateTokenService.generateState(userID, userType, this.platformName);

    const params = new URLSearchParams({
      client_id: this.configService.get('integrations.oauth.microsoft.clientID', ''),
      scope: [
        'https://graph.microsoft.com/Mail.Read',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/User.Read'
      ].join(' '),
      redirect_uri: `${this.configService.get('integrations.baseUrl')}/integrations/auth/outlook/callback`,
      response_type: 'code',
      state,
    });

    return {
      authUrl: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`,
      state,
    };
  }

  async handleCallback(userID: string, userType: UserType, code: string, state: string): Promise<Integration> {
    const tokenData = await this.exchangeCodeForToken(code);
    return this.connect(userID, userType, tokenData);
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.configService.get('integrations.oauth.microsoft.clientID', ''),
      client_secret: this.configService.get('integrations.oauth.microsoft.clientSecret', ''),
      scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/User.Read',
      code,
      redirect_uri: `${this.configService.get('integrations.baseUrl')}/integrations/auth/outlook/callback`,
      grant_type: 'authorization_code',
    });

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
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
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    return response.json();
  }

  private async fetchRecentEmails(accessToken: string) {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/messages?$top=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data: any = await response.json();
    return data.value || [];
  }

  private async isFirstEmailAccount(userID: string, userType: UserType): Promise<boolean> {
    const existingAccounts = await this.prisma.integration.count({
      where: { userID, integrationType: 'app', platformName: { in: ['gmail', 'outlook'] } },
    });
    return existingAccounts === 0;
  }
}
