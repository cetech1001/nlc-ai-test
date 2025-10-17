import {Injectable} from "@nestjs/common";
import {BaseIntegrationService} from "../base-integration.service";
import {
  AuthType,
  Integration,
  IntegrationType,
  OAuthCredentials,
  SocialPlatform,
  SyncResult,
  TestResult,
  UserType
} from "@nlc-ai/types";
import * as crypto from 'crypto';

@Injectable()
export class TiktokService extends BaseIntegrationService {
  platformName = SocialPlatform.TIKTOK;
  integrationType = IntegrationType.SOCIAL;
  authType = AuthType.OAUTH;

  // Store code verifiers temporarily (in production, use Redis or similar)
  private codeVerifiers = new Map<string, string>();

  async connect(userID: string, userType: UserType, credentials: OAuthCredentials): Promise<Integration> {
    const profile = await this.getTiktokProfile(credentials.accessToken);

    return this.saveIntegration({
      userID,
      userType,
      integrationType: this.integrationType,
      platformName: this.platformName,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      tokenExpiresAt: credentials.tokenExpiresAt,
      config: {
        openID: profile.open_id,
        unionID: profile.union_id,
        username: profile.username,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        followerCount: profile.follower_count,
        followingCount: profile.following_count,
        likesCount: profile.likes_count,
        videoCount: profile.video_count,
      },
      syncSettings: {
        autoSync: true,
        syncFrequency: 'daily',
        syncVideos: true,
        syncAnalytics: true,
      },
      isActive: true,
    });
  }

  async test(integration: Integration): Promise<TestResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      await this.getTiktokProfile(accessToken);
      return { success: true, message: 'TikTok connection working' };
    } catch (error: any) {
      return { success: false, message: `TikTok test failed: ${error.message}` };
    }
  }

  async sync(integration: Integration): Promise<SyncResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const [profile, videos] = await Promise.all([
        this.getTiktokProfile(accessToken),
        this.fetchTiktokVideos(accessToken),
      ]);

      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          config: {
            ...integration.config,
            ...profile,
            videoCount: videos.length,
            lastSync: new Date().toISOString(),
          },
          lastSyncAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'TikTok synced successfully',
        data: { videoCount: videos.length, followerCount: profile.follower_count },
      };
    } catch (error: any) {
      return { success: false, message: `TikTok sync failed: ${error.message}` };
    }
  }

  async getAuthUrl(userID: string, userType: UserType): Promise<{ authUrl: string; state: string }> {
    const state = this.stateTokenService.generateState(userID, userType, this.platformName);

    // Generate PKCE code verifier and challenge
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    // Store code verifier for later use in callback
    this.codeVerifiers.set(state, codeVerifier);

    const params = new URLSearchParams({
      client_key: this.configService.get('integrations.oauth.tiktok.clientID', ''),
      scope: [
        'user.info.basic',
        'user.info.profile',
        'user.info.stats',
        'video.list',
        // 'video.insights'
      ].join(','),
      redirect_uri: `${this.configService.get('integrations.baseUrl')}/integrations/auth/tiktok/callback`,
      response_type: 'code',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return {
      authUrl: `https://www.tiktok.com/v2/auth/authorize/?${params}`,
      state,
    };
  }

  async handleCallback(userID: string, userType: UserType, code: string, state: string): Promise<Integration> {
    // Retrieve the code verifier for this state
    const codeVerifier = this.codeVerifiers.get(state);

    if (!codeVerifier) {
      throw new Error('Code verifier not found. The authorization session may have expired.');
    }

    try {
      const tokenData = await this.exchangeCodeForToken(code, codeVerifier);
      return await this.connect(userID, userType, tokenData);
    } finally {
      // Clean up the code verifier
      this.codeVerifiers.delete(state);
    }
  }

  private generateCodeVerifier(): string {
    // Generate a random 43-128 character string
    return crypto.randomBytes(32).toString('base64url');
  }

  private generateCodeChallenge(verifier: string): string {
    // Create SHA-256 hash of the verifier and encode as base64url
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
  }

  private async exchangeCodeForToken(code: string, codeVerifier: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_key: this.configService.get('integrations.oauth.tiktok.clientID', ''),
      client_secret: this.configService.get('integrations.oauth.tiktok.clientSecret', ''),
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${this.configService.get('integrations.baseUrl')}/integrations/auth/tiktok/callback`,
      code_verifier: codeVerifier,
    });

    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`TikTok token exchange failed: ${JSON.stringify(errorData)}`);
    }

    const tokenData: any = await response.json();

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
    };
  }

  private async getTiktokProfile(accessToken: string) {
    const fields = [
      'open_id', 'union_id', 'avatar_url', 'display_name',
      'username', 'follower_count', 'following_count', 'likes_count',
      'video_count'
    ];

    const response = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=${fields.join(',')}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`TikTok profile fetch failed: ${JSON.stringify(errorData)}`);
    }

    const data: any = await response.json();
    return data.data.user;
  }

  private async fetchTiktokVideos(accessToken: string) {
    const response = await fetch('https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,view_count,like_count,comment_count,share_count', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`TikTok videos fetch failed: ${JSON.stringify(errorData)}`);
    }

    const data: any = await response.json();
    return data.data?.videos || [];
  }
}
