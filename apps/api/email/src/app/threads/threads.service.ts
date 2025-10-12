import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {EmailThreadParticipantType, EmailThreadStatus, UpdateEmailThreadRequest, UserType} from "@nlc-ai/types";
import {SendService} from "../send/send.service";
import {google} from 'googleapis';
import {ConfigService} from '@nestjs/config';
import axios from 'axios';

interface ThreadFilters {
  limit?: number;
  status?: EmailThreadStatus;
  isRead?: boolean;
  clientID?: string;
}

@Injectable()
export class ThreadsService {
  private readonly logger = new Logger(ThreadsService.name);
  private readonly oauth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly deliveryService: SendService,
    private readonly configService: ConfigService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('email.oauth.google.clientID'),
      this.configService.get<string>('email.oauth.google.clientSecret'),
      this.configService.get<string>('email.oauth.google.redirectUri')
    );
  }

  async getThreads(userID: string, filters: ThreadFilters = {}) {
    const { limit = 20, status, isRead, clientID } = filters;

    return this.prisma.emailThread.findMany({
      where: {
        userID,
        ...(status && { status }),
        ...(isRead !== undefined && { isRead }),
        ...(clientID && { clientID }),
      },
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
    });
  }

  async getThread(userID: string, threadID: string) {
    const thread = await this.prisma.emailThread.findFirst({
      where: { id: threadID, userID },
      include: {
        emailAccount: true,
      },
    });

    if (!thread) {
      throw new BadRequestException('Thread not found');
    }

    let messages = [];
    try {
      if (thread.emailAccount.provider === 'gmail') {
        messages = await this.fetchGmailThreadMessages(
          thread.emailAccount.accessToken || '',
          thread.threadID
        );
      } else if (thread.emailAccount.provider === 'outlook') {
        messages = await this.fetchOutlookThreadMessages(
          thread.emailAccount.accessToken || '',
          thread.threadID
        );
      }
    } catch (error: any) {
      this.logger.error(`Failed to fetch thread messages from provider:`, error);
      throw new BadRequestException('Failed to fetch thread messages from email provider');
    }

    if (!thread.isRead) {
      await this.prisma.emailThread.update({
        where: { id: threadID },
        data: { isRead: true },
      });
    }

    return {
      ...thread,
      messages,
    };
  }

  private async fetchGmailThreadMessages(accessToken: string, threadID: string) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const thread = await gmail.users.threads.get({
        userId: 'me',
        id: threadID,
        format: 'full',
      });

      return thread.data.messages?.map((msg: any) => {
        const headers = msg.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value;

        return {
          id: msg.id,
          from: this.extractEmailFromHeader(getHeader('From') || ''),
          to: getHeader('To'),
          subject: getHeader('Subject'),
          text: this.extractTextFromPayload(msg.payload),
          html: this.extractHtmlFromPayload(msg.payload),
          sentAt: new Date(parseInt(msg.internalDate)),
          isRead: !msg.labelIds?.includes('UNREAD'),
        };
      }) || [];
    } catch (error: any) {
      this.logger.error('Failed to fetch Gmail thread messages', error);
      throw error;
    }
  }

  private async fetchOutlookThreadMessages(accessToken: string, conversationID: string) {
    try {
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/me/messages`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            $filter: `conversationId eq '${conversationID}'`,
            $orderby: 'sentDateTime asc',
            $select: 'id,subject,bodyPreview,body,sender,toRecipients,sentDateTime,isRead',
          },
        }
      );

      return response.data.value?.map((msg: any) => ({
        id: msg.id,
        from: msg.sender?.emailAddress?.address || '',
        to: msg.toRecipients?.map((r: any) => r.emailAddress.address).join(', ') || '',
        subject: msg.subject,
        text: msg.bodyPreview,
        html: msg.body?.content,
        sentAt: new Date(msg.sentDateTime),
        isRead: msg.isRead,
      })) || [];
    } catch (error: any) {
      this.logger.error('Failed to fetch Outlook thread messages', error);
      throw error;
    }
  }

  private extractEmailFromHeader(header: string): string {
    if (!header) return '';
    const emailMatch = header.match(/<(.+?)>/);
    return emailMatch ? emailMatch[1] : header.trim();
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

  async replyToThread(userID: string, userType: UserType, threadID: string, replyData: {
    text?: string;
    html?: string;
    subject?: string;
  }) {
    const thread = await this.prisma.emailThread.findFirst({
      where: { id: threadID, userID },
      include: { emailAccount: true },
    });

    if (!thread) {
      throw new BadRequestException('Thread not found');
    }

    const clientEmail = await this.getClientEmail(
      thread.participantID,
      thread.participantType as EmailThreadParticipantType
    );

    const message = await this.prisma.emailMessage.create({
      data: {
        emailThreadID: threadID,
        from: thread.emailAccount.emailAddress,
        to: clientEmail,
        subject: replyData.subject || `Re: ${thread.subject}`,
        text: replyData.text,
        html: replyData.html,
        status: 'pending',
        sentAt: new Date(),
        userID,
        userType,
      },
    });

    await this.prisma.emailThread.update({
      where: { id: threadID },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
      },
    });

    await this.deliveryService.sendThreadReply(message.id);

    return {
      message: 'Reply queued for delivery',
      messageID: message.id,
      threadID,
    };
  }

  async updateThread(userID: string, threadID: string, updates: UpdateEmailThreadRequest) {
    const thread = await this.prisma.emailThread.findFirst({
      where: { id: threadID, userID },
    });

    if (!thread) {
      throw new BadRequestException('Thread not found');
    }

    const updatedThread = await this.prisma.emailThread.update({
      where: { id: threadID },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    return { message: 'Thread updated successfully', thread: updatedThread };
  }

  private async getClientEmail(
    participantID: string | null,
    participantType: EmailThreadParticipantType | null
  ) {
    let client;

    if (participantID) {
      if (participantType === EmailThreadParticipantType.CLIENT) {
        client = await this.prisma.client.findUnique({
          where: { id: participantID }
        });
      } else if (participantType === EmailThreadParticipantType.COACH) {
        client = await this.prisma.coach.findUnique({
          where: { id: participantID }
        });
      } else if (participantType === EmailThreadParticipantType.LEAD) {
        client = await this.prisma.lead.findUnique({
          where: { id: participantID }
        });
      }
    }

    return client?.email || '';
  }
}
