import {Injectable} from "@nestjs/common";
import {BaseIntegrationService} from "../base-integration.service";
import {
  Integration,
  TestResult,
  SyncResult,
  OAuthCredentials,
  IntegrationType,
  AuthType,
  SocialPlatform, IntegrationEvent, UserType
} from "@nlc-ai/api-types";
import {google} from "googleapis";
import {IntegrationError} from "../../errors/integration.error";


@Injectable()
export class YoutubeService extends BaseIntegrationService {
  platformName = SocialPlatform.YOUTUBE;
  integrationType = IntegrationType.SOCIAL;
  authType = AuthType.OAUTH;

  private youtube = google.youtube('v3');
  private youtubeAnalytics = google.youtubeAnalytics('v2');

  async connect(userID: string, userType: UserType, credentials: OAuthCredentials): Promise<Integration> {
    await this.testCredentials(credentials.accessToken);

    const channelData = await this.getChannelInfo(credentials.accessToken);

    return this.saveIntegration({
      userID,
      userType,
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

  async getAuthUrl(userID: string, userType: UserType): Promise<{ authUrl: string; state: string }> {
    const state = this.stateTokenService.generateState(userID, userType, this.platformName);

    const params = new URLSearchParams({
      client_id: this.configService.get('integrations.oauth.google.clientID', ''),
      scope: 'https://www.googleapis.com/auth/youtube.readonly',
      redirect_uri: `${this.configService.get('integrations.baseUrl', '')}/integrations/auth/youtube/callback`,
      response_type: 'code',
      state,
    });

    return {
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      state,
    };
  }

  async handleCallback(userID: string, userType: UserType, code: string, state: string): Promise<Integration> {
    const tokenData = await this.exchangeCodeForToken(code);
    return this.connect(userID, userType, tokenData);
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

      // Get basic channel stats and analytics
      const [channelStats, analytics] = await Promise.all([
        this.getChannelStats(validToken),
        this.getAnalytics(validToken),
      ]);

      // Update integration with basic sync data
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

      // Emit event for content service to handle content sync
      await this.outbox.saveAndPublishEvent({
        eventType: 'integration.sync.requested',
        // @ts-ignore
        payload: {
          integration: {
            ...integration,
            accessToken: validToken // Include decrypted token for content service
          },
          platform: this.platformName,
          syncType: 'content',
          requestedAt: new Date().toISOString(),
        },
        schemaVersion: 1,
      }, 'integration.sync.requested');

      // Emit basic integration sync completed event
      await this.outbox.saveAndPublishEvent<IntegrationEvent>(
        {
          eventType: 'integration.sync.completed',
          payload: {
            integrationID: integration.id,
            userID: integration.userID,
            userType: integration.userType,
            platformName: integration.platformName,
            syncData: { channelStats, analytics },
            syncedAt: new Date().toISOString(),
          },
          schemaVersion: 1,
        },
        'integration.sync.completed'
      );

      return {
        success: true,
        message: 'YouTube integration synced successfully. Content sync is processing in background.',
        data: { channelStats, analytics },
      };

    } catch (error: any) {
      await this.prisma.integration.update({
        where: { id: integration.id },
        data: { syncError: error.message },
      });

      await this.outbox.saveAndPublishEvent<IntegrationEvent>(
        {
          eventType: 'integration.sync.failed',
          payload: {
            integrationID: integration.id,
            userID: integration.userID,
            userType: integration.userType,
            platformName: integration.platformName,
            error: error.message,
            failedAt: new Date().toISOString(),
          },
          schemaVersion: 1,
        },
        'integration.sync.failed'
      );

      return {
        success: false,
        message: `Failed to sync YouTube data: ${error.message}`,
      };
    }
  }

  // Override the refreshToken method for YouTube-specific logic
  override async refreshToken(integration: Integration): Promise<string> {
    const { refreshToken } = await this.getDecryptedTokens(integration);

    if (!refreshToken) {
      throw new Error('No refresh token available for YouTube integration');
    }

    const auth = new google.auth.OAuth2(
      this.configService.get('integrations.oauth.google.clientID'),
      this.configService.get('integrations.oauth.google.clientSecret')
    );

    auth.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await auth.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error('Failed to refresh YouTube access token');
    }

    // Update the integration with new token
    await this.updateIntegrationTokens(
      integration.id,
      credentials.access_token,
      refreshToken,
      new Date(Date.now() + 3600000) // 1 hour from now
    );

    return credentials.access_token;
  }

  /*private async ensureValidToken(integration: Integration, currentToken: string): Promise<string> {
    // Use our own token management instead of the service to avoid circular dependency
    if (this.isTokenExpired(integration)) {
      return this.refreshToken(integration);
    }
    return currentToken;
  }*/

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.configService.get('integrations.oauth.google.clientID', ''),
      client_secret: this.configService.get('integrations.oauth.google.clientSecret', ''),
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${this.configService.get('integrations.baseUrl', '')}/integrations/auth/youtube/callback`,
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
