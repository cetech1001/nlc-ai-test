import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {ConfigService} from '@nestjs/config';
import {Integration} from '@nlc-ai/types';

interface SocialPlatformConfig {
  clientID: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  profileUrl: string;
}

@Injectable()
export class IntegrationsService {
  private readonly platformConfigs: Record<string, SocialPlatformConfig>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.platformConfigs = {
      facebook: {
        clientID: this.configService.get('FACEBOOK_CLIENT_ID', ''),
        clientSecret: this.configService.get('FACEBOOK_CLIENT_SECRET', ''),
        redirectUri: this.configService.get('FACEBOOK_REDIRECT_URI', ''),
        scope: ['pages_read_engagement', 'pages_show_list', 'instagram_basic'],
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        profileUrl: 'https://graph.facebook.com/v18.0/me',
      },
      instagram: {
        clientID: this.configService.get('INSTAGRAM_CLIENT_ID', ''),
        clientSecret: this.configService.get('INSTAGRAM_CLIENT_SECRET', ''),
        redirectUri: this.configService.get('INSTAGRAM_REDIRECT_URI', ''),
        scope: ['instagram_basic', 'instagram_content_publish'],
        authUrl: 'https://api.instagram.com/oauth/authorize',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        profileUrl: 'https://graph.instagram.com/me',
      },
      youtube: {
        clientID: this.configService.get('GOOGLE_CLIENT_ID', ''),
        clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET', ''),
        redirectUri: this.configService.get('YOUTUBE_REDIRECT_URI', ''),
        scope: ['https://www.googleapis.com/auth/youtube.readonly'],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        profileUrl: 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      },
      twitter: {
        clientID: this.configService.get('TWITTER_CLIENT_ID', ''),
        clientSecret: this.configService.get('TWITTER_CLIENT_SECRET', ''),
        redirectUri: this.configService.get('TWITTER_REDIRECT_URI', ''),
        scope: ['tweet.read', 'users.read'],
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        profileUrl: 'https://api.twitter.com/2/users/me',
      },
      linkedin: {
        clientID: this.configService.get('LINKEDIN_CLIENT_ID', ''),
        clientSecret: this.configService.get('LINKEDIN_CLIENT_SECRET', ''),
        redirectUri: this.configService.get('LINKEDIN_REDIRECT_URI', ''),
        scope: ['r_liteprofile', 'r_organization_social'],
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        profileUrl: 'https://api.linkedin.com/v2/me',
      },
      tiktok: {
        clientID: this.configService.get('TIKTOK_CLIENT_ID', ''),
        clientSecret: this.configService.get('TIKTOK_CLIENT_SECRET', ''),
        redirectUri: this.configService.get('TIKTOK_REDIRECT_URI', ''),
        scope: ['user.info.basic'],
        authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
        tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token',
        profileUrl: 'https://api.linkedin.com/v2/me',
      },
      calendly: {
        clientID: this.configService.get('CALENDLY_CLIENT_ID', ''),
        clientSecret: this.configService.get('CALENDLY_CLIENT_SECRET', ''),
        redirectUri: this.configService.get('CALENDLY_REDIRECT_URI', ''),
        scope: [],
        authUrl: 'https://auth.calendly.com/oauth/authorize',
        tokenUrl: 'https://auth.calendly.com/oauth/token',
        profileUrl: 'https://api.calendly.com/users/me',
      },
    };
  }

  async getIntegrations(coachID: string): Promise<Integration[]> {
    try {
      const integrations = await this.prisma.integration.findMany({
        where: {
          coachID,
          // integrationType: 'social',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return integrations.map(integration => ({
        ...integration,
        // Don't expose sensitive tokens in the response
        accessToken: integration.accessToken ? '***' : null,
        refreshToken: integration.refreshToken ? '***' : null,
      }));
    } catch (error: any) {
      throw new BadRequestException('Failed to retrieve social integrations');
    }
  }

  async getAuthUrl(coachID: string, platform: string): Promise<{ authUrl: string; state: string }> {
    const config = this.platformConfigs[platform];
    if (!config) {
      throw new BadRequestException(`Unsupported platform: ${platform}`);
    }

    // Generate a unique state parameter for CSRF protection
    const state = `${coachID}$${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const params = new URLSearchParams({
      client_id: config.clientID,
      client_key: config.clientID,
      redirect_uri: config.redirectUri,
      scope: config.scope.join(' '),
      response_type: 'code',
      state,
    });

    // Platform-specific parameters
    if (platform === 'twitter') {
      params.append('code_challenge', 'challenge');
      params.append('code_challenge_method', 'plain');
    }

    const authUrl = `${config.authUrl}?${params.toString()}`;

    return { authUrl, state };
  }

  async handleOAuthCallback(
    coachID: string,
    platform: string,
    code: string,
    state?: string,
  ): Promise<Integration> {
    const config = this.platformConfigs[platform];
    if (!config) {
      throw new BadRequestException(`Unsupported platform: ${platform}`);
    }

    // Verify state parameter for CSRF protection
    if (state && !state.startsWith(coachID)) {
      throw new BadRequestException('Invalid state parameter');
    }

    try {
      // Exchange code for access token
      const tokenResponse = await this.exchangeCodeForToken(platform, code, config);

      // Get profile data
      const profileData = await this.getProfileData(platform, tokenResponse?.access_token, config);

      // Save or update integration
      return this.saveIntegration(
        coachID,
        platform,
        tokenResponse,
        profileData,
      );
    } catch (error: any) {
      throw new BadRequestException(`Failed to connect ${platform}: ${error.message}`);
    }
  }

  async connectPlatform(
    coachID: string,
    platform: string,
    authData: {
      accessToken: string;
      refreshToken?: string;
      profileData?: any;
      tokenExpiresAt?: string;
    },
  ): Promise<Integration> {
    const config = this.platformConfigs[platform];
    if (!config) {
      throw new BadRequestException(`Unsupported platform: ${platform}`);
    }

    // Check if integration already exists
    const existingIntegration = await this.prisma.integration.findFirst({
      where: {
        coachID,
        platformName: platform,
        integrationType: 'social',
      },
    });

    if (existingIntegration) {
      throw new BadRequestException(`${platform} is already connected`);
    }

    try {
      // Verify the token by getting profile data
      let profileData = authData.profileData;
      if (!profileData) {
        profileData = await this.getProfileData(platform, authData.accessToken, config);
      }

      // Create integration
      const integration = await this.prisma.integration.create({
        data: {
          coachID,
          integrationType: 'social',
          platformName: platform,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          tokenExpiresAt: authData.tokenExpiresAt ? new Date(authData.tokenExpiresAt) : null,
          config: profileData,
          syncSettings: {
            autoSync: true,
            syncFrequency: 'daily',
            syncContent: true,
            syncAnalytics: true,
          },
          isActive: true,
          lastSyncAt: new Date(),
        },
      });

      return {
        ...integration,
        accessToken: '***', // Don't expose the token
        refreshToken: integration.refreshToken ? '***' : null,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to connect ${platform}: ${error.message}`);
    }
  }

  async updateIntegration(
    coachID: string,
    integrationID: string,
    updateData: { isActive?: boolean; syncSettings?: any },
  ): Promise<Integration> {
    await this.findIntegrationByIdAndCoach(integrationID, coachID);

    try {
      const updatedIntegration = await this.prisma.integration.update({
        where: { id: integrationID },
        data: {
          isActive: updateData.isActive,
          syncSettings: updateData.syncSettings,
          updatedAt: new Date(),
        },
      });

      return {
        ...updatedIntegration,
        accessToken: updatedIntegration.accessToken ? '***' : null,
        refreshToken: updatedIntegration.refreshToken ? '***' : null,
      };
    } catch (error: any) {
      throw new BadRequestException('Failed to update integration');
    }
  }

  async testIntegration(coachID: string, integrationID: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.findIntegrationByIdAndCoach(integrationID, coachID);
    const config = this.platformConfigs[integration.platformName];

    if (!config) {
      throw new BadRequestException(`Unsupported platform: ${integration.platformName}`);
    }

    try {
      // Test the connection by making a simple API call
      const profileData = await this.getProfileData(
        integration.platformName,
        integration.accessToken!,
        config,
      );

      // Update last sync time
      await this.prisma.integration.update({
        where: { id: integrationID },
        data: {
          lastSyncAt: new Date(),
          syncError: null,
        },
      });

      return {
        success: true,
        message: `Successfully connected to ${integration.platformName}. Profile: ${profileData.username || profileData.name}`,
      };
    } catch (error: any) {
      // Update sync error
      await this.prisma.integration.update({
        where: { id: integrationID },
        data: { syncError: error.message },
      });

      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
      };
    }
  }

  async disconnectIntegration(coachID: string, integrationID: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.findIntegrationByIdAndCoach(integrationID, coachID);

    try {
      await this.prisma.integration.delete({
        where: { id: integrationID },
      });

      return {
        success: true,
        message: `Successfully disconnected ${integration.platformName}`,
      };
    } catch (error: any) {
      throw new BadRequestException('Failed to disconnect integration');
    }
  }

  async syncPlatformData(coachID: string, integrationID: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.findIntegrationByIdAndCoach(integrationID, coachID);
    const config = this.platformConfigs[integration.platformName];

    if (!config) {
      throw new BadRequestException(`Unsupported platform: ${integration.platformName}`);
    }

    try {
      // This is where you'd implement platform-specific data syncing
      // For now, we'll just update the profile data
      const profileData = await this.getProfileData(
        integration.platformName,
        integration.accessToken!,
        config,
      );

      await this.prisma.integration.update({
        where: { id: integrationID },
        data: {
          config: profileData,
          lastSyncAt: new Date(),
          syncError: null,
        },
      });

      return {
        success: true,
        message: `Successfully synced data from ${integration.platformName}`,
      };
    } catch (error: any) {
      await this.prisma.integration.update({
        where: { id: integrationID },
        data: { syncError: error.message },
      });

      throw new BadRequestException(`Failed to sync data: ${error.message}`);
    }
  }

  private async findIntegrationByIdAndCoach(integrationID: string, coachID: string): Promise<Integration> {
    const integration = await this.prisma.integration.findFirst({
      where: {
        id: integrationID,
        coachID,
        // integrationType: 'social',
      },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return integration;
  }

  private async exchangeCodeForToken(platform: string, code: string, config: SocialPlatformConfig): Promise<any> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientID,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code,
    });

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return response.json();
  }

  private async getProfileData(platform: string, accessToken: string, config: SocialPlatformConfig) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    };

    let profileUrl = config.profileUrl;

    // Platform-specific profile URL modifications
    if (platform === 'facebook') {
      profileUrl += '?fields=id,name,email,picture';
    } else if (platform === 'instagram') {
      profileUrl += '?fields=id,username,media_count';
    } else if (platform === 'twitter') {
      profileUrl += '?user.fields=username,name,public_metrics,profile_image_url';
    } else if (platform === 'linkedin') {
      // LinkedIn has a different API structure
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(profileUrl, { headers });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Profile fetch failed: ${error}`);
    }

    const data = await response.json();

    // Normalize profile data across platforms
    return this.normalizeProfileData(platform, data);
  }

  private normalizeProfileData(platform: string, rawData: any) {
    switch (platform) {
      case 'facebook':
        return {
          id: rawData.id,
          username: rawData.name,
          name: rawData.name,
          email: rawData.email,
          profileUrl: `https://facebook.com/${rawData.id}`,
          profilePictureUrl: rawData.picture?.data?.url,
          followerCount: null, // Facebook doesn't provide this in basic profile
        };

      case 'instagram':
        return {
          id: rawData.id,
          username: rawData.username,
          name: rawData.username,
          profileUrl: `https://instagram.com/${rawData.username}`,
          mediaCount: rawData.media_count,
          followerCount: null, // Requires business account for follower count
        };

      case 'youtube':
        const channelData = rawData.items?.[0];
        return {
          id: channelData?.id,
          username: channelData?.snippet?.title,
          name: channelData?.snippet?.title,
          profileUrl: `https://youtube.com/channel/${channelData?.id}`,
          profilePictureUrl: channelData?.snippet?.thumbnails?.default?.url,
          subscriberCount: channelData?.statistics?.subscriberCount,
        };

      case 'twitter':
        return {
          id: rawData.data?.id,
          username: rawData.data?.username,
          name: rawData.data?.name,
          profileUrl: `https://twitter.com/${rawData.data?.username}`,
          profilePictureUrl: rawData.data?.profile_image_url,
          followerCount: rawData.data?.public_metrics?.followers_count,
        };

      case 'linkedin':
        return {
          id: rawData.id,
          username: `${rawData.localizedFirstName} ${rawData.localizedLastName}`,
          name: `${rawData.localizedFirstName} ${rawData.localizedLastName}`,
          profileUrl: `https://linkedin.com/in/${rawData.id}`,
          profilePictureUrl: rawData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
        };

      case 'calendly':
        return rawData.resource;

      default:
        return rawData;
    }
  }

  private getIntegrationType(platform: string) {
    return platform === 'calendly' ? 'app' : 'social';
  }

  private async saveIntegration(
    coachID: string,
    platform: string,
    tokenData: any,
    profileData: any,
  ): Promise<Integration> {
    const integrationType = this.getIntegrationType(platform);

    // Check if integration already exists
    const existingIntegration = await this.prisma.integration.findFirst({
      where: {
        coachID,
        platformName: platform,
        integrationType,
      },
    });

    const integrationData = {
      coachID,
      integrationType,
      platformName: platform,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : null,
      config: profileData,
      syncSettings: {
        autoSync: true,
        syncFrequency: 'daily',
        syncContent: true,
        syncAnalytics: true,
      },
      isActive: true,
      lastSyncAt: new Date(),
    };

    if (existingIntegration) {
      // Update existing integration
      const updatedIntegration = await this.prisma.integration.update({
        where: { id: existingIntegration.id },
        data: {
          ...integrationData,
          updatedAt: new Date(),
        },
      });

      return {
        ...updatedIntegration,
        accessToken: '***',
        refreshToken: updatedIntegration.refreshToken ? '***' : null,
      };
    } else {
      // Create new integration
      const newIntegration = await this.prisma.integration.create({
        data: integrationData,
      });

      return {
        ...newIntegration,
        accessToken: '***',
        refreshToken: newIntegration.refreshToken ? '***' : null,
      };
    }
  }
}
