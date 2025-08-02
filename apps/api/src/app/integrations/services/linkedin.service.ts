import {Injectable} from "@nestjs/common";
import {BaseIntegrationService} from "./base-integration.service";
import {Integration, OAuthCredentials, SyncResult, TestResult} from "@nlc-ai/types";

@Injectable()
export class LinkedinService extends BaseIntegrationService {
  platformName = 'linkedin';
  integrationType = 'social' as const;
  authType = 'oauth' as const;

  async connect(coachID: string, credentials: OAuthCredentials): Promise<Integration> {
    const profile = await this.getLinkedinProfile(credentials.accessToken);

    return this.saveIntegration({
      coachID,
      integrationType: this.integrationType,
      platformName: this.platformName,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      tokenExpiresAt: credentials.tokenExpiresAt,
      config: {
        id: profile.id,
        firstName: profile.localizedFirstName,
        lastName: profile.localizedLastName,
        name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
        profileUrl: `https://linkedin.com/in/${profile.vanityName || profile.id}`,
        profilePictureUrl: profile.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
      },
      syncSettings: {
        autoSync: true,
        syncFrequency: 'daily',
        syncPosts: true,
        syncConnections: true,
      },
      isActive: true,
    });
  }

  async test(integration: Integration): Promise<TestResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      await this.getLinkedinProfile(accessToken);
      return { success: true, message: 'LinkedIn connection working' };
    } catch (error: any) {
      return { success: false, message: `LinkedIn test failed: ${error.message}` };
    }
  }

  async sync(integration: Integration): Promise<SyncResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const profile = await this.getLinkedinProfile(accessToken);

      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          config: {
            ...integration.config,
            ...profile,
            lastSync: new Date().toISOString(),
          },
          lastSyncAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'LinkedIn synced successfully',
        data: { profile },
      };
    } catch (error: any) {
      return { success: false, message: `LinkedIn sync failed: ${error.message}` };
    }
  }

  async getAuthUrl(coachID: string): Promise<{ authUrl: string; state: string }> {
    const state = this.stateTokenService.generateState(coachID, this.platformName);

    const params = new URLSearchParams({
      client_id: this.configService.get('LINKEDIN_CLIENT_ID', ''),
      scope: ['r_liteprofile', 'r_emailaddress', 'w_member_social'].join(' '),
      redirect_uri: `${this.configService.get('API_BASE_URL')}/integrations/auth/linkedin/callback`,
      response_type: 'code',
      state,
    });

    return {
      authUrl: `https://www.linkedin.com/oauth/v2/authorization?${params}`,
      state,
    };
  }

  async handleCallback(coachID: string, code: string, state: string): Promise<Integration> {
    const tokenData = await this.exchangeCodeForToken(code);
    return this.connect(coachID, tokenData);
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.configService.get('LINKEDIN_CLIENT_ID', ''),
      client_secret: this.configService.get('LINKEDIN_CLIENT_SECRET', ''),
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${this.configService.get('API_BASE_URL')}/integrations/auth/linkedin/callback`,
    });

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
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

  private async getLinkedinProfile(accessToken: string): Promise<any> {
    const response = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,vanityName,profilePicture(displayImage~:playableStreams))', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    return response.json();
  }
}
