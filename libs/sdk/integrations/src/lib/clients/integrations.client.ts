/// <reference lib="dom"/>
import { BaseClient, SearchQuery, Paginated, FilterValues } from '@nlc-ai/sdk-core';
import {
  Integration,
  EmailAccount,
  ConnectPlatformRequest,
  AuthUrlResponse,
  TestResponse,
  SupportedPlatformsResponse,
  EmailAccountActionResponse,
  EmailAccountStatsResponse,
  LoadCalendlyEventsRequest,
  CalendlyEventsResponse,
  IntegrationSyncResponse,
  IntegrationStatusResponse,
  ToggleEmailSyncRequest,
  EmailAccountStatsQuery
} from '../types';

export class IntegrationsClient extends BaseClient {
  /**
   * Get all integrations for the authenticated user
   */
  async getIntegrations(searchOptions: SearchQuery = {}, filters: FilterValues = {}): Promise<Paginated<Integration>> {
    const params = new URLSearchParams();
    const { page = 1, limit = 10, search } = searchOptions;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await this.request<Paginated<Integration>>(
      'GET',
      `?${params.toString()}`
    );
    return response.data!;
  }

  /**
   * Get public social media integrations for a user
   */
  async getPublicSocialIntegrations(userID: string, userType: string): Promise<Array<{
    id: string;
    platformName: string;
    config: {
      username?: string;
      name?: string;
      displayName?: string;
      profileUrl?: string;
      followerCount?: number;
    };
  }>> {
    const response = await this.request<Array<{
      id: string;
      platformName: string;
      config: any;
    }>>('GET', `/social/public/${userID}/${userType}`);
    return response.data!;
  }

