import { BaseAPI } from './base';
import { Integration } from '@nlc-ai/types';

export interface SocialIntegrationResponse extends Omit<Integration, 'coach' | 'webhookEvents'> {
  profileData?: {
    username?: string;
    name?: string;
    email?: string;
    profileUrl?: string;
    profilePictureUrl?: string;
    followerCount?: number;
    mediaCount?: number;
    subscriberCount?: number;
  };
}

export interface ConnectSocialRequest {
  accessToken: string;
  refreshToken?: string;
  profileData?: any;
  tokenExpiresAt?: string;
}

export interface AuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface TestResponse {
  success: boolean;
  message: string;
}

class IntegrationsAPI extends BaseAPI {
  /**
   * Get all social integrations for the authenticated coach
   */
  async getSocialIntegrations(): Promise<SocialIntegrationResponse[]> {
    return this.makeRequest('/integrations');
  }

  /**
   * Get OAuth authorization URL for a platform
   */
  async getAuthUrl(platform: string): Promise<AuthUrlResponse> {
    return this.makeRequest(`/integrations/auth/${platform}/url`);
  }

  /**
   * Handle OAuth callback from social platform
   */
  async handleOAuthCallback(
    platform: string,
    code: string,
    state?: string,
    error?: string,
    errorDescription?: string): Promise<SocialIntegrationResponse> {
    const params = `code=${code}&state=${state}&error=${error}&errorDescription=${errorDescription}`
    return this.makeRequest(`/oauth/${platform}/callback?${params}`);
  }

  /**
   * Connect a social media platform manually (for testing or direct token input)
   */
  async connectSocialPlatform(platform: string, authData: ConnectSocialRequest): Promise<SocialIntegrationResponse> {
    return this.makeRequest(`/integrations/connect/${platform}`, {
      method: 'POST',
      body: JSON.stringify(authData),
    });
  }

  /**
   * Update social integration settings
   */
  async updateSocialIntegration(
    integrationID: string,
    updateData: { isActive?: boolean; syncSettings?: any }
  ): Promise<SocialIntegrationResponse> {
    return this.makeRequest(`/integrations/${integrationID}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Test social integration connection
   */
  async testSocialIntegration(integrationID: string): Promise<TestResponse> {
    return this.makeRequest(`/integrations/${integrationID}/test`, {
      method: 'POST',
    });
  }

  /**
   * Disconnect social integration
   */
  async disconnectSocialIntegration(integrationID: string): Promise<TestResponse> {
    return this.makeRequest(`/integrations/${integrationID}`, {
      method: 'DELETE',
    });
  }

  /**
   * Manually sync data from social platform
   */
  async syncSocialData(integrationID: string): Promise<TestResponse> {
    return this.makeRequest(`/integrations/${integrationID}/sync`, {
      method: 'POST',
    });
  }

  /**
   * Helper method to initiate OAuth flow
   */
  async initiateOAuthFlow(platform: string): Promise<void> {
    try {
      // Open a blank popup immediately during user action to avoid Safari blocking
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      // Create popup window immediately with about:blank
      const authWindow = window.open(
        'about:blank',
        `${platform}_oauth`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      // Check if popup creation failed
      if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
        // Popup was blocked, fallback to new tab
        console.warn('Popup blocked, getting auth URL and opening in new tab');
        const { authUrl, state } = await this.getAuthUrl(platform);

        // Store state in localStorage for verification
        if (typeof window !== 'undefined') {
          localStorage.setItem(`oauth_state_${platform}`, state);
        }

        const newTabWindow = window.open(authUrl, '_blank');

        if (!newTabWindow) {
          throw new Error('Both popup and new tab were blocked. Please allow popups for this site or manually navigate to the authorization URL.');
        }

        // For new tab, we can't reliably detect when OAuth completes
        return Promise.resolve();
      }

      // Get auth URL after popup is created
      const { authUrl, state } = await this.getAuthUrl(platform);

      // Store state in localStorage for verification
      if (typeof window !== 'undefined') {
        localStorage.setItem(`oauth_state_${platform}`, state);
      }

      // Navigate the popup to the auth URL
      authWindow.location.href = authUrl;

      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            // Check if OAuth was successful by looking for integration
            this.getSocialIntegrations()
              .then(integrations => {
                const newIntegration = integrations.find(i => i.platformName === platform);
                if (newIntegration) {
                  resolve();
                } else {
                  reject(new Error('OAuth flow was cancelled or failed'));
                }
              })
              .catch(() => reject(new Error('Failed to verify OAuth completion')));
          }
        }, 1000);

        // Cleanup if window doesn't close within 5 minutes
        setTimeout(() => {
          if (!authWindow?.closed) {
            authWindow?.close();
            clearInterval(checkClosed);
            reject(new Error('OAuth flow timed out'));
          }
        }, 300000);
      });
    } catch (error) {
      throw new Error(`Failed to initiate OAuth flow: ${error}`);
    }
  }

  /**
   * Helper method to connect social platform with transformed data
   */
  async connectSocial(platform: string, authData: any): Promise<SocialIntegrationResponse> {
    // Transform authData to match the expected format
    const transformedData: ConnectSocialRequest = {
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      profileData: authData.profileData,
      tokenExpiresAt: authData.tokenExpiresAt,
    };

    return this.connectSocialPlatform(platform, transformedData);
  }

  /**
   * Helper method to get integration by platform
   */
  async getIntegrationByPlatform(platform: string): Promise<SocialIntegrationResponse | null> {
    const integrations = await this.getSocialIntegrations();
    return integrations.find(integration => integration.platformName === platform) || null;
  }

  /**
   * Helper method to check if platform is connected
   */
  async isPlatformConnected(platform: string): Promise<boolean> {
    const integration = await this.getIntegrationByPlatform(platform);
    return integration?.isActive === true;
  }

  /**
   * Helper method to get all connected platforms
   */
  async getConnectedPlatforms(): Promise<string[]> {
    const integrations = await this.getSocialIntegrations();
    return integrations
      .filter(integration => integration.isActive)
      .map(integration => integration.platformName);
  }
}

export const integrationsAPI = new IntegrationsAPI();
