import {Injectable} from "@nestjs/common";
import {BaseIntegrationService} from "./base-integration.service";
import {Integration, TestResult, SyncResult, OAuthCredentials} from "@nlc-ai/types";
import {google} from "googleapis";
import {IntegrationError} from "../errors/integration.error";


@Injectable()
export class YoutubeService extends BaseIntegrationService {
  platformName = 'youtube';
  integrationType = 'social' as const;
  authType = 'oauth' as const;

  private youtube = google.youtube('v3');
  private youtubeAnalytics = google.youtubeAnalytics('v2');

  async connect(coachID: string, credentials: OAuthCredentials): Promise<Integration> {
    await this.testCredentials(credentials.accessToken);

    const channelData = await this.getChannelInfo(credentials.accessToken);

    return this.saveIntegration({
      coachID,
      integrationType: this.integrationType,
      platformName: this.platformName,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      tokenExpiresAt: credentials.tokenExpiresAt,
      config: channelData,
      syncSettings: {
        autoSync: true,
        syncFrequency: 'daily',
        syncAnalytics: true,
        syncContent: true,
      },
      isActive: true,
    });
  }

  async getAuthUrl(coachID: string): Promise<{ authUrl: string; state: string }> {
    const state = this.stateTokenService.generateState(coachID, this.platformName);

    const params = new URLSearchParams({
      client_id: this.configService.get('GOOGLE_CLIENT_ID', ''),
      scope: 'https://www.googleapis.com/auth/youtube.readonly',
      redirect_uri: this.configService.get('YOUTUBE_REDIRECT_URI', ''),
      response_type: 'code',
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

  async test(integration: Integration): Promise<TestResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const validToken = await this.tokenService.ensureValidToken(integration, accessToken);

      await this.getChannelInfo(validToken);

      return { success: true, message: 'YouTube connection is working' };
    } catch (error: any) {
      return {
        success: false,
        message: `YouTube connection failed: ${error.message}`
      };
    }
  }

  async sync(integration: Integration): Promise<SyncResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const validToken = await this.tokenService.ensureValidToken(integration, accessToken);

      const [channelStats, analytics] = await Promise.all([
        this.getChannelStats(validToken),
        this.getAnalytics(validToken),
      ]);

      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          config: {
            ...integration.config,
            channelStats,
            analytics,
            lastSync: new Date().toISOString(),
          },
          lastSyncAt: new Date(),
          syncError: null,
        },
      });

      return {
        success: true,
        message: 'YouTube data synced successfully',
        data: { channelStats, analytics },
      };
    } catch (error: any) {
      await this.prisma.integration.update({
        where: { id: integration.id },
        data: { syncError: error.message },
      });

      return {
        success: false,
        message: `Failed to sync YouTube data: ${error.message}`,
      };
    }
  }

  async refreshToken(integration: Integration): Promise<string> {
    const { refreshToken } = await this.getDecryptedTokens(integration);

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await auth.refreshAccessToken();

    const encryptedToken = await this.encryptionService.encrypt(credentials.access_token || '');
    await this.prisma.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: encryptedToken,
        tokenExpiresAt: new Date(Date.now() + 3600000),
      },
    });

    return credentials.access_token || '';
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.configService.get('GOOGLE_CLIENT_ID', ''),
      client_secret: this.configService.get('GOOGLE_CLIENT_SECRET', ''),
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.configService.get('YOUTUBE_REDIRECT_URI', ''),
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new IntegrationError(
        `Token exchange failed: ${error}`,
        'youtube',
        'TOKEN_EXCHANGE_FAILED',
        true
      );
    }

    const tokenData: any = await response.json();

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
    };
  }

  private async testCredentials(accessToken: string): Promise<void> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    await this.youtube.channels.list({
      auth,
      part: ['id'],
      mine: true,
    });
  }

  private async getChannelInfo(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const response = await this.youtube.channels.list({
      auth,
      part: ['snippet', 'statistics'],
      mine: true,
    });

    return response.data.items?.[0] || null;
  }

  private async getChannelStats(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const response = await this.youtube.channels.list({
      auth,
      part: ['statistics'],
      mine: true,
    });

    return response.data.items?.[0]?.statistics || null;
  }

  private async getAnalytics(accessToken: string, days: number = 30) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const analytics = await this.youtubeAnalytics.reports.query({
      auth,
      ids: 'channel==MINE',
      startDate,
      endDate,
      metrics: 'views,comments,likes,dislikes,shares,subscribersGained',
      dimensions: 'day',
    });

    return analytics.data;
  }
}