  /**
   * Toggle integration visibility on public profile
   */
  async toggleProfileVisibility(integrationID: string, showOnProfile: boolean): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(
      'PUT',
      `/${integrationID}/profile-visibility`,
      { body: { showOnProfile } }
    );
    return response.data!;
  }

  /**
   * Get social media integrations only
   */
  async getSocialIntegrations(): Promise<Integration[]> {
    const response = await this.request<Integration[]>('GET', '/social');
    return response.data!;
  }

  /**
   * Get app integrations only (Calendly, Gmail, Outlook)
   */
  async getAppIntegrations(): Promise<Integration[]> {
    const response = await this.request<Integration[]>('GET', '/apps');
    return response.data!;
  }

  /**
   * Get course platform integrations only
   */
  async getCourseIntegrations(): Promise<Integration[]> {
    const response = await this.request<Integration[]>('GET', '/courses');
    return response.data!;
  }

  /**
   * Get all supported platforms organized by type
   */
  async getSupportedPlatforms(): Promise<SupportedPlatformsResponse> {
    const response = await this.request<SupportedPlatformsResponse>('GET', '/platforms');
    return response.data!;
  }

  /**
   * Get integration by platform name
   */
  async getIntegrationByPlatform(platform: string): Promise<IntegrationStatusResponse> {
    const response = await this.request<IntegrationStatusResponse>('GET', `/platform/${platform}`);
    return response.data!;
  }

  // ==================== CONNECTION METHODS ====================

  /**
   * Connect a platform with credentials
   */
  async connectPlatform(platform: string, credentials: ConnectPlatformRequest): Promise<Integration> {
    const response = await this.request<Integration>('POST', `/connect/${platform}`, {
      body: credentials
    });
    return response.data!;
  }

  /**
   * Get OAuth authorization URL for a platform
   */
  async getAuthUrl(platform: string): Promise<AuthUrlResponse> {
    const response = await this.request<AuthUrlResponse>('GET', `/auth/${platform}/url`);
    return response.data!;
  }

  // ==================== MANAGEMENT METHODS ====================

  /**
   * Test integration connection
   */
  async testIntegration(integrationID: string): Promise<TestResponse> {
    const response = await this.request<TestResponse>('POST', `/${integrationID}/test`);
    return response.data!;
  }

  /**
   * Manually sync data from platform
   */
  async syncIntegration(integrationID: string): Promise<IntegrationSyncResponse> {
    const response = await this.request<IntegrationSyncResponse>('POST', `/${integrationID}/sync`);
    return response.data!;
  }

  /**
   * Disconnect integration
   */
  async disconnectIntegration(integrationID: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>('DELETE', `/${integrationID}`);
    return response.data!;
  }

  // ==================== EMAIL ACCOUNT METHODS ====================

  /**
   * Get all email accounts for the authenticated user
   */
  async getEmailAccounts(): Promise<EmailAccount[]> {
    const response = await this.request<EmailAccount[]>('GET', '/email-accounts');
    return response.data!;
  }

  /**
   * Get OAuth authorization URL for email provider
   */
  async getEmailAuthUrl(provider: string): Promise<AuthUrlResponse> {
    const response = await this.request<AuthUrlResponse>('GET', `/email-accounts/auth/${provider}/url`);
    return response.data!;
  }

  /**
   * Handle OAuth callback from email provider
   */
  async handleEmailOAuthCallback(provider: string, code: string, state?: string): Promise<EmailAccount> {
    const response = await this.request<EmailAccount>('POST', `/email-accounts/auth/${provider}/callback`, {
      body: { code, state }
    });
    return response.data!;
  }

  /**
   * Set email account as primary
   */
  async setPrimaryEmailAccount(accountID: string): Promise<EmailAccountActionResponse> {
    const response = await this.request<EmailAccountActionResponse>('POST', `/email-accounts/${accountID}/set-primary`);
    return response.data!;
  }

  /**
   * Manually sync email account
   */
  async syncEmailAccount(accountID: string): Promise<EmailAccountActionResponse> {
    const response = await this.request<EmailAccountActionResponse>('POST', `/email-accounts/${accountID}/sync`);
    return response.data!;
  }

  /**
   * Test email account connection
   */
  async testEmailAccount(accountID: string): Promise<EmailAccountActionResponse> {
    const response = await this.request<EmailAccountActionResponse>('POST', `/email-accounts/${accountID}/test`);
    return response.data!;
  }

  /**
   * Disconnect email account
   */
  async disconnectEmailAccount(accountID: string): Promise<EmailAccountActionResponse> {
    const response = await this.request<EmailAccountActionResponse>('DELETE', `/email-accounts/${accountID}`);
    return response.data!;
  }

  /**
   * Toggle email account sync
   */
  async toggleEmailAccountSync(accountID: string, data: ToggleEmailSyncRequest): Promise<EmailAccountActionResponse> {
    const response = await this.request<EmailAccountActionResponse>('POST', `/email-accounts/${accountID}/toggle`, {
      body: data
    });
    return response.data!;
  }

  /**
   * Get email account statistics
   */
  async getEmailAccountStats(accountID: string, query?: EmailAccountStatsQuery): Promise<EmailAccountStatsResponse> {
    const params = new URLSearchParams();
    if (query?.days) params.append('days', query.days);

    const response = await this.request<EmailAccountStatsResponse>(
      'GET',
      `/email-accounts/${accountID}/stats?${params.toString()}`
    );
    return response.data!;
  }

  // ==================== CALENDLY SPECIFIC METHODS ====================

  /**
   * Load Calendly events for date range
   */
  async loadCalendlyEvents(data: LoadCalendlyEventsRequest): Promise<CalendlyEventsResponse> {
    const response = await this.request<CalendlyEventsResponse>('POST', '/calendly/events', {
      body: data
    });
    return response.data!;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Check if platform is connected
   */
  async isPlatformConnected(platform: string): Promise<boolean> {
    try {
      const integration = await this.getIntegrationByPlatform(platform);
      return integration.isConnected === true;
    } catch {
      return false;
    }
  }

  /**
   * Get all connected platforms
   */
  async getConnectedPlatforms(): Promise<string[]> {
    const integrations = await this.getIntegrations();
    return integrations.data
      .filter(integration => integration.isActive)
      .map(integration => integration.platformName);
  }

  /**
   * Get connected platforms by type
   */
  async getConnectedPlatformsByType(type: 'social' | 'app' | 'course'): Promise<string[]> {
    let integrations: Integration[];

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

  /**
   * Initiate OAuth flow for platforms (browser only)
   */
  async initiateOAuthFlow(platform: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('OAuth flow is only available in browser environments');
    }

    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    let authWindow: Window | null = null;
    let popupBlocked = false;

    try {
      // Attempt to create popup window immediately with about:blank
      authWindow = window.open(
        'about:blank',
        `${platform}_oauth`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      // Check if popup creation failed or was blocked by the browser
      if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
        popupBlocked = true;
      }
    } catch (e) {
      // In some rare cases, window.open itself might throw, treat as blocked
      console.error("Error opening popup:", e);
      popupBlocked = true;
    }


    if (popupBlocked) {
      // Popup was blocked, fallback to new tab
      console.warn('Popup blocked, getting auth URL and opening in new tab');
      const { authUrl, state } = await this.getAuthUrl(platform);

      // Store state in localStorage for verification
      localStorage.setItem(`oauth_state_${platform}`, state);

      const newTabWindow = window.open(authUrl, '_blank');

      if (!newTabWindow) {
        throw new Error('Both popup and new tab were blocked. Please allow popups for this site.');
      }

      // When opening in a new tab, you won't get direct messages from it.
      // You'll need to poll your backend or rely on a user-driven refresh/notification.
      // For simplicity, we'll resolve immediately here, but you might want to add a note
      // to the user to check their integrations or add a small loading indicator.
      console.info("Opened in new tab. User will need to manually close it and verify integration.");
      return Promise.resolve(); // Or add more sophisticated polling if needed.
    }

    // Get auth URL after popup is created and confirmed open
    const { authUrl, state } = await this.getAuthUrl(platform);

    // Store state in localStorage for verification
    localStorage.setItem(`oauth_state_${platform}`, state);

    // Navigate the popup to the auth URL
    if (authWindow) {
      authWindow.location.href = authUrl;
    }

    return new Promise((resolve, reject) => {
      let checkClosedInterval: number | null = null;
      let timeoutId: number | null = null;

      const cleanup = () => {
        window.removeEventListener('message', messageHandler);
        if (checkClosedInterval !== null) {
          clearInterval(checkClosedInterval);
        }
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
        // Attempt to close the window if it's still open and we initiated it
        if (authWindow && !authWindow.closed) {
          try {
            authWindow.close();
          } catch (e) {
            console.warn("Could not close auth window:", e);
          }
        }
      };

      // Listen for messages from the OAuth callback
      const messageHandler = (event: MessageEvent) => {
        // Ensure the message is from a trusted origin, if possible (e.g., your own callback domain)
        // For simplicity, we'll assume the callback script sends the correct platform and type.
        if (event.data?.platform === platform && (event.data?.type === 'integration_success' || event.data?.type === 'integration_error')) {
          cleanup();
          if (event.data.type === 'integration_success') {
            resolve();
          } else {
            reject(new Error(event.data.error || 'OAuth flow failed'));
          }
        }
      };

      window.addEventListener('message', messageHandler);

      // --- Improved check for manual window closure ---
      // This will check if the user manually closes the popup before it redirects back
      // and sends a message. The key is to check authWindow.opener, which should still
      // refer to your window even after cross-origin navigation.
      checkClosedInterval = window.setInterval(() => {
        // authWindow.closed can be unreliable cross-origin.
        // A more reliable way is to check if the window still exists and its opener hasn't changed.
        if (!authWindow || authWindow.closed || !authWindow.opener) {
          // If the window is truly closed, or its opener reference is lost (implying closure/security block)
          cleanup();
          // Before rejecting, check if the integration was actually successful (e.g., user closed it *after* success)
          this.getSocialIntegrations()
            .then(integrations => {
              const newIntegration = integrations.find(i => i.platformName === platform);
              if (newIntegration) {
                resolve(); // Success: User closed window after successful integration
              } else {
                reject(new Error('OAuth flow was cancelled or failed by user.'));
              }
            })
            .catch(err => {
              console.error("Failed to verify OAuth completion on manual close:", err);
              reject(new Error('OAuth flow was cancelled or failed by user. (Verification failed)'));
            });
        }
      }, 1000);

      // Cleanup if window doesn't close within 5 minutes
      timeoutId = window.setTimeout(() => {
        if (authWindow && !authWindow.closed) { // Check if it's still open
          console.warn('OAuth flow timed out. Attempting to close popup.');
          cleanup(); // This will also close the window
          reject(new Error('OAuth flow timed out'));
        }
      }, 300000); // 5 minutes
    });
  }
}
