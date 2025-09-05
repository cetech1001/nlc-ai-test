import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { ConfigService } from '@nestjs/config';
import {ClientEmailReceivedEvent, EmailSyncEvent} from '@nlc-ai/api-types';

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{ mimeType: string; body: { data?: string } }>;
    body?: { data?: string };
  };
  internalDate: string;
}

@Injectable()
export class EmailSyncService {
  private readonly logger = new Logger(EmailSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async autoSyncAllCoaches() {
    this.logger.log('Starting automatic email sync...');

    const coaches = await this.prisma.coach.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
      }
    });

    for (const coach of coaches) {
      try {
        await this.syncClientEmails(coach.id);
      } catch (error: any) {
        this.logger.error(`Failed to sync emails for coach ${coach.id}:`, error);
      }
    }
  }

  async syncClientEmails(coachID: string) {
    const emailAccounts = await this.prisma.emailAccount.findMany({
      where: {
        userID: coachID,
        provider: 'google',
        isActive: true,
        syncEnabled: true,
      }
    });

    if (emailAccounts.length === 0) {
      throw new BadRequestException('No active email accounts found');
    }

    let totalProcessed = 0;
    let clientEmailsFound = 0;
    const errors: string[] = [];

    for (const account of emailAccounts) {
      try {
        const result = await this.syncEmailsForAccount(coachID, account);
        totalProcessed += result.totalProcessed;
        clientEmailsFound += result.clientEmailsFound;
      } catch (error: any) {
        errors.push(`${account.emailAddress}: ${error.message}`);
      }
    }

    await this.prisma.emailAccount.updateMany({
      where: { userID: coachID, isActive: true },
      data: { lastSyncAt: new Date() }
    });

    await this.outbox.saveAndPublishEvent<EmailSyncEvent>(
      {
        eventType: 'email.sync.completed',
        schemaVersion: 1,
        payload: {
          coachID,
          totalProcessed,
          clientEmailsFound,
          syncedAt: new Date().toISOString(),
        },
      },
      'email.sync.completed'
    );

    return {
      totalProcessed,
      clientEmailsFound,
      errors,
      syncedAt: new Date(),
    };
  }

  private async syncEmailsForAccount(coachID: string, emailAccount: any) {
    const lastSync = emailAccount.lastSyncAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const emails = await this.fetchGmailMessages(emailAccount, lastSync);

    let clientEmailsFound = 0;

    for (const email of emails) {
      try {
        const processed = await this.processIncomingEmail(coachID, emailAccount, email);
        if (processed.isFromClient) {
          clientEmailsFound++;
        }
      } catch (error: any) {
        this.logger.error(`Error processing email ${email.id}:`, error);
      }
    }

    return { totalProcessed: emails.length, clientEmailsFound };
  }

  private async fetchGmailMessages(emailAccount: any, since: Date): Promise<GmailMessage[]> {
    const query = `after:${Math.floor(since.getTime() / 1000)} in:inbox`;
    let accessToken = emailAccount.accessToken;

    try {
      let listResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          }
        }
      );

      if (listResponse.status === 401) {
        const newToken = await this.refreshGmailAccessToken(emailAccount);
        if (newToken) {
          accessToken = newToken;
          listResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
            { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } }
          );
        }
      }

      if (!listResponse.ok) {
        throw new Error(`Gmail API error: ${listResponse.statusText}`);
      }

      const listData: any = await listResponse.json();
      const messageIds = listData.messages || [];

      const messages: GmailMessage[] = [];
      for (const messageRef of messageIds.slice(0, 20)) {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageRef.id}`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (messageResponse.ok) {
          messages.push(await messageResponse.json() as any);
        }
      }

      return messages;
    } catch (error: any) {
      this.logger.error('Error fetching Gmail messages:', error);
      return [];
    }
  }

  private async refreshGmailAccessToken(emailAccount: any): Promise<string | null> {
    const { refreshToken } = emailAccount;
    const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!refreshToken || !clientID || !clientSecret) return null;

    try {
      const params = new URLSearchParams({
        client_id: clientID,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (response.ok) {
        const data: any = await response.json();
        await this.prisma.emailAccount.update({
          where: { id: emailAccount.id },
          data: { accessToken: data.access_token },
        });
        return data.access_token;
      }
    } catch (error) {
      this.logger.error('Error refreshing Gmail token:', error);
    }

    return null;
  }

  private async processIncomingEmail(coachID: string, emailAccount: any, rawEmail: GmailMessage) {
    const emailData = this.parseGmailData(rawEmail);

    if (await this.isEmailFromCoach(emailData.senderEmail, coachID)) {
      return { isFromClient: false };
    }

    const client = await this.prisma.client.findFirst({
      where: {
        email: emailData.senderEmail,
        clientCoaches: {
          some: {
            coachID,
            status: 'active',
          }
        }
      }
    });

    if (!client) {
      return { isFromClient: false };
    }

    const thread = await this.findOrCreateEmailThread(
      coachID,
      client.id,
      emailAccount.id,
      emailData.threadID,
      emailData.subject
    );

    await this.createEmailMessage(thread.id, emailData);

    await this.outbox.saveAndPublishEvent<ClientEmailReceivedEvent>(
      {
        eventType: 'email.client.received',
        schemaVersion: 1,
        payload: {
          coachID,
          clientID: client.id,
          threadID: thread.id,
          emailID: emailData.messageID,
          subject: emailData.subject,
          receivedAt: new Date().toISOString(),
        },
      },
      'email.client.received'
    );

    return { isFromClient: true };
  }

  private parseGmailData(message: GmailMessage) {
    const headers = message.payload.headers;
    const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    let bodyText = '';
    if (message.payload.body?.data) {
      bodyText = Buffer.from(message.payload.body.data, 'base64').toString();
    } else if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          bodyText = Buffer.from(part.body.data, 'base64').toString();
          break;
        }
      }
    }

    return {
      messageID: message.id,
      threadID: message.threadId,
      senderEmail: getHeader('From').match(/<(.+)>/)?.[1] || getHeader('From'),
      senderName: getHeader('From').replace(/<.+>/, '').trim(),
      subject: getHeader('Subject'),
      bodyText: bodyText || message.snippet,
      sentAt: new Date(parseInt(message.internalDate)),
      receivedAt: new Date(),
    };
  }

  private async isEmailFromCoach(senderEmail: string, coachID: string): Promise<boolean> {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true }
    });

    const emailAccounts = await this.prisma.emailAccount.findMany({
      where: { userID: coachID },
      select: { emailAddress: true }
    });

    const coachEmails = [coach?.email, ...emailAccounts.map(acc => acc.emailAddress)];
    return coachEmails.includes(senderEmail);
  }

  private async findOrCreateEmailThread(
    coachID: string,
    clientID: string,
    emailAccountID: string,
    threadID: string,
    subject: string
  ) {
    let thread = await this.prisma.emailThread.findFirst({
      where: { coachID, clientID, threadID }
    });

    if (!thread) {
      thread = await this.prisma.emailThread.create({
        data: {
          coachID,
          clientID,
          emailAccountID,
          threadID,
          subject,
          status: 'active',
          isRead: false,
          priority: 'normal',
          messageCount: 0,
          lastMessageAt: new Date(),
        }
      });
    }

    return thread;
  }

  private async createEmailMessage(threadID: string, emailData: any) {
    const existing = await this.prisma.emailMessage.findFirst({
      where: { threadID, providerMessageID: emailData.messageID }
    });

    if (existing) return existing;

    return this.prisma.emailMessage.create({
      data: {
        threadID,
        providerMessageID: emailData.messageID,
        from: emailData.senderEmail,
        to: emailData.senderEmail,
        subject: emailData.subject,
        text: emailData.bodyText,
        sentAt: emailData.sentAt,
        receivedAt: emailData.receivedAt,
      }
    });
  }

  async getEmailThreads(coachID: string, limit: number = 20, status?: string) {
    return this.prisma.emailThread.findMany({
      where: {
        coachID,
        ...(status && { status })
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        _count: { select: { emailMessages: true } }
      },
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
    });
  }

  async getEmailThread(coachID: string, threadID: string) {
    return this.prisma.emailThread.findFirst({
      where: { id: threadID, coachID },
      include: {
        client: true,
        emailMessages: {
          orderBy: { sentAt: 'desc' },
          take: 20,
        }
      }
    });
  }

  async updateThreadStatus(coachID: string, threadID: string, updates: any) {
    return this.prisma.emailThread.update({
      where: { id: threadID },
      data: { ...updates, updatedAt: new Date() }
    });
  }

  async getSyncStats(coachID: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [unreadThreads, totalThreadsToday, lastSync] = await Promise.all([
      this.prisma.emailThread.count({
        where: { coachID, isRead: false }
      }),
      this.prisma.emailThread.count({
        where: { coachID, createdAt: { gte: today } }
      }),
      this.prisma.emailAccount.findFirst({
        where: { userID: coachID, isActive: true },
        select: { lastSyncAt: true },
        orderBy: { lastSyncAt: 'desc' }
      })
    ]);

    return {
      unreadThreads,
      totalThreadsToday,
      lastSyncAt: lastSync?.lastSyncAt,
    };
  }
}
