import {Integration, OAuthCredentials, SyncResult, TestResult} from "@nlc-ai/types";
import {Injectable} from "@nestjs/common";
import {BaseIntegrationService} from "./base-integration.service";

@Injectable()
export class InstagramService extends BaseIntegrationService {
  platformName = 'instagram';
  integrationType = 'social' as const;
  authType = 'oauth' as const;

  async connect(coachID: string, credentials: OAuthCredentials): Promise<Integration> {
    const profile = await this.getInstagramProfile(credentials.accessToken);

    return this.saveIntegration({
      coachID,
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

  async getAuthUrl(coachID: string): Promise<{ authUrl: string; state: string }> {
    const state = this.stateTokenService.generateState(coachID, this.platformName);

    const params = new URLSearchParams({
      client_id: this.configService.get('META_CLIENT_ID', ''),
      scope: ['instagram_basic', 'instagram_content_publish'].join(','),
      redirect_uri: `${this.configService.get('API_BASE_URL')}/integrations/auth/instagram/callback`,
      response_type: 'code',
      state,
    });

    return {
      authUrl: `https://api.instagram.com/oauth/authorize?${params}`,
      state,
    };
  }

  async handleCallback(coachID: string, code: string, state: string): Promise<Integration> {
    const tokenData = await this.exchangeCodeForToken(code);
    return this.connect(coachID, tokenData);
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.configService.get('META_CLIENT_ID', ''),
      client_secret: this.configService.get('META_CLIENT_SECRET', ''),
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${this.configService.get('API_BASE_URL')}/integrations/auth/instagram/callback`,
    });

    const response = await fetch('https://api.instagram.com/oauth/access_token', {
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
