import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailSyncProvider, SyncedEmail } from '../interfaces/email-sync-provider.interface';
import { EmailSyncSettings } from '@nlc-ai/types';
import axios from 'axios';

@Injectable()
export class OutlookSyncService implements IEmailSyncProvider {
  private readonly logger = new Logger(OutlookSyncService.name);
  private readonly clientID: string;
  private readonly clientSecret: string;

  constructor(private configService: ConfigService) {
    this.clientID = this.configService.get<string>('config.oauth.microsoft.clientID')!;
    this.clientSecret = this.configService.get<string>('config.oauth.microsoft.clientSecret')!;
  }

  async authenticate(authCode: string, redirectURI: string) {
    try {
      const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

      const response = await axios.post(tokenUrl, new URLSearchParams({
        client_id: this.clientID,
        client_secret: this.clientSecret,
        code: authCode,
        redirect_uri: redirectURI,
        grant_type: 'authorization_code',
        scope: 'https://graph.microsoft.com/Mail.Read offline_access',
      }));

      const data = response.data;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      };
    } catch (error) {
      this.logger.error('Outlook authentication failed', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

      const response = await axios.post(tokenUrl, new URLSearchParams({
        client_id: this.clientID,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/Mail.Read',
      }));

      const data = response.data;

      return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      };
    } catch (error) {
      this.logger.error('Outlook token refresh failed', error);
      throw error;
    }
  }

  async syncEmails(
    accessToken: string,
    settings: EmailSyncSettings,
    lastSyncToken?: string
  ) {
    try {
      const graphUrl = 'https://graph.microsoft.com/v1.0/me/messages';

      const params: any = {
        $top: settings.maxEmailsPerSync || 100,
        $select: 'id,conversationId,subject,bodyPreview,body,sender,toRecipients,ccRecipients,receivedDateTime,sentDateTime,isRead,hasAttachments,attachments',
        $orderby: 'receivedDateTime desc',
      };

      if (lastSyncToken) {
        params.$skipToken = lastSyncToken;
      }

      // Build filter based on settings
      const filters = this.buildOutlookFilter(settings);
      if (filters) {
        params.$filter = filters;
      }

      const response = await axios.get(graphUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      });

      const messages = response.data.value || [];
      const emails: SyncedEmail[] = messages.map((msg: any) => this.transformOutlookMessage(msg));

      return {
        emails,
        nextSyncToken: response.data['@odata.nextLink'] ?
          new URL(response.data['@odata.nextLink']).searchParams.get('$skiptoken') : undefined,
        hasMore: !!response.data['@odata.nextLink'],
      };
    } catch (error) {
      this.logger.error('Outlook sync failed', error);
      throw error;
    }
  }

  async testConnection(accessToken: string): Promise<boolean> {
    try {
      await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return true;
    } catch (error) {
      this.logger.error('Outlook connection test failed', error);
      return false;
    }
  }

  async getUserInfo(accessToken: string) {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const user = response.data;

      return {
        email: user.mail || user.userPrincipalName,
        name: user.displayName || user.mail,
      };
    } catch (error) {
      this.logger.error('Failed to get Outlook user info', error);
      throw error;
    }
  }

  private buildOutlookFilter(settings: EmailSyncSettings): string | null {
    const conditions = [];

    if (settings.filterSettings?.dateRange?.start) {
      conditions.push(`receivedDateTime ge ${settings.filterSettings.dateRange.start}`);
    }

    if (settings.filterSettings?.dateRange?.end) {
      conditions.push(`receivedDateTime le ${settings.filterSettings.dateRange.end}`);
    }

    if (settings.filterSettings?.fromDomain?.length) {
      const domainConditions = settings.filterSettings.fromDomain
        .map(domain => `contains(sender/emailAddress/address,'${domain}')`)
        .join(' or ');
      conditions.push(`(${domainConditions})`);
    }

    return conditions.length > 0 ? conditions.join(' and ') : null;
  }

  private transformOutlookMessage(message: any): SyncedEmail {
    const attachments = message.attachments ? message.attachments.map((att: any) => ({
      filename: att.name,
      contentType: att.contentType,
      size: att.size || 0,
    })) : [];

    return {
      providerMessageID: message.id,
      threadID: message.conversationId,
      to: message.toRecipients?.map((r: any) => r.emailAddress.address).join(', ') || '',
      from: message.sender?.emailAddress?.address || '',
      subject: message.subject,
      text: message.bodyPreview,
      html: message.body?.content,
      attachments,
      sentAt: message.sentDateTime,
      receivedAt: message.receivedDateTime,
      isRead: message.isRead,
      folder: 'inbox', // Default folder
    };
  }
}
