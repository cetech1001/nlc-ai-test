import {BadRequestException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {ConfigService} from '@nestjs/config';
import {Integration, PlatformConnectionRequest} from '@nlc-ai/types';

interface SocialPlatformConfig {
  clientID: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  profileUrl: string;
}

interface CoursePlatformConfig {
  name: string;
  authType: 'api_key' | 'oauth' | 'webhook';
  baseUrl: string;
  authHeaders?: Record<string, string>;
  requiredFields: string[];
  endpoints: {
    courses: string;
    students: string;
    enrollments: string;
    profile?: string;
  };
}

@Injectable()
export class IntegrationsService {
  private readonly platformConfigs: Record<string, SocialPlatformConfig>;
  private readonly coursePlatformConfigs: Record<string, CoursePlatformConfig>;
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.platformConfigs = {
      facebook: {
        clientID: this.configService.get('META_CLIENT_ID', ''),
        clientSecret: this.configService.get('META_CLIENT_SECRET', ''),
        redirectUri: this.configService.get('FACEBOOK_REDIRECT_URI', ''),
        scope: ['pages_read_engagement', 'pages_show_list', 'instagram_basic'],
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        profileUrl: 'https://graph.facebook.com/v18.0/me',
      },
      instagram: {
        clientID: this.configService.get('META_CLIENT_ID', ''),
        clientSecret: this.configService.get('META_CLIENT_SECRET', ''),
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
        scope: ['r_liteprofile'],
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        profileUrl: 'https://api.linkedin.com/v2/me',
      },
      tiktok: {
        clientID: this.configService.get('TIKTOK_CLIENT_ID', ''),
        clientSecret: this.configService.get('TIKTOK_CLIENT_SECRET', ''),
        redirectUri: this.configService.get('TIKTOK_REDIRECT_URI', ''),
        scope: ['user.info.basic', 'user.info.profile', 'user.info.stats'],
        authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
        tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
        profileUrl: 'https://open.tiktokapis.com/v2/user/info/',
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

    this.coursePlatformConfigs = {
      thinkific: {
        name: 'Thinkific',
        authType: 'api_key',
        baseUrl: 'https://api.thinkific.com/api/public/v1',
        requiredFields: ['subdomain', 'apiKey'],
        endpoints: {
          courses: '/courses',
          students: '/users',
          enrollments: '/enrollments',
          profile: '/users/me',
        },
      },
      teachable: {
        name: 'Teachable',
        authType: 'api_key',
        baseUrl: 'https://developers.teachable.com/v1',
        requiredFields: ['apiKey'],
        endpoints: {
          courses: '/courses',
          students: '/users',
          enrollments: '/enrollments',
          profile: '/users/me',
        },
      },
      kajabi: {
        name: 'Kajabi',
        authType: 'oauth', // Note: Currently in private beta
        baseUrl: 'https://api.kajabi.com/v1',
        requiredFields: ['clientID', 'clientSecret', 'apiKey'], // Hybrid approach
        endpoints: {
          courses: '/courses',
          students: '/contacts',
          enrollments: '/purchases',
          profile: '/sites',
        },
      },
      skool: {
        name: 'Skool',
        authType: 'webhook', // Limited to Zapier webhooks only
        baseUrl: 'https://www.skool.com',
        requiredFields: ['groupUrl', 'zapierApiKey'],
        endpoints: {
          courses: '/classroom', // Limited access
          students: '/members', // Limited access
          enrollments: '/invites', // Webhook only
        },
      },
    };
  }

  async connectCoursePlatform(
    coachID: string,
    platform: string,
    credentials: Record<string, string>,
  ): Promise<Integration> {
    const config = this.coursePlatformConfigs[platform];
    if (!config) {
      throw new BadRequestException(`Unsupported course platform: ${platform}`);
    }

    // Validate required fields
    const missingFields = config.requiredFields.filter(field => !credentials[field]);
    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check if integration already exists
    const existingIntegration = await this.prisma.integration.findFirst({
      where: {
        coachID,
        platformName: platform,
        integrationType: 'course',
      },
    });

    if (existingIntegration) {
      throw new BadRequestException(`${config.name} is already connected`);
    }

    try {
      // Test the connection based on platform type
      let profileData: any = {};
      let accessToken = '';

      switch (config.authType) {
        case 'api_key':
          const testResult = await this.testCoursePlatformConnection(platform, credentials);
          profileData = testResult.data;
          accessToken = credentials.apiKey;
          break;

        case 'oauth':
          // For Kajabi OAuth (when available)
          if (platform === 'kajabi') {
            // For now, use API key approach since OAuth is in private beta
            accessToken = credentials.apiKey;
            profileData = await this.getKajabiProfile(credentials);
          }
          break;

        case 'webhook':
          // For Skool webhook integration
          profileData = {
            groupUrl: credentials.groupUrl,
            zapierConnected: true,
            name: this.extractGroupNameFromUrl(credentials.groupUrl),
          };
          accessToken = credentials.zapierApiKey;
          break;
      }

      // Create integration
      const integration = await this.prisma.integration.create({
        data: {
          coachID,
          integrationType: 'course',
          platformName: platform,
          accessToken,
          config: {
            ...credentials,
            ...profileData,
            authType: config.authType,
          },
          syncSettings: {
            autoSync: true,
            syncFrequency: 'daily',
            syncCourses: true,
            syncStudents: true,
            syncEnrollments: true,
          },
          isActive: true,
          lastSyncAt: new Date(),
        },
      });

      return {
        ...integration,
        accessToken: '***', // Don't expose the token
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to connect ${config.name}: ${error.message}`);
    }
  }

  // Test course platform connection
  async testCoursePlatformConnection(platform: string, credentials: Record<string, string>): Promise<{ success: boolean; data?: any }> {
    const config = this.coursePlatformConfigs[platform];
    if (!config) {
      throw new BadRequestException(`Unsupported course platform: ${platform}`);
    }

    try {
      switch (platform) {
        case 'thinkific':
          return await this.testThinkificConnection(credentials);
        case 'teachable':
          return await this.testTeachableConnection(credentials);
        case 'kajabi':
          return await this.testKajabiConnection(credentials);
        case 'skool':
          return await this.testSkoolConnection(credentials);
        default:
          throw new Error(`Test not implemented for ${platform}`);
      }
    } catch (error: any) {
      return { success: false };
    }
  }

  // Thinkific API integration
  private async testThinkificConnection(credentials: Record<string, string>) {
    const headers = {
      'X-Auth-API-Key': credentials.apiKey,
      'X-Auth-Subdomain': credentials.subdomain,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`https://api.thinkific.com/api/public/v1/courses?limit=1`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Thinkific API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    return {
      success: true,
      data: {
        subdomain: credentials.subdomain,
        coursesCount: data?.meta?.total_count || 0,
        name: `${credentials.subdomain}.thinkific.com`,
      },
    };
  }

  // Teachable API integration
  private async testTeachableConnection(credentials: Record<string, string>) {
    const headers = {
      'apiKey': credentials.apiKey,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`https://developers.teachable.com/v1/courses?limit=1`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Teachable API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    return {
      success: true,
      data: {
        schoolName: data?.courses?.[0]?.school?.name || 'Unknown School',
        coursesCount: data?.courses?.length || 0,
        name: data?.courses?.[0]?.school?.name || 'Teachable School',
      },
    };
  }

  // Kajabi API integration (limited due to private beta)
  private async testKajabiConnection(credentials: Record<string, string>) {
    // Since Kajabi API is in private beta, we'll do a basic validation
    // In a real implementation, you'd use their OAuth flow when available

    if (!credentials.apiKey) {
      throw new Error('API key is required for Kajabi');
    }

    // For now, just validate the format and return basic info
    return {
      success: true,
      data: {
        name: 'Kajabi Site',
        note: 'Kajabi API is in private beta - limited functionality',
        hasAccess: !!credentials.apiKey,
      },
    };
  }

  private async getKajabiProfile(credentials: Record<string, string>) {
    // Placeholder for when Kajabi OAuth becomes available
    return {
      name: 'Kajabi Site',
      apiKeyProvided: true,
      betaAccess: true,
    };
  }

  // Skool webhook integration
  private async testSkoolConnection(credentials: Record<string, string>) {
    // Validate URL format
    if (!credentials.groupUrl.includes('skool.com/')) {
      throw new Error('Invalid Skool group URL');
    }

    if (!credentials.zapierApiKey) {
      throw new Error('Zapier API key is required for Skool integration');
    }

    return {
      success: true,
      data: {
        groupName: this.extractGroupNameFromUrl(credentials.groupUrl),
        groupUrl: credentials.groupUrl,
        integrationType: 'webhook',
        note: 'Skool integration uses Zapier webhooks',
      },
    };
  }

  private extractGroupNameFromUrl(url: string): string {
    const match = url.match(/skool\.com\/([^\/]+)/);
    return match ? match[1].replace(/-/g, ' ') : 'Unknown Group';
  }

  // Sync course platform data
  async syncCoursePlatformData(coachID: string, integrationID: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.findIntegrationByIDAndCoach(integrationID, coachID);
    const config = this.coursePlatformConfigs[integration.platformName];

    if (!config) {
      throw new BadRequestException(`Unsupported course platform: ${integration.platformName}`);
    }

    try {
      let syncData: any = {};

      switch (integration.platformName) {
        case 'thinkific':
          syncData = await this.syncThinkificData(integration);
          break;
        case 'teachable':
          syncData = await this.syncTeachableData(integration);
          break;
        case 'kajabi':
          syncData = await this.syncKajabiData(integration);
          break;
        case 'skool':
          syncData = await this.syncSkoolData(integration);
          break;
      }

      await this.prisma.integration.update({
        where: { id: integrationID },
        data: {
          config: { ...integration.config, ...syncData },
          lastSyncAt: new Date(),
          syncError: null,
        },
      });

      return {
        success: true,
        message: `Successfully synced data from ${config.name}`,
      };
    } catch (error: any) {
      await this.prisma.integration.update({
        where: { id: integrationID },
        data: { syncError: error.message },
      });

      throw new BadRequestException(`Failed to sync data: ${error.message}`);
    }
  }

  private async syncThinkificData(integration: Integration) {
    const headers = {
      'X-Auth-API-Key': integration.config.apiKey,
      'X-Auth-Subdomain': integration.config.subdomain,
      'Content-Type': 'application/json',
    };

    // Fetch courses
    const coursesResponse = await fetch(`https://api.thinkific.com/api/public/v1/courses`, { headers });
    const coursesData: any = await coursesResponse.json();

    // Fetch users (students)
    const usersResponse = await fetch(`https://api.thinkific.com/api/public/v1/users?limit=50`, { headers });
    const usersData: any = await usersResponse.json();

    return {
      courses: coursesData?.items || [],
      students: usersData?.items || [],
      lastSync: new Date().toISOString(),
      stats: {
        totalCourses: coursesData?.meta?.total_count || 0,
        totalStudents: usersData?.meta?.total_count || 0,
      },
    };
  }

  private async syncTeachableData(integration: Integration) {
    const headers = {
      'apiKey': integration.config.apiKey,
      'Content-Type': 'application/json',
    };

    // Fetch courses
    const coursesResponse = await fetch(`https://developers.teachable.com/v1/courses`, { headers });
    const coursesData: any = await coursesResponse.json();

    // Fetch users
    const usersResponse = await fetch(`https://developers.teachable.com/v1/users?limit=50`, { headers });
    const usersData: any = await usersResponse.json();

    return {
      courses: coursesData?.courses || [],
      students: usersData?.users || [],
      lastSync: new Date().toISOString(),
      stats: {
        totalCourses: coursesData?.courses?.length || 0,
        totalStudents: usersData?.users?.length || 0,
      },
    };
  }

  private async syncKajabiData(integration: Integration) {
    // Limited sync for Kajabi due to private beta status
    return {
      note: 'Kajabi sync limited due to private beta API',
      lastSync: new Date().toISOString(),
      betaStatus: true,
    };
  }

  private async syncSkoolData(integration: Integration) {
    // Skool doesn't have a full API, so this would be webhook-based
    return {
      groupUrl: integration.config.groupUrl,
      webhookStatus: 'active',
      lastSync: new Date().toISOString(),
      note: 'Skool uses webhook integration via Zapier',
    };
  }

  private getIntegrationType(platform: string) {
    if (Object.keys(this.coursePlatformConfigs).includes(platform)) {
      return 'course';
    }
    return platform === 'calendly' ? 'app' : 'social';
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
      throw new BadRequestException('Failed to retrieve integrations');
    }
  }

  async getAuthUrl(coachID: string, platform: string): Promise<{ authUrl: string; state: string }> {
    const config = this.platformConfigs[platform];
    if (!config) {
      throw new BadRequestException(`Unsupported platform: ${platform}`);
    }

    // Generate a unique state parameter for CSRF protection
    const state = `${coachID}$${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let param = {};

    if (platform === 'tiktok') {
      param = {
        ...param,
        client_key: config.clientID,
      };
    }

    if (platform === 'linkedin') {
      param = {
        ...param,
        scope: config.scope.join(' '),
      }
    }

    const params = new URLSearchParams({
      client_id: config.clientID,
      scope: config.scope.join(','),
      redirect_uri: config.redirectUri,
      response_type: 'code',
      state,
      ...param,
    });

    // Platform-specific parameters
    if (platform === 'twitter') {
      params.append('code_challenge', 'challenge');
      params.append('code_challenge_method', 'plain');
    }

    const authUrl = `${config.authUrl}?${params.toString()}`;

    this.logger.log(`Auth URL: ${authUrl }`);

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

    this.logger.log(`Platform: ${platform}`);
    this.logger.log(`Code: ${code}`);

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
    authData: PlatformConnectionRequest,
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
        profileData = await this.getProfileData(platform, authData.accessToken as string, config);
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
    await this.findIntegrationByIDAndCoach(integrationID, coachID);

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
    const integration = await this.findIntegrationByIDAndCoach(integrationID, coachID);
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
    const integration = await this.findIntegrationByIDAndCoach(integrationID, coachID);

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
    const integration = await this.findIntegrationByIDAndCoach(integrationID, coachID);
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

  async findIntegrationByIDAndCoach(integrationID: string, coachID: string): Promise<Integration> {
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
    let param = {};

    if (platform === 'tiktok') {
      param = {
        ...param,
        client_key: config.clientID
      };
    }

    const params = new URLSearchParams({
      client_id: config.clientID,
      grant_type: 'authorization_code',
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      ...param,
      code,
    });

    console.log("Params: " + JSON.stringify(params));
    this.logger.log("Params: ", params);

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
      // headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (platform === 'tiktok') {
      const fields = [
        'open_id', 'union_id', 'avatar_url', 'display_name',
        'username', 'follower_count', 'following_count', 'likes_count',
        'video_count'
      ];
      profileUrl += `?fields=${fields.join(',')}`;
    }

    const response = await fetch(profileUrl, { headers });

    console.log("Profile data: ", response);

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

      case 'tiktok':
        return {
          id: rawData.user?.open_id,
          username: rawData.user?.username,
          name: rawData.user?.display_name,
          profileUrl: rawData?.user?.profile_deep_link,
          profilePictureUrl: rawData.user?.avatar_url,
          followerCount: rawData.user?.follower_count,
        };

      case 'calendly':
        return {
          id: rawData.resource?.alexemerie7,
          name: rawData.resource?.name,
          profileUrl: rawData?.resource?.scheduling_url,
          profilePictureUrl: rawData.resource?.avatar_url,
          locale: rawData.resource?.locale,
          timezone: rawData.resource?.timezone,
          uri: rawData.resource?.uri,
        };

      default:
        return rawData;
    }
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
