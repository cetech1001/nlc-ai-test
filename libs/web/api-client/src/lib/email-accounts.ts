import { BaseAPI } from './base';
import { EmailAccount } from '@nlc-ai/types';

export interface EmailAccountResponse extends Omit<EmailAccount, 'coach' | 'emailThreads'> {
  accessToken?: string | null;
  refreshToken?: string | null;
}

export interface EmailAuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface EmailTestResponse {
  success: boolean;
  message: string;
}

export interface EmailAccountStats {
  totalThreads: number;
  totalMessages: number;
  unreadThreads: number;
  lastSync: Date | null;
  syncEnabled: boolean;
}

class EmailAccountsAPI extends BaseAPI {
  /**
   * Get all email accounts for the authenticated coach
   */
  async getEmailAccounts(): Promise<EmailAccountResponse[]> {
    return this.makeRequest('/email-accounts');
  }

  /**
   * Get OAuth authorization URL for email provider
   */
  async getEmailAuthUrl(provider: string): Promise<EmailAuthUrlResponse> {
    return this.makeRequest(`/email-accounts/auth/${provider}/url`);
  }

  /**
   * Handle OAuth callback from email provider
   */
  async handleEmailOAuthCallback(
    provider: string,
    code: string,
    state?: string
  ): Promise<EmailAccountResponse> {
    return this.makeRequest(`/email-accounts/auth/${provider}/callback`, {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  /**
   * Set email account as primary
   */
  async setPrimaryEmailAccount(accountID: string): Promise<EmailTestResponse> {
    return this.makeRequest(`/email-accounts/${accountID}/set-primary`, {
      method: 'POST',
    });
  }

  /**
   * Manually sync email account
   */
  async syncEmailAccount(accountID: string): Promise<EmailTestResponse> {
    return this.makeRequest(`/email-accounts/${accountID}/sync`, {
      method: 'POST',
    });
  }

  /**
   * Test email account connection
   */
  async testEmailAccount(accountID: string): Promise<EmailTestResponse> {
    return this.makeRequest(`/email-accounts/${accountID}/test`, {
      method: 'POST',
    });
  }

  /**
   * Disconnect email account
   */
  async disconnectEmailAccount(accountID: string): Promise<EmailTestResponse> {
    return this.makeRequest(`/email-accounts/${accountID}`, {
      method: 'DELETE',
    });
  }

  /**
   * Toggle email account sync
   */
  async toggleEmailAccountSync(
    accountID: string,
    syncEnabled: boolean
  ): Promise<EmailTestResponse> {
    return this.makeRequest(`/email-accounts/${accountID}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ syncEnabled }),
    });
  }

  /**
   * Get email account statistics
   */
  async getEmailAccountStats(
    accountID: string,
    days: number = 30
  ): Promise<EmailAccountStats> {
    return this.makeRequest(`/email-accounts/${accountID}/stats?days=${days}`);
  }

  /**
   * Helper method to initiate OAuth flow for email providers
   */
  async initiateEmailOAuthFlow(provider: string): Promise<void> {
    try {
      const { authUrl, state } = await this.getEmailAuthUrl(provider);

      // Store state in localStorage for verification
      if (typeof window !== 'undefined') {
        localStorage.setItem(`email_oauth_state_${provider}`, state);
      }

      // Open OAuth window
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const authWindow = window.open(
        authUrl,
        `${provider}_email_oauth`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            // Check if OAuth was successful by looking for a new email account
            this.getEmailAccounts()
              .then(accounts => {
                const newAccount = accounts.find(account => account.provider === provider);
                if (newAccount) {
                  resolve();
                } else {
                  reject(new Error('Email OAuth flow was cancelled or failed'));
                }
              })
              .catch(() => reject(new Error('Failed to verify email OAuth completion')));
          }
        }, 1000);

        // Cleanup if window doesn't close within 5 minutes
        setTimeout(() => {
          if (!authWindow?.closed) {
            authWindow?.close();
            clearInterval(checkClosed);
            reject(new Error('Email OAuth flow timed out'));
          }
        }, 300000);
      });
    } catch (error) {
      throw new Error(`Failed to initiate email OAuth flow: ${error}`);
    }
  }

  /**
   * Helper method to get primary email account
   */
  async getPrimaryEmailAccount(): Promise<EmailAccountResponse | null> {
    const accounts = await this.getEmailAccounts();
    return accounts.find(account => account.isPrimary) || null;
  }

  /**
   * Helper method to check if email provider is connected
   */
  async isEmailProviderConnected(provider: string): Promise<boolean> {
    const accounts = await this.getEmailAccounts();
    return accounts.some(account => account.provider === provider && account.isActive);
  }

  /**
   * Helper method to get connected email providers
   */
  async getConnectedEmailProviders(): Promise<string[]> {
    const accounts = await this.getEmailAccounts();
    return accounts
      .filter(account => account.isActive)
      .map(account => account.provider);
  }

  /**
   * Helper method to get an email account by provider
   */
  async getEmailAccountByProvider(provider: string): Promise<EmailAccountResponse | null> {
    const accounts = await this.getEmailAccounts();
    return accounts.find(account => account.provider === provider && account.isActive) || null;
  }
}

export const emailAccountsAPI = new EmailAccountsAPI();
