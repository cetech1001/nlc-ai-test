import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { IntegrationFactory } from "./factories/integration.factory";
import { PrismaService } from "../prisma/prisma.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { StateTokenService } from "./services/state-token.service";
import type { AuthUser, Integration } from "@nlc-ai/types";
import type { Response } from "express";
import { oauthError } from "./templates/oauth-error";
import { oauthSuccess } from "./templates/oauth-success";

@ApiTags('Integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IntegrationsController {
  constructor(
    private readonly integrationFactory: IntegrationFactory,
    private readonly prisma: PrismaService,
    private readonly stateTokenService: StateTokenService,
  ) {}

  // ==================== GENERAL INTEGRATION ENDPOINTS ====================

  @Get()
  @ApiOperation({ summary: 'Get all integrations for the authenticated coach' })
  @ApiResponse({ status: 200, description: 'Integrations retrieved successfully' })
  async getAllIntegrations(@CurrentUser() user: AuthUser) {
    return this.prisma.integration.findMany({
      where: { coachID: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('platform/:platform')
  @ApiOperation({ summary: 'Get specific integration for coach' })
  @ApiResponse({ status: 200, description: 'Integrations retrieved successfully' })
  async getIntegration(
    @CurrentUser() user: AuthUser,
    @Param('platform') platform: string,
    ) {
    const integration = await this.prisma.integration.findFirst({
      where: {
        coachID: user.id,
        platformName: platform,
      },
    });

    if (!integration) {
      return { isConnected: false };
    }

    return {
      isConnected: true,
      ...(integration.config as any),
      lastSync: integration.lastSyncAt,
    };
  }

  @Get('social')
  @ApiOperation({ summary: 'Get social media integrations only' })
  @ApiResponse({ status: 200, description: 'Social integrations retrieved successfully' })
  async getSocialIntegrations(@CurrentUser() user: AuthUser) {
    return this.prisma.integration.findMany({
      where: {
        coachID: user.id,
        integrationType: 'social'
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('apps')
  @ApiOperation({ summary: 'Get app integrations only (like Calendly, Gmail)' })
  @ApiResponse({ status: 200, description: 'App integrations retrieved successfully' })
  async getAppIntegrations(@CurrentUser() user: AuthUser) {
    return this.prisma.integration.findMany({
      where: {
        coachID: user.id,
        integrationType: 'app'
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get course platform integrations only' })
  @ApiResponse({ status: 200, description: 'Course integrations retrieved successfully' })
  async getCourseIntegrations(@CurrentUser() user: AuthUser) {
    return this.prisma.integration.findMany({
      where: {
        coachID: user.id,
        integrationType: 'course'
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('platforms')
  @ApiOperation({ summary: 'Get all supported platforms organized by type' })
  @ApiResponse({ status: 200, description: 'Supported platforms retrieved' })
  getSupportedPlatforms() {
    return {
      social: this.integrationFactory.getSocialPlatforms(),
      app: this.integrationFactory.getAppPlatforms(),
      course: this.integrationFactory.getCoursePlatforms(),
      all: this.integrationFactory.getSupportedPlatforms(),
    };
  }

  // ==================== CONNECTION ENDPOINTS ====================

  @Post('connect/:platform')
  @ApiOperation({ summary: 'Connect a platform with credentials' })
  @ApiResponse({ status: 201, description: 'Platform connected successfully' })
  async connectPlatform(
    @CurrentUser() user: AuthUser,
    @Param('platform') platform: string,
    @Body() credentials: any,
  ) {
    const provider = this.integrationFactory.getProvider(platform);
    return provider.connect(user.id, credentials);
  }

  @Get('auth/:platform/url')
  @ApiOperation({ summary: 'Get OAuth authorization URL for a platform' })
  @ApiResponse({ status: 200, description: 'Authorization URL generated' })
  async getAuthUrl(
    @CurrentUser() user: AuthUser,
    @Param('platform') platform: string,
  ) {
    const provider = this.integrationFactory.getProvider(platform);

    if (!provider.getAuthUrl) {
      throw new BadRequestException(`${platform} doesn't support OAuth flow`);
    }

    return provider.getAuthUrl(user.id);
  }

  @Get('auth/:platform/callback')
  @Public()
  @ApiOperation({ summary: 'Handle OAuth callback from platform' })
  async handlePlatformCallback(
    @Res() res: Response,
    @Param('platform') platform: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
    @Query('error_description') errorDescription?: string,
  ) {
    if (error) {
      return this.sendOAuthError(res, platform, errorDescription || error);
    }

    if (!code || !state) {
      return this.sendOAuthError(res, platform, 'Missing authorization code or state parameter');
    }

    try {
      const { coachID, platform: statePlatform } = this.stateTokenService.verifyState(state);

      if (statePlatform !== platform) {
        throw new Error('Platform mismatch in state verification');
      }

      const provider = this.integrationFactory.getProvider(platform);
      const integration = await provider.handleCallback?.(coachID, code, state);

      this.sendOAuthSuccess(res, platform, integration!);
    } catch (error: any) {
      this.sendOAuthError(res, platform, error.message);
    }
  }

  // ==================== MANAGEMENT ENDPOINTS ====================

  @Post(':id/test')
  @ApiOperation({ summary: 'Test integration connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  async testIntegration(
    @CurrentUser() user: AuthUser,
    @Param('id') integrationID: string,
  ) {
    const integration = await this.findUserIntegration(user.id, integrationID);
    const provider = this.integrationFactory.getProvider(integration.platformName);
    return provider.test(integration);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Manually sync data from platform' })
  @ApiResponse({ status: 200, description: 'Sync initiated successfully' })
  async syncIntegration(
    @CurrentUser() user: AuthUser,
    @Param('id') integrationID: string,
  ) {
    const integration = await this.findUserIntegration(user.id, integrationID);
    const provider = this.integrationFactory.getProvider(integration.platformName);
    return provider.sync(integration);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect integration' })
  @ApiResponse({ status: 200, description: 'Integration disconnected successfully' })
  async disconnectIntegration(
    @CurrentUser() user: AuthUser,
    @Param('id') integrationID: string,
  ) {
    const integration = await this.findUserIntegration(user.id, integrationID);
    const provider = this.integrationFactory.getProvider(integration.platformName);
    await provider.disconnect(integration);
    return { success: true, message: 'Integration disconnected' };
  }

  // ==================== SPECIFIC PLATFORM ENDPOINTS ====================

  @Post('calendly/types')
  @ApiOperation({ summary: 'Load Calendly types for coach' })
  @ApiResponse({ status: 200, description: 'Calendly types loaded successfully' })
  async loadCalendlyEvents(
    @CurrentUser() user: AuthUser,
    @Body() body: { startDate: string; endDate: string }
  ) {
    const integration = await this.prisma.integration.findFirst({
      where: {
        coachID: user.id,
        platformName: 'calendly'
      },
    });

    if (!integration) {
      throw new NotFoundException('Calendly integration not found');
    }

    const provider = this.integrationFactory.getProvider('calendly');

    return provider.fetchScheduledEvents?.(
      integration.accessToken!,
      (integration.config as any).userUri,
      new Date(body.startDate).toISOString(),
      new Date(body.endDate).toISOString(),
    );
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private sendOAuthSuccess(res: Response, platform: string, integration: Integration) {
    res.setHeader('Content-Type', 'text/html');
    res.send(oauthSuccess(platform, integration));
  }

  private sendOAuthError(res: Response, platform: string, errorMessage: string) {
    res.setHeader('Content-Type', 'text/html');
    res.send(oauthError(errorMessage, platform));
  }

  private async findUserIntegration(coachID: string, integrationID: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationID, coachID },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return integration;
  }
}
