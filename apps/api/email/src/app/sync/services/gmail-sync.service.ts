import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import {EmailSyncSettings, IEmailSyncProvider, SyncedEmail} from '@nlc-ai/types';

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
        refreshToken: credentials.refresh_token,
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : undefined,
      };
    } catch (error) {
      this.logger.error('Gmail token refresh failed', error);
      throw error;
    }
  }

  async syncEmails(
    accessToken: string,
    settings?: EmailSyncSettings,
    lastSyncToken?: string,
  ) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      // Try to use History API for incremental sync if we have a historyID
      if (lastSyncToken && this.isHistoryID(lastSyncToken)) {
        this.logger.log(`Using Gmail History API for incremental sync from historyID: ${lastSyncToken}`);
        return await this.syncUsingHistoryAPI(gmail, lastSyncToken, settings);
      }

      // Fall back to full sync using messages.list
      return await this.syncUsingMessagesList(gmail, settings, lastSyncToken);
    } catch (error: any) {
      this.logger.error('Gmail sync failed', error);

      // If history API fails (e.g., historyID too old), fall back to full sync
      if (error.code === 404 || error.message?.includes('historyId')) {
        this.logger.warn('History API failed, falling back to full sync');
        this.oauth2Client.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        return await this.syncUsingMessagesList(gmail, settings);
      }

      throw error;
    }
  }

  private async syncUsingHistoryAPI(
    gmail: any,
    startHistoryID: string,
    settings?: EmailSyncSettings
  ) {
    const emails: SyncedEmail[] = [];
    let historyID = startHistoryID;
    let hasMore = true;
    let pageToken: string | undefined;

    while (hasMore) {
      const historyParams: any = {
        userId: 'me',
        startHistoryId: historyID,
        historyTypes: ['messageAdded'],
        maxResults: 100,
      };

      if (pageToken) {
        historyParams.pageToken = pageToken;
      }

      const historyResponse = await gmail.users.history.list(historyParams);

      if (historyResponse.data.history) {
        for (const record of historyResponse.data.history) {
          if (record.messagesAdded) {
            for (const addedMessage of record.messagesAdded) {
              try {
                const messageDetail = await gmail.users.messages.get({
                  userId: 'me',
                  id: addedMessage.message.id,
                  format: 'full',
                });

                const syncedEmail = this.transformGmailMessage(messageDetail.data);
                if (syncedEmail && this.matchesSettings(syncedEmail, settings)) {
                  emails.push(syncedEmail);
                }
              } catch (error) {
                this.logger.warn(`Failed to fetch message ${addedMessage.message.id}`, error);
              }
            }
          }
        }
      }

      // Update historyID to the latest
      if (historyResponse.data.historyId) {
        historyID = historyResponse.data.historyId;
      }

      pageToken = historyResponse.data.nextPageToken;
      hasMore = !!pageToken;
    }

    this.logger.log(`History API sync completed: ${emails.length} new emails, latest historyID: ${historyID}`);

    return {
      emails,
      nextSyncToken: historyID, // Return the latest historyID for next sync
      hasMore: false,
    };
  }

  private async syncUsingMessagesList(
    gmail: any,
    settings?: EmailSyncSettings,
    lastSyncToken?: string
  ) {
    let query = this.buildGmailQuery(settings);

    // Only add date filter if lastSyncToken is a date and it's recent (within 30 days)
    if (lastSyncToken && !this.isHistoryID(lastSyncToken)) {
      const syncDate = this.parseLastSyncToken(lastSyncToken);
      if (syncDate) {
        const dateObj = this.parseDateString(syncDate);
        const daysSinceSync = dateObj ? (Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24) : 999;

        // Only use date filter if sync was recent (within 30 days)
        if (daysSinceSync <= 30) {
          query += ` after:${syncDate}`;
          this.logger.log(`Using date filter for recent sync: after:${syncDate}`);
        } else {
          this.logger.log(`Last sync was ${Math.floor(daysSinceSync)} days ago, performing full sync`);
        }
      }
    }

    const listParams: any = {
      userId: 'me',
      maxResults: settings?.maxEmailsPerSync || 100,
      q: query || undefined,
    };

    this.logger.log(`Gmail messages.list request:`, {
      query: listParams.q,
      maxResults: listParams.maxResults,
    });

    const response = await gmail.users.messages.list(listParams);
    const messages = response.data.messages || [];

    this.logger.log(`Found ${messages.length} messages to process`);

    const emails: SyncedEmail[] = [];

    // Fetch detailed message data
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

    // Get the latest historyID for next incremental sync
    let latestHistoryID: string | undefined;
    if (emails.length > 0 && messages[0]?.id) {
      try {
        const latestMessage = await gmail.users.messages.get({
          userId: 'me',
          id: messages[0].id,
          format: 'minimal',
        });
        latestHistoryID = latestMessage.data.historyId;
        this.logger.log(`Latest historyID for next sync: ${latestHistoryID}`);
      } catch (error) {
        this.logger.warn('Failed to get latest historyID', error);
      }
    }

    return {
      emails,
      nextSyncToken: latestHistoryID || response.data.nextPageToken,
      hasMore: !!response.data.nextPageToken,
    };
  }

  private matchesSettings(email: SyncedEmail, settings?: EmailSyncSettings): boolean {
    if (!settings?.filterSettings) return true;

    // Check domain filter
    if (settings.filterSettings.fromDomain?.length) {
      const emailDomain = email.from.split('@')[1];
      if (!settings.filterSettings.fromDomain.some(domain => emailDomain?.includes(domain))) {
        return false;
      }
    }

    // Check keyword filter
    if (settings.filterSettings.keywords?.length) {
      const content = `${email.subject} ${email.text} ${email.html}`.toLowerCase();
      if (!settings.filterSettings.keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
        return false;
      }
    }

    return true;
  }

  private isHistoryID(token: string): boolean {
    // Gmail historyIDs are numeric strings
    return /^\d+$/.test(token) && token.length >= 5;
  }

  private parseDateString(dateStr: string): Date | null {
    try {
      // Parse YYYY/MM/DD format
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
      return null;
    } catch {
      return null;
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
        name: profile.data.emailAddress!,
      };
    } catch (error) {
      this.logger.error('Failed to get Gmail user info', error);
      throw error;
    }
  }

  private buildGmailQuery(settings?: EmailSyncSettings): string {
    const conditions = [];

    if (settings?.filterSettings?.fromDomain?.length) {
      const domainConditions = settings?.filterSettings.fromDomain
        .map(domain => `from:${domain}`)
        .join(' OR ');
      conditions.push(`(${domainConditions})`);
    }

    if (settings?.filterSettings?.keywords?.length) {
      const keywordConditions = settings?.filterSettings.keywords
        .map(keyword => `"${keyword}"`)
        .join(' OR ');
      conditions.push(`(${keywordConditions})`);
    }

    if (settings?.filterSettings?.dateRange?.start) {
      conditions.push(`after:${settings?.filterSettings.dateRange.start}`);
    }

    if (settings?.filterSettings?.dateRange?.end) {
      conditions.push(`before:${settings?.filterSettings.dateRange.end}`);
    }

    if (settings?.filterSettings?.excludeSpam) {
      conditions.push('-in:spam');
    }

    if (settings?.filterSettings?.excludePromotional) {
      conditions.push('-category:promotions');
    }

    return conditions.join(' ');
  }

  private parseLastSyncToken(token: string): string | null {
    try {
      let date: Date;

      if (token.includes('T') || token.includes('-')) {
        date = new Date(token);
      } else if (/^\d{13}$/.test(token)) {
        date = new Date(parseInt(token));
      } else if (/^\d{10}$/.test(token)) {
        date = new Date(parseInt(token) * 1000);
      } else {
        return null;
      }

      if (isNaN(date.getTime())) {
        return null;
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}/${month}/${day}`;
    } catch {
      return null;
    }
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
        from: this.extractEmailFromHeader(getHeader('From') || ''),
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

  private extractEmailFromHeader(header: string): string {
    if (!header) return '';

    const emailMatch = header.match(/<(.+?)>/);
    if (emailMatch) {
      return emailMatch[1];
    }

    return header.trim();
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
