import * as crypto from 'crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser, Public } from '@nlc-ai/api-auth';
import {UserType, type AuthUser} from '@nlc-ai/api-types';
import { ConnectPlatformRequest, LoadCalendlyEventsRequest } from '@nlc-ai/api-types';
import type { Response } from "express";
import { IntegrationFactory } from "./factories/integration.factory";
import { StateTokenService } from "./services/state-token.service";
import { IntegrationsService } from "./integrations.service";
import { CalendlyService } from "./services/apps/calendly.service";
import { oauthError } from "./templates/oauth-error";
import { oauthSuccess } from "./templates/oauth-success";
import { ToggleProfileVisibilityDto } from './dto';

@ApiTags('Integrations')
@Controller('')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin, UserType.client)
@ApiBearerAuth()
export class IntegrationsController {
  constructor(
    private readonly integrationFactory: IntegrationFactory,
    private readonly integrationsService: IntegrationsService,
    private readonly stateTokenService: StateTokenService,
    private readonly calendlyService: CalendlyService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all integrations for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Integrations retrieved successfully' })
  async getAllIntegrations(@CurrentUser() user: AuthUser) {
    return this.integrationsService.getAllIntegrations(user.id, user.type);
  }

  @Get('platform/:platform')
  @ApiOperation({ summary: 'Get specific integration for user' })
  @ApiResponse({ status: 200, description: 'Integration retrieved successfully' })
  async getIntegration(
    @CurrentUser() user: AuthUser,
    @Param('platform') platform: string,
  ) {
    return this.integrationsService.getIntegrationByPlatform(user.id, user.type, platform);
  }

  @Get('social')
  @ApiOperation({ summary: 'Get social media integrations only' })
  @ApiResponse({ status: 200, description: 'Social integrations retrieved successfully' })
  async getSocialIntegrations(@CurrentUser() user: AuthUser) {
    return this.integrationsService.getSocialIntegrations(user.id, user.type);
  }

  @Get('social/public/:userID/:userType')
  @Public()
  @ApiOperation({ summary: 'Get public social media integrations for a user' })
  @ApiResponse({ status: 200, description: 'Public social integrations retrieved successfully' })
  async getPublicSocialIntegrations(
    @Param('userID') userID: string,
    @Param('userType') userType: UserType,
  ) {
    return this.integrationsService.getPublicSocialIntegrations(userID, userType);
  }

  @Get('apps')
  @ApiOperation({ summary: 'Get app integrations only' })
  @ApiResponse({ status: 200, description: 'App integrations retrieved successfully' })
  async getAppIntegrations(@CurrentUser() user: AuthUser) {
    return this.integrationsService.getAppIntegrations(user.id, user.type);
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

  @Post('connect/:platform')
  @ApiOperation({ summary: 'Connect a platform with credentials' })
  @ApiResponse({ status: 201, description: 'Platform connected successfully' })
  async connectPlatform(
    @CurrentUser() user: AuthUser,
    @Param('platform') platform: string,
    @Body() credentials: ConnectPlatformRequest,
  ) {
    const provider = this.integrationFactory.getProvider(platform);
    return provider.connect(user.id, user.type, credentials);
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

    return provider.getAuthUrl(user.id, user.type);
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
    @Query('error_message') errorMessage?: string,
    @Query('error_description') errorDescription?: string,
  ) {

    const nonce = crypto.randomBytes(16).toString('base64');
    res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    if (error) {
      return this.sendOAuthError(res, platform, errorDescription || errorMessage || error, nonce);
    }

    if (!code || !state) {
      return this.sendOAuthError(res, platform, 'Missing authorization code or state parameter', nonce);
    }

    try {
      const { userID, userType, platform: statePlatform } = this.stateTokenService.verifyState(state);

      if (statePlatform !== platform) {
        throw new Error('Platform mismatch in state verification');
      }

      const provider = this.integrationFactory.getProvider(platform);
      const integration = await provider.handleCallback?.(userID, userType, code, state);

      this.sendOAuthSuccess(res, platform, integration!, nonce);
    } catch (error: any) {
      this.sendOAuthError(res, platform, error.message, nonce);
    }
  }

  @Put(':id/profile-visibility')
  @ApiOperation({ summary: 'Toggle integration visibility on public profile' })
  @ApiResponse({ status: 200, description: 'Profile visibility updated successfully' })
  async toggleProfileVisibility(
    @CurrentUser() user: AuthUser,
    @Param('id') integrationID: string,
    @Body() body: ToggleProfileVisibilityDto,
  ) {
    await this.integrationsService.findUserIntegration(user.id, user.type, integrationID);

    await this.integrationsService.updateProfileVisibility(
      integrationID,
      body.showOnProfile
    );

    return {
      success: true,
      message: body.showOnProfile
        ? 'Integration will now be shown on your profile'
        : 'Integration will be hidden from your profile',
    };
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test integration connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  async testIntegration(
    @CurrentUser() user: AuthUser,
    @Param('id') integrationID: string,
  ) {
    const integration = await this.integrationsService.findUserIntegration(user.id, user.type, integrationID);
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
    const integration = await this.integrationsService.findUserIntegration(user.id, user.type, integrationID);
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
    const integration = await this.integrationsService.findUserIntegration(user.id, user.type, integrationID);
    const provider = this.integrationFactory.getProvider(integration.platformName);
    await provider.disconnect(integration);
    return { message: 'Integration disconnected' };
  }

  // ==================== CALENDLY SPECIFIC ENDPOINTS ====================

  @Post('calendly/events')
  @ApiOperation({ summary: 'Load Calendly events for user' })
  @ApiResponse({ status: 200, description: 'Calendly events loaded successfully' })
  async loadCalendlyEvents(
    @CurrentUser() user: AuthUser,
    @Body() body: LoadCalendlyEventsRequest
  ) {
    console.log('Load Calendly events for user');
    const integration = await this.integrationsService.getCalendlyIntegration(user.id, user.type);

    console.log('Integration: ', integration);
    // Get valid tokens (this will refresh if needed)
    const { accessToken } = await (this.calendlyService as any).getValidTokens(integration);

    console.log('Access Token : ', accessToken);

    // Fetch scheduled events
    const events = await this.calendlyService.fetchScheduledEvents(
      accessToken,
      (integration.config as any).userUri,
      new Date(body.startDate).toISOString(),
      new Date(body.endDate).toISOString(),
    );

    // Fetch invitees for each event
    const eventsWithInvitees = await Promise.all(
      events.map(async (event: any) => {
        const invitees = await this.calendlyService.getEventInvitees(accessToken, event.uri);
        return {
          ...event,
          invitees,
        };
      })
    );

    return { events: eventsWithInvitees };
  }

  @Get('calendly/event-types')
  @ApiOperation({ summary: 'Get Calendly event types for user' })
  @ApiResponse({ status: 200, description: 'Event types retrieved successfully' })
  async getCalendlyEventTypes(
    @CurrentUser() user: AuthUser,
    @Query('organizationUri') organizationUri?: string,
  ) {
    const integration = await this.integrationsService.getCalendlyIntegration(user.id, user.type);
    const { accessToken } = await (this.calendlyService as any).getValidTokens(integration);

    const eventTypes = await this.calendlyService.getEventTypes(accessToken, organizationUri);
    return { eventTypes };
  }

  @Post('calendly/events/:eventUri/cancel')
  @ApiOperation({ summary: 'Cancel a Calendly event' })
  @ApiResponse({ status: 200, description: 'Event cancelled successfully' })
  async cancelCalendlyEvent(
    @CurrentUser() user: AuthUser,
    @Param('eventUri') eventUri: string,
    @Body('reason') reason?: string,
  ) {
    const integration = await this.integrationsService.getCalendlyIntegration(user.id, user.type);
    const { accessToken } = await (this.calendlyService as any).getValidTokens(integration);

    const result = await this.calendlyService.cancelEvent(accessToken, eventUri, reason);
    return { success: true, data: result };
  }

  private sendOAuthSuccess(res: Response, platform: string, integration: any, nonce: string) {
    res.send(oauthSuccess(platform, integration, nonce));
  }

  private sendOAuthError(res: Response, platform: string, errorMessage: string, nonce: string) {
    res.send(oauthError(errorMessage, platform, nonce));
  }
}
