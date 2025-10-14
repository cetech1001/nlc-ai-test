import {
  AuthType,
  Integration,
  IntegrationType,
  OAuthCredentials,
  SocialPlatform,
  SyncResult,
  TestResult, UserType
} from "@nlc-ai/types";
import {Injectable} from "@nestjs/common";
import {BaseIntegrationService} from "../base-integration.service";

@Injectable()
export class InstagramService extends BaseIntegrationService {
  platformName = SocialPlatform.INSTAGRAM;
  integrationType = IntegrationType.SOCIAL;
  authType = AuthType.OAUTH;

  async connect(userID: string, userType: UserType, credentials: OAuthCredentials): Promise<Integration> {
    const profile = await this.getInstagramProfile(credentials.accessToken);
    console.log("Profile: ", profile);

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
      client_id: this.configService.get('integrations.oauth.instagram.appID', ''),
      redirect_uri: `${this.configService.get('integrations.baseUrl')}/integrations/auth/instagram/callback`,
      response_type: 'code',
      scope: [
        'instagram_business_basic',
        'pages_show_list',
      ].join(','),
      state,
      auth_type: 'rerequest',
    });

    return {
      authUrl: `https://www.facebook.com/v20.0/dialog/oauth?${params}`,
      state,
    };
  }

  async handleCallback(userID: string, userType: UserType, code: string, state: string): Promise<Integration> {
    const tokenData = await this.exchangeCodeForToken(code);
    console.log("Token data: ", tokenData);
    return this.connect(userID, userType, tokenData);
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const clientId = this.configService.get('integrations.oauth.instagram.appID', '')
    const clientSecret = this.configService.get('integrations.oauth.instagram.appSecret', '')
    const redirectUri = `${this.configService.get('integrations.baseUrl')}/integrations/auth/instagram/callback`;

    const tokenRes = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?` +
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        }).toString(),
      { method: 'GET' }
    );
    const tokenJson: any = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new Error(`Token exchange failed: ${tokenJson.error?.message || 'unknown error'}`);
    }

    let accessToken = tokenJson.access_token as string;
    let expiresInSec = tokenJson.expires_in as number | undefined;

    try {
      const longRes = await fetch(
        `https://graph.facebook.com/v20.0/oauth/access_token?` +
          new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: clientId,
            client_secret: clientSecret,
            fb_exchange_token: accessToken,
          }).toString(),
        { method: 'GET' }
      );
      const longJson: any = await longRes.json();
      if (longRes.ok && longJson.access_token) {
        accessToken = longJson.access_token;
        expiresInSec = longJson.expires_in;
      }
    } catch {}

    return {
      accessToken,
      refreshToken: undefined,
      tokenExpiresAt: expiresInSec ? new Date(Date.now() + expiresInSec * 1000) : undefined,
    };
  }

  private async getInstagramProfile(accessToken: string): Promise<any> {
    const ig = await this.getIgAccount(accessToken);
    if (!ig) throw new Error('No linked Instagram Business/Creator account found');

    const profileRes = await fetch(
      `https://graph.facebook.com/v20.0/${ig.id}?fields=id,username,media_count&access_token=${encodeURIComponent(accessToken)}`
    );
    if (!profileRes.ok) {
      const err = await profileRes.text();
      throw new Error(`Failed to fetch IG profile: ${err}`);
    }
    const profile: any = await profileRes.json();
    return { id: profile.id, username: profile.username, media_count: profile.media_count };
  }

  private async fetchInstagramMedia(accessToken: string) {
    const ig = await this.getIgAccount(accessToken);
    if (!ig) return [];

    const res = await fetch(
      `https://graph.facebook.com/v20.0/${ig.id}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&access_token=${encodeURIComponent(accessToken)}`
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch IG media: ${err}`);
    }
    const data: any = await res.json();
    return data.data || [];
  }

  private async getIgAccount(accessToken: string): Promise<{ id: string; username?: string } | null> {
    const pagesRes = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?fields=instagram_business_account{id,username}&access_token=${encodeURIComponent(accessToken)}`
    );
    if (!pagesRes.ok) {
      const err = await pagesRes.text();
      throw new Error(`Failed to list pages: ${err}`);
    }
    const pages: any = await pagesRes.json();
    const page = (pages.data || []).find((p: any) => p.instagram_business_account);
    if (!page) return null;
    return { id: page.instagram_business_account.id, username: page.instagram_business_account.username };
  }
}
