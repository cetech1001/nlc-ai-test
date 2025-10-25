import {Injectable} from "@nestjs/common";
import {BaseIntegrationService} from "../base-integration.service";
import {
  AuthType,
  Integration,
  IntegrationType,
  OAuthCredentials,
  SocialPlatform,
  SyncResult,
  TestResult, UserType
} from "@nlc-ai/types";

@Injectable()
export class FacebookService extends BaseIntegrationService {
  platformName = SocialPlatform.FACEBOOK;
  integrationType = IntegrationType.SOCIAL;
  authType = AuthType.OAUTH;

  async connect(userID: string, userType: UserType, credentials: OAuthCredentials): Promise<Integration> {
    const profile = await this.getFacebookProfile(credentials.accessToken);

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
        name: profile.name,
        email: profile.email,
        profilePictureUrl: profile.picture?.data?.url,
        profileUrl: `https://facebook.com/${profile.id}`,
      },
      syncSettings: {
        autoSync: true,
        syncFrequency: 'daily',
        syncPages: true,
        syncPosts: true,
      },
      isActive: true,
    });
  }

  async test(integration: Integration): Promise<TestResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      await this.getFacebookProfile(accessToken);
      return { success: true, message: 'Facebook connection working' };
    } catch (error: any) {
      return { success: false, message: `Facebook test failed: ${error.message}` };
    }
  }

  async sync(integration: Integration): Promise<SyncResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const [profile, pages] = await Promise.all([
        this.getFacebookProfile(accessToken),
        this.fetchFacebookPages(accessToken),
      ]);

      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          config: {
            ...integration.config,
            ...profile,
            pages: pages,
            lastSync: new Date().toISOString(),
          },
          lastSyncAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Facebook synced successfully',
        data: { pageCount: pages.length },
      };
    } catch (error: any) {
      return { success: false, message: `Facebook sync failed: ${error.message}` };
    }
  }

  async getAuthUrl(userID: string, userType: UserType): Promise<{ authUrl: string; state: string }> {
    const state = this.stateToken.generateState(userID, userType, this.platformName);

    const params = new URLSearchParams({
      client_id: this.config.get('integrations.oauth.meta.clientID', ''),
      scope: ['public_profile', 'user_likes', 'user_link', 'user_posts', 'user_videos', 'email'].join(','),
      redirect_uri: `${this.config.get('integrations.baseUrl')}/integrations/auth/facebook/callback`,
      response_type: 'code',
      state,
      auth_type: 'rerequest',
    });

    return {
      authUrl: `https://www.facebook.com/v18.0/dialog/oauth?${params}`,
      state,
    };
  }

  async handleCallback(userID: string, userType: UserType, code: string, state: string): Promise<Integration> {
    const tokenData = await this.exchangeCodeForToken(code);
    return this.connect(userID, userType, tokenData);
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.config.get('integrations.oauth.meta.clientID', ''),
      client_secret: this.config.get('integrations.oauth.meta.clientSecret', ''),
      code,
      redirect_uri: `${this.config.get('integrations.baseUrl')}/integrations/auth/facebook/callback`,
    });

    const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${params}`);
    const tokenData: any = await response.json();

    return {
      accessToken: tokenData.access_token,
      refreshToken: undefined,
      tokenExpiresAt: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000),
    };
  }

  private async getFacebookProfile(accessToken: string): Promise<any> {
    const response = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`);
    return response.json();
  }

  private async fetchFacebookPages(accessToken: string) {
    const response = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
    const data: any = await response.json();
    return data.data || [];
  }
}
