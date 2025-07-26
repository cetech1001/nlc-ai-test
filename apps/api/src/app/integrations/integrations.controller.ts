import {Controller, Get, Post, Body, UseGuards, Request, Delete, Param, Put, BadRequestException} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTypes } from '../auth/decorators/user-types.decorator';
import { UserTypesGuard } from '../auth/guards/user-types.guard';
import {type PlatformConnectionRequest, UserType} from "@nlc-ai/types";

@ApiTags('Integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach)
@ApiBearerAuth()
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all integrations for the authenticated coach' })
  @ApiResponse({ status: 200, description: 'Integrations retrieved successfully' })
  getIntegrations(@Request() req: { user: { id: string } }) {
    return this.integrationsService.getIntegrations(req.user.id);
  }

  @Get('social')
  @ApiOperation({ summary: 'Get social media integrations only' })
  @ApiResponse({ status: 200, description: 'Social integrations retrieved successfully' })
  async getSocialIntegrations(@Request() req: { user: { id: string } }) {
    const allIntegrations = await this.integrationsService.getIntegrations(req.user.id);
    return allIntegrations.filter(integration => integration.integrationType === 'social');
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get course platform integrations only' })
  @ApiResponse({ status: 200, description: 'Course integrations retrieved successfully' })
  async getCourseIntegrations(@Request() req: { user: { id: string } }) {
    const allIntegrations = await this.integrationsService.getIntegrations(req.user.id);
    return allIntegrations.filter(integration => integration.integrationType === 'course');
  }

  @Get('apps')
  @ApiOperation({ summary: 'Get app integrations only (like Calendly)' })
  @ApiResponse({ status: 200, description: 'App integrations retrieved successfully' })
  async getAppIntegrations(@Request() req: { user: { id: string } }) {
    const allIntegrations = await this.integrationsService.getIntegrations(req.user.id);
    return allIntegrations.filter(integration => integration.integrationType === 'app');
  }

  @Post('connect/:platform')
  @ApiOperation({ summary: 'Connect a platform (social, course, or app)' })
  @ApiResponse({ status: 201, description: 'Platform connected successfully' })
  connectPlatform(
    @Request() req: { user: { id: string } },
    @Param('platform') platform: string,
    @Body() body: PlatformConnectionRequest,
  ) {
    // Determine if this is a course platform connection
    const coursePlatforms = ['thinkific', 'teachable', 'kajabi', 'skool'];

    if (coursePlatforms.includes(platform)) {
      return this.integrationsService.connectCoursePlatform(
        req.user.id,
        platform,
        body as Record<string, string>
      );
    }

    // Handle social/app platforms with existing logic
    return this.integrationsService.connectPlatform(
      req.user.id,
      platform,
      body
    );
  }

  @Post('courses/connect/:platform')
  @ApiOperation({ summary: 'Connect a course platform with credentials' })
  @ApiResponse({ status: 201, description: 'Course platform connected successfully' })
  connectCoursePlatform(
    @Request() req: { user: { id: string } },
    @Param('platform') platform: string,
    @Body() body: {
      apiKey?: string;
      subdomain?: string;
      schoolUrl?: string;
      groupUrl?: string;
      zapierApiKey?: string;
      clientID?: string;
      clientSecret?: string;
    }
  ) {
    return this.integrationsService.connectCoursePlatform(
      req.user.id,
      platform,
      body as Record<string, string>
    );
  }

  @Post('courses/test/:platform')
  @ApiOperation({ summary: 'Test course platform credentials before connecting' })
  @ApiResponse({ status: 200, description: 'Course platform credentials tested' })
  testCoursePlatformCredentials(
    @Param('platform') platform: string,
    @Body() body: {
      apiKey?: string;
      subdomain?: string;
      schoolUrl?: string;
      groupUrl?: string;
      zapierApiKey?: string;
      clientID?: string;
      clientSecret?: string;
    }
  ) {
    return this.integrationsService.testCoursePlatformConnection(
      platform,
      body as Record<string, string>
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update integration settings' })
  @ApiResponse({ status: 200, description: 'Integration updated successfully' })
  updateIntegration(
    @Request() req: { user: { id: string } },
    @Param('id') integrationID: string,
    @Body() body: {
      isActive?: boolean;
      syncSettings?: any;
      config?: any;
    }
  ) {
    return this.integrationsService.updateIntegration(
      req.user.id,
      integrationID,
      body
    );
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test integration connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  testIntegration(
    @Request() req: { user: { id: string } },
    @Param('id') integrationID: string
  ) {
    console.log("User: ", req.user);
    console.log("Integration ID: ", integrationID);
    return this.integrationsService.testIntegration(req.user.id, integrationID);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect integration' })
  @ApiResponse({ status: 200, description: 'Integration disconnected successfully' })
  disconnectIntegration(
    @Request() req: { user: { id: string } },
    @Param('id') integrationID: string
  ) {
    console.log("User: ", req.user);
    console.log("Integration ID: ", integrationID);
    return this.integrationsService.disconnectIntegration(req.user.id, integrationID);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Manually sync data from platform' })
  @ApiResponse({ status: 200, description: 'Sync initiated successfully' })
  syncPlatformData(
    @Request() req: { user: { id: string } },
    @Param('id') integrationID: string
  ) {
    return this.integrationsService.syncPlatformData(req.user.id, integrationID);
  }

  @Post('courses/:id/sync')
  @ApiOperation({ summary: 'Manually sync course platform data' })
  @ApiResponse({ status: 200, description: 'Course sync initiated successfully' })
  syncCoursePlatformData(
    @Request() req: { user: { id: string } },
    @Param('id') integrationID: string
  ) {
    return this.integrationsService.syncCoursePlatformData(req.user.id, integrationID);
  }

  @Get('auth/:platform/url')
  @ApiOperation({ summary: 'Get OAuth authorization URL for a platform' })
  @ApiResponse({ status: 200, description: 'Authorization URL generated' })
  getAuthUrl(
    @Request() req: { user: { id: string } },
    @Param('platform') platform: string
  ) {
    return this.integrationsService.getAuthUrl(req.user.id, platform);
  }

  @Post('auth/:platform/callback')
  @ApiOperation({ summary: 'Handle OAuth callback from platform' })
  @ApiResponse({ status: 200, description: 'OAuth callback processed successfully' })
  handleOAuthCallback(
    @Request() req: { user: { id: string } },
    @Param('platform') platform: string,
    @Body() body: { code: string; state?: string }
  ) {
    return this.integrationsService.handleOAuthCallback(
      req.user.id,
      platform,
      body.code,
      body.state
    );
  }

  // Course platform specific endpoints
  @Get('courses/:id/data')
  @ApiOperation({ summary: 'Get courses and students data from connected platform' })
  @ApiResponse({ status: 200, description: 'Course platform data retrieved' })
  async getCoursePlatformData(
    @Request() req: { user: { id: string } },
    @Param('id') integrationID: string
  ) {
    const integration = await this.integrationsService.findIntegrationByIDAndCoach(integrationID, req.user.id);

    if (integration.integrationType !== 'course') {
      throw new BadRequestException('Integration is not a course platform');
    }

    // Return the synced data from the integration config
    return {
      platform: integration.platformName,
      courses: integration.config?.courses || [],
      students: integration.config?.students || [],
      stats: integration.config?.stats || {},
      lastSync: integration.lastSyncAt,
    };
  }

  @Get('courses/platforms')
  @ApiOperation({ summary: 'Get available course platforms and their requirements' })
  @ApiResponse({ status: 200, description: 'Available course platforms' })
  getAvailableCoursePlatforms() {
    return {
      skool: {
        name: 'Skool',
        authType: 'webhook',
        requiredFields: ['groupUrl', 'zapierApiKey'],
        description: 'Connect your Skool community via Zapier webhooks',
        isActive: true,
        setupInstructions: [
          'Go to your Skool group settings',
          'Click on Plugins → Zapier',
          'Copy your API key',
          'Set up Zapier integration for automated workflows',
          'Note: Limited to webhook-based integration'
        ]
      },
      kajabi: {
        name: 'Kajabi',
        authType: 'api_key',
        requiredFields: ['apiKey'],
        description: 'Connect your Kajabi site (Limited - API in private beta)',
        isActive: true,
        setupInstructions: [
          'Go to Settings → Sign-in & Security in your Kajabi account',
          'Click "Request Token" to generate an API token',
          'Copy and securely store the token',
          'Note: Kajabi API is currently in private beta'
        ]
      },
      teachable: {
        name: 'Teachable',
        authType: 'api_key',
        requiredFields: ['apiKey'],
        description: 'Connect your Teachable school to sync courses and students',
        isActive: false,
        setupInstructions: [
          'Go to Settings → API in your Teachable dashboard',
          'Click "Create API Key"',
          'Enter a name for your API key',
          'Copy the generated API key'
        ]
      },
      thinkific: {
        name: 'Thinkific',
        authType: 'api_key',
        requiredFields: ['subdomain', 'apiKey'],
        description: 'Connect your Thinkific school to sync courses and students',
        isActive: false,
        setupInstructions: [
          'Go to Settings → Code & Analytics in your Thinkific dashboard',
          'Scroll down to the API section',
          'Click "Reveal Key" to get your API key',
          'Your subdomain is the part before .thinkific.com in your URL'
        ]
      },
    };
  }
}
