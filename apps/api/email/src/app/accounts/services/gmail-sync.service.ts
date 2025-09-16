import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { IEmailSyncProvider, SyncedEmail } from '../interfaces/email-sync-provider.interface';
import { EmailSyncSettings } from '@nlc-ai/types';

@Injectable()
export class GmailSyncService implements IEmailSyncProvider {
  private readonly logger = new Logger(GmailSyncService.name);
  private readonly oauth2Client;

  constructor(private configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('email.oauth.google.clientID'),
      this.configService.get<string>('email.oauth.google.clientSecret'),
      this.configService.get<string>('email.oauth.google.redirectUri')
    );
  }

  async authenticate(authCode: string, redirectURI: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(authCode);

      if (!tokens.access_token) {
        throw 'Authentication Failed';
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : undefined,
      };
    } catch (error) {
      this.logger.error('Gmail authentication failed', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw 'Authentication Failed';
      }

      return {
        accessToken: credentials.access_token,
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : undefined,
      };
    } catch (error) {
      this.logger.error('Gmail token refresh failed', error);
      throw error;
    }
  }

  async syncEmails(
    accessToken: string,
    settings: EmailSyncSettings,
    lastSyncToken?: string
  ) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      // Build query based on sync settings
      let query = this.buildGmailQuery(settings);

      const listParams: any = {
        userId: 'me',
        maxResults: settings.maxEmailsPerSync || 100,
        q: query,
      };

      if (lastSyncToken) {
        listParams.pageToken = lastSyncToken;
      }

      const response = await gmail.users.messages.list(listParams);
      const messages = response.data.messages || [];

      const emails: SyncedEmail[] = [];

      // Fetch detailed message data in batches
      for (const message of messages) {
        try {
          const messageDetail = await gmail.users.messages.get({
            userId: 'me',
            id: message.id || undefined,
            format: 'full',
          });

          const syncedEmail = this.transformGmailMessage(messageDetail.data);
          if (syncedEmail) {
            emails.push(syncedEmail);
          }
        } catch (error) {
          this.logger.warn(`Failed to fetch Gmail message ${message.id}`, error);
        }
      }

      return {
        emails,
        nextSyncToken: response.data.nextPageToken,
        hasMore: !!response.data.nextPageToken,
      };
    } catch (error) {
      this.logger.error('Gmail sync failed', error);
      throw error;
    }
  }

  async testConnection(accessToken: string): Promise<boolean> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      await gmail.users.getProfile({ userId: 'me' });
      return true;
    } catch (error) {
      this.logger.error('Gmail connection test failed', error);
      return false;
    }
  }

  async getUserInfo(accessToken: string) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const profile = await gmail.users.getProfile({ userId: 'me' });

      return {
        email: profile.data.emailAddress!,
        name: profile.data.emailAddress!, // Gmail doesn't provide name in profile
      };
    } catch (error) {
      this.logger.error('Failed to get Gmail user info', error);
      throw error;
    }
  }

  private buildGmailQuery(settings: EmailSyncSettings): string {
    const conditions = [];

    if (settings.filterSettings?.fromDomain?.length) {
      const domainConditions = settings.filterSettings.fromDomain
        .map(domain => `from:${domain}`)
        .join(' OR ');
      conditions.push(`(${domainConditions})`);
    }

    if (settings.filterSettings?.keywords?.length) {
      const keywordConditions = settings.filterSettings.keywords
        .map(keyword => `"${keyword}"`)
        .join(' OR ');
      conditions.push(`(${keywordConditions})`);
    }

    if (settings.filterSettings?.dateRange?.start) {
      conditions.push(`after:${settings.filterSettings.dateRange.start}`);
    }

    if (settings.filterSettings?.dateRange?.end) {
      conditions.push(`before:${settings.filterSettings.dateRange.end}`);
    }

    if (settings.filterSettings?.excludeSpam) {
      conditions.push('-in:spam');
    }

    if (settings.filterSettings?.excludePromotional) {
      conditions.push('-category:promotions');
    }

    return conditions.join(' ');
  }

  private transformGmailMessage(message: any): SyncedEmail | null {
    try {
      const headers = message.payload?.headers || [];
      const getHeader = (name: string) => {
        return headers
          .find((h: any) =>
            h.name.toLowerCase() === name.toLowerCase())?.value;
      }

      const attachments = [];
      if (message.payload?.parts) {
        for (const part of message.payload.parts) {
          if (part.filename && part.body?.attachmentId) {
            attachments.push({
              filename: part.filename,
              contentType: part.mimeType,
              size: part.body.size || 0,
            });
          }
        }
      }

      return {
        providerMessageID: message.id,
        threadID: message.threadId,
        to: getHeader('To') || '',
        from: getHeader('From') || '',
        subject: getHeader('Subject'),
        text: this.extractTextFromPayload(message.payload),
        html: this.extractHtmlFromPayload(message.payload),
        attachments,
        sentAt: new Date(parseInt(message.internalDate)).toISOString(),
        receivedAt: new Date(parseInt(message.internalDate)).toISOString(),
        isRead: !message.labelIds?.includes('UNREAD'),
        labels: message.labelIds || [],
      };
    } catch (error) {
      this.logger.warn('Failed to transform Gmail message', error);
      return null;
    }
  }

  private extractTextFromPayload(payload: any): string | undefined {
    if (payload.mimeType === 'text/plain' && payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }

    return undefined;
  }

  private extractHtmlFromPayload(payload: any): string | undefined {
    if (payload.mimeType === 'text/html' && payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }

    return undefined;
  }
}
