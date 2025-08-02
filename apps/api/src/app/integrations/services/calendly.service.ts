import {Injectable} from "@nestjs/common";
import {BaseIntegrationService} from "./base-integration.service";
import {Integration, OAuthCredentials, SyncResult, TestResult} from "@nlc-ai/types";

@Injectable()
export class CalendlyService extends BaseIntegrationService {
  platformName = 'calendly';
  integrationType = 'app' as const;
  authType = 'oauth' as const;

  async connect(coachID: string, credentials: OAuthCredentials): Promise<Integration> {
    const profile = await this.getCalendlyProfile(credentials.accessToken);

    return this.saveIntegration({
      coachID,
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
      const { accessToken } = await this.getDecryptedTokens(integration);
      await this.getCalendlyProfile(accessToken);
      return { success: true, message: 'Calendly connection working' };
    } catch (error: any) {
      return { success: false, message: `Calendly test failed: ${error.message}` };
    }
  }

  async sync(integration: Integration): Promise<SyncResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const events = await this.fetchScheduledEvents(accessToken, integration.config.userUri);

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

  async getAuthUrl(coachID: string): Promise<{ authUrl: string; state: string }> {
    const state = this.stateTokenService.generateState(coachID, this.platformName);

    const params = new URLSearchParams({
      client_id: this.configService.get('CALENDLY_CLIENT_ID', ''),
      redirect_uri: `${this.configService.get('API_BASE_URL')}/integrations/auth/calendly/callback`,
      response_type: 'code',
      state,
    });

    return {
      authUrl: `https://auth.calendly.com/oauth/authorize?${params}`,
      state,
    };
  }

  async handleCallback(coachID: string, code: string, state: string): Promise<Integration> {
    const tokenData = await this.exchangeCodeForToken(code);
    return this.connect(coachID, tokenData);
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.configService.get('CALENDLY_CLIENT_ID', ''),
      client_secret: this.configService.get('CALENDLY_CLIENT_SECRET', ''),
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${this.configService.get('API_BASE_URL')}/integrations/auth/calendly/callback`,
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
    const response = await fetch('https://api.calendly.com/users/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data: any = await response.json();
    return data.resource;
  }

  private async fetchScheduledEvents(accessToken: string, userUri: string) {
    const response = await fetch(`https://api.calendly.com/scheduled_events?user=${userUri}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data: any = await response.json();
    return data.collection || [];
  }
}
