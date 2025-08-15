import {Injectable} from "@nestjs/common";
import {BaseIntegrationService} from "../base-integration.service";
import {
  AuthType,
  Integration,
  IntegrationType,
  OAuthCredentials,
  SocialPlatform,
  SyncResult,
  TestResult
} from "@nlc-ai/api-types";

@Injectable()
export class TwitterService extends BaseIntegrationService {
  platformName = SocialPlatform.TWITTER;
  integrationType = IntegrationType.SOCIAL;
  authType = AuthType.OAUTH;

  async connect(coachID: string, credentials: OAuthCredentials): Promise<Integration> {
    const profile = await this.getTwitterProfile(credentials.accessToken);

    return this.saveIntegration({
      coachID,
      integrationType: this.integrationType,
      platformName: this.platformName,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      tokenExpiresAt: credentials.tokenExpiresAt,
      config: {
        id: profile.data.id,
        username: profile.data.username,
        name: profile.data.name,
        profileUrl: `https://twitter.com/${profile.data.username}`,
        profilePictureUrl: profile.data.profile_image_url,
        followerCount: profile.data.public_metrics?.followers_count,
        followingCount: profile.data.public_metrics?.following_count,
        tweetCount: profile.data.public_metrics?.tweet_count,
        verified: profile.data.verified,
      },
      syncSettings: {
        autoSync: true,
        syncFrequency: 'daily',
        syncTweets: true,
        syncMentions: true,
      },
      isActive: true,
    });
  }

  async test(integration: Integration): Promise<TestResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      await this.getTwitterProfile(accessToken);
      return { success: true, message: 'Twitter/X connection working' };
    } catch (error: any) {
      return { success: false, message: `Twitter/X test failed: ${error.message}` };
    }
  }

  async sync(integration: Integration): Promise<SyncResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const [profile, tweets] = await Promise.all([
        this.getTwitterProfile(accessToken),
        this.fetchRecentTweets(accessToken),
      ]);

      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          config: {
            ...integration.config,
            ...profile.data,
            recentTweets: tweets,
            lastSync: new Date().toISOString(),
          },
          lastSyncAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Twitter/X synced successfully',
        data: { tweetCount: tweets.length, followerCount: profile.data.public_metrics?.followers_count },
      };
    } catch (error: any) {
      return { success: false, message: `Twitter/X sync failed: ${error.message}` };
    }
  }

  async getAuthUrl(coachID: string): Promise<{ authUrl: string; state: string }> {
    const state = this.stateTokenService.generateState(coachID, this.platformName);

    const params = new URLSearchParams({
      client_id: this.configService.get('TWITTER_CLIENT_ID', ''),
      scope: ['tweet.read', 'users.read', 'offline.access'].join(' '),
      redirect_uri: `${this.configService.get('API_BASE_URL')}/integrations/auth/twitter/callback`,
      response_type: 'code',
      code_challenge: 'challenge', // In production, generate a proper PKCE challenge
      code_challenge_method: 'plain',
      state,
    });

    return {
      authUrl: `https://twitter.com/i/oauth2/authorize?${params}`,
      state,
    };
  }

  async handleCallback(coachID: string, code: string, state: string): Promise<Integration> {
    const tokenData = await this.exchangeCodeForToken(code);
    return this.connect(coachID, tokenData);
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.configService.get('TWITTER_CLIENT_ID', ''),
      client_secret: this.configService.get('TWITTER_CLIENT_SECRET', ''),
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${this.configService.get('API_BASE_URL')}/integrations/auth/twitter/callback`,
      code_verifier: 'challenge', // In production, use the same verifier from the challenge
    });

    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
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

  private async getTwitterProfile(accessToken: string): Promise<any> {
    const response = await fetch('https://api.twitter.com/2/users/me?user.fields=username,name,public_metrics,profile_image_url,verified', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    return response.json();
  }

  private async fetchRecentTweets(accessToken: string) {
    const response = await fetch('https://api.twitter.com/2/users/me/tweets?max_results=10&tweet.fields=created_at,public_metrics', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data: any = await response.json();
    return data.data || [];
  }
}
