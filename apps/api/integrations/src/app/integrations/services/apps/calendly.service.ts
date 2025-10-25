import {Injectable, UnauthorizedException} from "@nestjs/common";
import {BaseIntegrationService} from "../base-integration.service";
import {
  AppPlatform,
  AuthType,
  Integration,
  IntegrationType,
  OAuthCredentials,
  SyncResult,
  TestResult, UserType
} from "@nlc-ai/types";

@Injectable()
export class CalendlyService extends BaseIntegrationService {
  platformName = AppPlatform.CALENDLY;
  integrationType = IntegrationType.APP;
  authType = AuthType.OAUTH;

  private calendlyBaseUrl = 'https://api.calendly.com';

  async connect(userID: string, userType: UserType, credentials: OAuthCredentials): Promise<Integration> {
    const profile = await this.getCalendlyProfile(credentials.accessToken);

    return this.saveIntegration({
      userID,
      userType,
      integrationType: this.integrationType,
      platformName: this.platformName,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      tokenExpiresAt: credentials.tokenExpiresAt,
      config: {
        userUri: profile.uri,
        name: profile.name,
        email: profile.email,
        schedulingUrl: profile.scheduling_url,
        timezone: profile.timezone,
        avatarUrl: profile.avatar_url,
      },
      syncSettings: {
        autoSync: true,
        syncFrequency: 'daily',
        syncEvents: true,
      },
      isActive: true,
    });
  }

  async test(integration: Integration): Promise<TestResult> {
    try {
      const { accessToken } = await this.getValidTokens(integration);
      await this.getCalendlyProfile(accessToken);
      return { success: true, message: 'Calendly connection working' };
    } catch (error: any) {
      return { success: false, message: `Calendly test failed: ${error.message}` };
    }
  }

  async sync(integration: Integration): Promise<SyncResult> {
    try {
      const { accessToken } = await this.getValidTokens(integration);
      const events = await this.fetchScheduledEvents(
        accessToken,
        integration.config.userUri
      );

      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          config: {
            ...integration.config,
            eventCount: events.length,
            lastSync: new Date().toISOString(),
          },
          lastSyncAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Calendly synced successfully',
        data: { eventCount: events.length },
      };
    } catch (error: any) {
      return { success: false, message: `Calendly sync failed: ${error.message}` };
    }
  }

  async getAuthUrl(userID: string, userType: UserType): Promise<{ authUrl: string; state: string }> {
    const state = this.stateToken.generateState(userID, userType, this.platformName);

    const params = new URLSearchParams({
      client_id: this.config.get('integrations.oauth.calendly.clientID', ''),
      redirect_uri: `${this.config.get('integrations.baseUrl')}/integrations/auth/calendly/callback`,
      response_type: 'code',
      state,
    });

    return {
      authUrl: `https://auth.calendly.com/oauth/authorize?${params}`,
      state,
    };
  }

  async handleCallback(userID: string, userType: UserType, code: string, state: string): Promise<Integration> {
    const tokenData = await this.exchangeCodeForToken(code);
    return this.connect(userID, userType, tokenData);
  }

  /**
   * Fetch scheduled events from Calendly API
   * This method handles token refresh automatically
   */
  async fetchScheduledEvents(
    accessToken: string,
    userUri: string,
    startDate?: string,
    endDate?: string,
    status?: string,
  ) {
    const params = new URLSearchParams({
      user: userUri,
      status: status || 'active',
    });

    if (startDate) {
      params.append('min_start_time', startDate);
    }

    if (endDate) {
      params.append('max_start_time', endDate);
    }

    const response = await fetch(`${this.calendlyBaseUrl}/scheduled_events?${params}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendly API error: ${response.status} ${error}`);
    }

    const data: any = await response.json();
    return data.collection || [];
  }

  /**
   * Get event invitees from Calendly API
   */
  async getEventInvitees(accessToken: string, eventUri: string) {
    const eventID = eventUri.split('/').pop();
    const response = await fetch(`${this.calendlyBaseUrl}/scheduled_events/${eventID}/invitees`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendly API error: ${response.status} ${error}`);
    }

    const data: any = await response.json();
    return data.collection || [];
  }

  /**
   * Get event types from Calendly API
   */
  async getEventTypes(accessToken: string, organizationUri?: string) {
    const params = new URLSearchParams();
    if (organizationUri) {
      params.append('organization', organizationUri);
    }

    const response = await fetch(`${this.calendlyBaseUrl}/event_types?${params}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendly API error: ${response.status} ${error}`);
    }

    const data: any = await response.json();
    return data.collection || [];
  }

  /**
   * Cancel a Calendly event
   */
  async cancelEvent(accessToken: string, eventUri: string, reason?: string) {
    const eventID = eventUri.split('/').pop();
    const response = await fetch(`${this.calendlyBaseUrl}/scheduled_events/${eventID}/cancellation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: reason || 'Cancelled by host'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendly API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  /**
   * Get valid tokens, refreshing if necessary
   */
  async getValidTokens(integration: Integration): Promise<{ accessToken: string; refreshToken?: string }> {
    const { accessToken, refreshToken } = await this.getDecryptedTokens(integration);

    if (integration.tokenExpiresAt && new Date(integration.tokenExpiresAt) <= new Date(Date.now() + 5 * 60 * 1000)) {
      if (!refreshToken) {
        throw new UnauthorizedException('Access token expired and no refresh token available');
      }

      const newTokens = await this.refreshAccessToken(refreshToken);

      await this.updateIntegrationTokens(
        integration.id,
        newTokens.accessToken,
        newTokens.refreshToken,
        newTokens.tokenExpiresAt,
      );

      return {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      };
    }

    return { accessToken: accessToken || '', refreshToken: refreshToken || '' };
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(refreshToken: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.config.get('integrations.oauth.calendly.clientID', ''),
      client_secret: this.config.get('integrations.oauth.calendly.clientSecret', ''),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new UnauthorizedException(`Failed to refresh Calendly token: ${error}`);
    }

    const tokenData: any = await response.json();

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken,
      tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
    };
  }

  /**
   * Update integration tokens in the database
   */
  protected override async updateIntegrationTokens(
    integrationID: string,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date,
  ): Promise<void> {
    const encryptedAccessToken = await this.encryption.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken
      ? await this.encryption.encrypt(refreshToken)
      : undefined;

    await this.prisma.integration.update({
      where: { id: integrationID },
      data: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: expiresAt,
      },
    });
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.config.get('integrations.oauth.calendly.clientID', ''),
      client_secret: this.config.get('integrations.oauth.calendly.clientSecret', ''),
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${this.config.get('integrations.baseUrl')}/integrations/auth/calendly/callback`,
    });

    const response = await fetch('https://auth.calendly.com/oauth/token', {
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

  private async getCalendlyProfile(accessToken: string) {
    const response = await fetch(`${this.calendlyBaseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendly API error: ${response.status} ${error}`);
    }

    const data: any = await response.json();
    return data.resource;
  }
}
