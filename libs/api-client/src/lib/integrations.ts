import { BaseAPI } from './base';
import { Integration } from '@nlc-ai/types';

export interface IntegrationResponse extends Omit<Integration, 'coach' | 'webhookEvents'> {
  config?: any;
}

export interface ConnectRequest {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  subdomain?: string;
  schoolUrl?: string;
  clientID?: string;
  clientSecret?: string;
  [key: string]: any;
}

export interface AuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface TestResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface SupportedPlatforms {
  social: string[];
  app: string[];
  course: string[];
  all: string[];
}

class IntegrationsAPI extends BaseAPI {

  // ==================== GENERAL INTEGRATION METHODS ====================

  /**
   * Get all integrations for the authenticated coach
   */
  async getAllIntegrations(): Promise<IntegrationResponse[]> {
    return this.makeRequest('/integrations');
  }

  /**
   * Get social media integrations only
   */
  async getSocialIntegrations(): Promise<IntegrationResponse[]> {
    return this.makeRequest('/integrations/social');
  }

  /**
   * Get app integrations only (Calendly, Gmail, Outlook)
   */
  async getAppIntegrations(): Promise<IntegrationResponse[]> {
    return this.makeRequest('/integrations/apps');
  }

  /**
   * Get course platform integrations only
   */
  async getCourseIntegrations(): Promise<IntegrationResponse[]> {
    return this.makeRequest('/integrations/courses');
  }

  /**
   * Get all supported platforms organized by type
   */
  async getSupportedPlatforms(): Promise<SupportedPlatforms> {
    return this.makeRequest('/integrations/platforms');
  }

  // ==================== CONNECTION METHODS ====================

  /**
   * Connect a platform with credentials
   */
  async connectPlatform(platform: string, credentials: ConnectRequest): Promise<IntegrationResponse> {
    return this.makeRequest(`/integrations/connect/${platform}`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Get OAuth authorization URL for a platform
   */
  async getAuthUrl(platform: string): Promise<AuthUrlResponse> {
    return this.makeRequest(`/integrations/auth/${platform}/url`);
  }

  /**
   * Helper method to initiate OAuth flow for platforms
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
          throw new Error('Both popup and new tab were blocked. Please allow popups for this site.');
        }

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
        // Listen for messages from the OAuth callback
        const messageHandler = (event: MessageEvent) => {
          if (event.data?.type === 'integration_success' && event.data?.platform === platform) {
            window.removeEventListener('message', messageHandler);
            authWindow?.close();
            resolve();
          } else if (event.data?.type === 'integration_error' && event.data?.platform === platform) {
            window.removeEventListener('message', messageHandler);
            authWindow?.close();
            reject(new Error(event.data.error || 'OAuth flow failed'));
          }
        };

        window.addEventListener('message', messageHandler);

        // Also check if window is closed manually
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);

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
            window.removeEventListener('message', messageHandler);
            reject(new Error('OAuth flow timed out'));
          }
        }, 300000);
      });
    } catch (error) {
      throw new Error(`Failed to initiate OAuth flow: ${error}`);
    }
  }

  // ==================== MANAGEMENT METHODS ====================

  /**
   * Test integration connection
   */
  async testIntegration(integrationID: string): Promise<TestResponse> {
    return this.makeRequest(`/integrations/${integrationID}/test`, {
      method: 'POST',
    });
  }

  /**
   * Manually sync data from platform
   */
  async syncIntegration(integrationID: string): Promise<TestResponse> {
    return this.makeRequest(`/integrations/${integrationID}/sync`, {
      method: 'POST',
    });
  }

  /**
   * Disconnect integration
   */
  async disconnectIntegration(integrationID: string): Promise<TestResponse> {
    return this.makeRequest(`/integrations/${integrationID}`, {
      method: 'DELETE',
    });
  }

  // ==================== CALENDLY SPECIFIC METHODS ====================

  /**
   * Get Calendly integration status
   */
  async getCalendlyIntegration(): Promise<{
    isConnected: boolean;
    schedulingUrl?: string;
    userUri?: string;
    lastSync?: Date;
  }> {
    return this.makeRequest('/integrations/calendly');
  }

  /**
   * Load Calendly events for date range
   */
  async loadCalendlyEvents(startDate: Date, endDate: Date, status: string): Promise<any> {
    return this.makeRequest('/integrations/calendly/events', {
      method: 'POST',
      body: JSON.stringify({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status,
      }),
    });
  }

  // ==================== HELPER METHODS ====================

  /**
   * Helper method to get integration by platform
   */
  async getIntegrationByPlatform(platform: string): Promise<IntegrationResponse | null> {
    return this.makeRequest(`/integrations/platform/${platform}`);
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
    const integrations = await this.getAllIntegrations();
    return integrations
      .filter(integration => integration.isActive)
      .map(integration => integration.platformName);
  }

  /**
   * Helper method to get connected platforms by type
   */
  async getConnectedPlatformsByType(type: 'social' | 'app' | 'course'): Promise<string[]> {
    let integrations: IntegrationResponse[];

    switch (type) {
      case 'social':
        integrations = await this.getSocialIntegrations();
        break;
      case 'app':
        integrations = await this.getAppIntegrations();
        break;
      case 'course':
        integrations = await this.getCourseIntegrations();
        break;
      default:
        integrations = [];
    }

    return integrations
      .filter(integration => integration.isActive)
      .map(integration => integration.platformName);
  }
}

export const integrationsAPI = new IntegrationsAPI();
