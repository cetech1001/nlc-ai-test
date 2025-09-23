import {
  AuthType,
  Integration,
  IntegrationType,
  OAuthCredentials,
  SocialPlatform,
  SyncResult,
  TestResult, UserType
} from "@nlc-ai/api-types";
import {Injectable} from "@nestjs/common";
import {BaseIntegrationService} from "../base-integration.service";

@Injectable()
export class InstagramService extends BaseIntegrationService {
  platformName = SocialPlatform.INSTAGRAM;
  integrationType = IntegrationType.SOCIAL;
  authType = AuthType.OAUTH;

  async connect(userID: string, userType: UserType, credentials: OAuthCredentials): Promise<Integration> {
    const profile = await this.getInstagramProfile(credentials.accessToken);

    return this.saveIntegration({
      userID,
      userType,
      integrationType: this.integrationType,
      platformName: this.platformName,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      tokenExpiresAt: credentials.tokenExpiresAt,
      config: {
        id: profile.id,
        username: profile.username,
        mediaCount: profile.media_count,
        profileUrl: `https://instagram.com/${profile.username}`,
      },
      syncSettings: {
        autoSync: true,
        syncFrequency: 'daily',
        syncPosts: true,
        syncStories: true,
      },
      isActive: true,
    });
  }

  async test(integration: Integration): Promise<TestResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      await this.getInstagramProfile(accessToken);
      return { success: true, message: 'Instagram connection working' };
    } catch (error: any) {
      return { success: false, message: `Instagram test failed: ${error.message}` };
    }
  }

  async sync(integration: Integration): Promise<SyncResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const [profile, media] = await Promise.all([
        this.getInstagramProfile(accessToken),
        this.fetchInstagramMedia(accessToken),
      ]);

      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          config: {
            ...integration.config,
            ...profile,
            recentMedia: media,
            lastSync: new Date().toISOString(),
          },
          lastSyncAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Instagram synced successfully',
        data: { mediaCount: media.length },
      };
    } catch (error: any) {
      return { success: false, message: `Instagram sync failed: ${error.message}` };
    }
  }

  async getAuthUrl(userID: string, userType: UserType): Promise<{ authUrl: string; state: string }> {
    const state = this.stateTokenService.generateState(userID, userType, this.platformName);

    const params = new URLSearchParams({
      client_id: this.configService.get('integrations.oauth.meta.clientID', ''),
      scope: 'instagram_basic,pages_show_list,pages_read_engagement',
      redirect_uri: `${this.configService.get('integrations.baseUrl')}/integrations/auth/instagram/callback`,
      response_type: 'code',
      config_id: this.configService.get('integrations.oauth.instagram.clientID', ''),
      state,
    });

    return {
      authUrl: `https://www.facebook.com/dialog/oauth?${params}`,
      state,
    };
  }

  async handleCallback(userID: string, userType: UserType, code: string, state: string): Promise<Integration> {
    const tokenData = await this.exchangeCodeForToken(code);
    return this.connect(userID, userType, tokenData);
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.configService.get('integrations.oauth.meta.clientID', ''),
      client_secret: this.configService.get('integrations.oauth.meta.clientSecret', ''),
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${this.configService.get('integrations.baseUrl')}/integrations/auth/instagram/callback`,
    });

    const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokenData: any = await response.json();

    return {
      accessToken: tokenData.access_token,
      refreshToken: undefined, // Instagram Basic Display API doesn't provide refresh tokens
      tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour default
    };
  }

  private async getInstagramProfile(accessToken: string): Promise<any> {
    const response = await fetch(`https://graph.instagram.com/me?fields=id,username,media_count&access_token=${accessToken}`);
    return response.json();
  }

  private async fetchInstagramMedia(accessToken: string) {
    const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&access_token=${accessToken}`);
    const data: any = await response.json();
    return data.data || [];
  }
}
