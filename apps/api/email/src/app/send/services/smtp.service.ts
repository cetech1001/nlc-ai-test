import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import axios from 'axios';
import { PrismaService } from '@nlc-ai/api-database';
import {EmailAccount, EmailAccountProvider} from "@nlc-ai/types";

@Injectable()
export class SmtpService {
  private readonly logger = new Logger(SmtpService.name);
  private readonly oauth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('email.oauth.google.clientID'),
      this.configService.get<string>('email.oauth.google.clientSecret'),
      this.configService.get<string>('email.oauth.google.redirectUri')
    );
  }

  async sendViaCoachAccount(params: {
    accountID: string;
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    threadID?: string;
    inReplyTo?: string;
    references?: string;
  }): Promise<{ success: boolean; messageID?: string; error?: string }> {
    const account = await this.prisma.emailAccount.findUnique({
      where: { id: params.accountID },
    });

    if (!account) {
      throw new Error('Email account not found');
    }

    if (this.isTokenExpired(account.tokenExpiresAt)) {
      await this.refreshAccountToken(account.id, account.refreshToken!);
      const refreshedAccount = await this.prisma.emailAccount.findUnique({
        where: { id: params.accountID },
      });
      if (!refreshedAccount) {
        throw new Error('Failed to reload account after token refresh');
      }
      return this.sendEmail(refreshedAccount, params);
    }

    return this.sendEmail(account, params);
  }

  private async sendEmail(account: EmailAccount, params: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    threadID?: string;
    inReplyTo?: string;
    references?: string;
  }): Promise<{ success: boolean; messageID?: string; error?: string }> {
    try {
      if (account.provider === EmailAccountProvider.GMAIL) {
        return await this.sendViaGmail(account, params);
      } else if (account.provider === EmailAccountProvider.OUTLOOK) {
        return await this.sendViaOutlook(account, params);
      } else {
        throw new Error(`Unsupported provider: ${account.provider}`);
      }
    } catch (error: any) {
      this.logger.error('Failed to send email via coach account:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async sendViaGmail(account: EmailAccount, params: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    threadID?: string;
    inReplyTo?: string;
    references?: string;
  }): Promise<{ success: boolean; messageID?: string; error?: string }> {
    this.oauth2Client.setCredentials({ access_token: account.accessToken });
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const toAddresses = Array.isArray(params.to) ? params.to.join(', ') : params.to;

    const messageParts = [
      `From: ${account.emailAddress}`,
      `To: ${toAddresses}`,
      `Subject: ${params.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
    ];

    if (params.inReplyTo) {
      messageParts.push(`In-Reply-To: ${params.inReplyTo}`);
    }
    if (params.references) {
      messageParts.push(`References: ${params.references}`);
    }

    messageParts.push('');
    messageParts.push(params.html || params.text || '');

    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const sendParams: any = {
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    };

    if (params.threadID) {
      sendParams.requestBody.threadId = params.threadID;
    }

    const result = await gmail.users.messages.send(sendParams);

    return {
      success: true,
      messageID: result.data.id!,
    };
  }

  private async sendViaOutlook(account: EmailAccount, params: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    threadID?: string;
  }): Promise<{ success: boolean; messageID?: string; error?: string }> {
    const toRecipients = (Array.isArray(params.to) ? params.to : [params.to]).map(email => ({
      emailAddress: { address: email }
    }));

    const message = {
      subject: params.subject,
      body: {
        contentType: params.html ? 'HTML' : 'Text',
        content: params.html || params.text || '',
      },
      toRecipients,
    };

    let response;

    if (params.threadID) {
      const conversationMessages = await axios.get(
        `https://graph.microsoft.com/v1.0/me/messages`,
        {
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
          },
          params: {
            $filter: `conversationId eq '${params.threadID}'`,
            $orderby: 'receivedDateTime desc',
            $top: 1,
          },
        }
      );

      const lastMessageID = conversationMessages.data.value[0]?.id;

      if (lastMessageID) {
        response = await axios.post(
          `https://graph.microsoft.com/v1.0/me/messages/${lastMessageID}/reply`,
          {
            comment: params.html || params.text || '',
          },
          {
            headers: {
              Authorization: `Bearer ${account.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        response = await axios.post(
          'https://graph.microsoft.com/v1.0/me/sendMail',
          { message },
          {
            headers: {
              Authorization: `Bearer ${account.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    } else {
      response = await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        { message },
        {
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return {
      success: true,
      messageID: response.data?.id || 'sent',
    };
  }

  private async refreshOutlookToken(accountID: string, refreshToken: string): Promise<void> {
    try {
      const clientID = this.configService.get<string>('email.oauth.microsoft.clientID')!;
      const clientSecret = this.configService.get<string>('email.oauth.microsoft.clientSecret')!;

      const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

      const response = await axios.post(
        tokenUrl,
        new URLSearchParams({
          client_id: clientID,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
          scope: 'https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send offline_access',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const data = response.data;

      await this.prisma.emailAccount.update({
        where: { id: accountID },
        data: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || refreshToken,
          tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to refresh Outlook token for account ${accountID}:`, error);

      await this.prisma.emailAccount.update({
        where: { id: accountID },
        data: {
          syncEnabled: false,
          accessToken: null,
        },
      });

      throw new Error('Token refresh failed. Please reconnect your email account.');
    }
  }

  private isTokenExpired(tokenExpiresAt?: Date | null): boolean {
    if (!tokenExpiresAt) return true;

    const now = new Date();
    const expiryTime = new Date(tokenExpiresAt);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    return expiryTime <= fiveMinutesFromNow;
  }

  private async refreshAccountToken(accountID: string, refreshToken: string): Promise<void> {
    const account = await this.prisma.emailAccount.findUnique({
      where: { id: accountID },
      select: { provider: true },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    if (account.provider === EmailAccountProvider.GMAIL) {
      await this.refreshGmailToken(accountID, refreshToken);
    } else if (account.provider === EmailAccountProvider.OUTLOOK) {
      await this.refreshOutlookToken(accountID, refreshToken);
    } else {
      throw new Error(`Unsupported provider: ${account.provider}`);
    }
  }

  private async refreshGmailToken(accountID: string, refreshToken: string): Promise<void> {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      await this.prisma.emailAccount.update({
        where: { id: accountID },
        data: {
          accessToken: credentials.access_token!,
          refreshToken: credentials.refresh_token || refreshToken,
          tokenExpiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to refresh Gmail token for account ${accountID}:`, error);

      await this.prisma.emailAccount.update({
        where: { id: accountID },
        data: {
          syncEnabled: false,
          accessToken: null,
        },
      });

      throw new Error('Token refresh failed. Please reconnect your email account.');
    }
  }
}
