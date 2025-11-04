import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {CacheService} from '@nlc-ai/api-caching';
import {EmailParticipantType, EmailThreadStatus, UpdateEmailThreadRequest, UserType} from "@nlc-ai/types";
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

export interface ThreadMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  sentAt: Date;
  isRead: boolean;
  messageID?: string; // Message-ID header for threading
  inReplyTo?: string; // In-Reply-To header
  references?: string; // References header
}

@Injectable()
export class ThreadsService {
  private readonly logger = new Logger(ThreadsService.name);
  private readonly oauth2Client;
  private readonly CACHE_TTL = {
    THREAD_MESSAGES: 300, // 5 minutes
    THREAD_LIST: 60, // 1 minute
    GENERATED_RESPONSES: 180, // 3 minutes
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly deliveryService: SendService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
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
        ...(clientID && { participantID: clientID }),
      },
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
    });
  }

  async getThread(userID: string, threadID: string) {
    const cacheKey = `threads:detail:${threadID}:${userID}`;

    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for thread: ${threadID}`);

      if (!cached.isRead) {
        await this.markThreadAsRead(threadID);
      }

      return cached;
    }

    const thread = await this.prisma.emailThread.findFirst({
      where: { id: threadID, userID },
      include: {
        emailAccount: true,
      },
    });

    if (!thread) {
      throw new BadRequestException('Thread not found');
    }

    let messages: ThreadMessage[] = [];
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
      await this.markThreadAsRead(threadID);
    }

    const result = {
      ...thread,
      messages,
    };

    await this.cacheService.set(
      cacheKey,
      result,
      {
        ttl: this.CACHE_TTL.THREAD_MESSAGES,
        tags: [`user:${userID}`, `thread:${threadID}`, 'threads:detail']
      }
    );

    this.logger.debug(`Cache set for thread: ${threadID}`);

    return result;
  }

  private async markThreadAsRead(threadID: string): Promise<void> {
    await this.prisma.emailThread.update({
      where: { id: threadID },
      data: { isRead: true },
    });
  }

  /**
   * Get generated AI responses for a thread
   */
  async getGeneratedResponses(userID: string, threadID: string) {
    const thread = await this.prisma.emailThread.findFirst({
      where: { id: threadID, userID },
    });

    if (!thread) {
      throw new BadRequestException('Thread not found');
    }

    return await this.prisma.generatedEmailResponse.findMany({
      where: {threadID},
      orderBy: {createdAt: 'desc'},
    });
  }

  private async fetchGmailThreadMessages(accessToken: string, threadID: string): Promise<ThreadMessage[]> {
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
          // CRITICAL: Extract threading headers
          messageID: getHeader('Message-ID'),
          inReplyTo: getHeader('In-Reply-To'),
          references: getHeader('References'),
        };
      }) || [];
    } catch (error: any) {
      this.logger.error('Failed to fetch Gmail thread messages', error);
      throw error;
    }
  }

  private async fetchOutlookThreadMessages(accessToken: string, conversationID: string): Promise<ThreadMessage[]> {
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
            $select: 'id,subject,bodyPreview,body,sender,toRecipients,sentDateTime,isRead,internetMessageId',
            $expand: 'singleValueExtendedProperties($filter=id eq \'String 0x1000\')',
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
        // CRITICAL: Extract threading headers for Outlook
        messageID: msg.internetMessageId,
        inReplyTo: undefined, // Outlook doesn't easily expose this
        references: undefined, // Outlook doesn't easily expose this
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
    let text: string | undefined;

    if (payload.mimeType === 'text/plain' && payload.body?.data) {
      text = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (!text && payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          text = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }
    }

    return text ? this.stripQuotedText(text) : undefined;
  }

  private extractHtmlFromPayload(payload: any): string | undefined {
    let html: string | undefined;

    if (payload.mimeType === 'text/html' && payload.body?.data) {
      html = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (!html && payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          html = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }
    }

    return html ? this.stripQuotedHtml(html) : undefined;
  }

  /**
   * Strip quoted text from plain text emails
   */
  private stripQuotedText(text: string): string {
    // Common quote indicators
    const quotePatterns = [
      /^On .+ wrote:$/m,                    // "On Mon, Jan 1, 2024 at 10:00 AM, someone wrote:"
      /^From: .+$/m,                         // "From: someone@example.com"
      /^_{10,}/m,                            // Underscores separator
      /^-{3,} ?Original Message ?-{3,}/mi,  // "--- Original Message ---"
      /^>{1,}.+$/m,                          // Lines starting with > or >>
      /^\d{4}-\d{2}-\d{2} .+ wrote:/m,      // "2024-01-01 10:00 AM someone wrote:"
    ];

    let cleanText = text;

    // Find the earliest occurrence of any quote pattern
    let earliestIndex = text.length;

    for (const pattern of quotePatterns) {
      const match = text.match(pattern);
      if (match && match.index !== undefined && match.index < earliestIndex) {
        earliestIndex = match.index;
      }
    }

    // If we found a quote indicator, cut off everything after it
    if (earliestIndex < text.length) {
      cleanText = text.substring(0, earliestIndex);
    }

    // Also check for consecutive lines starting with >
    const lines = cleanText.split('\n');
    const firstQuotedLine = lines.findIndex(line => line.trim().startsWith('>'));

    if (firstQuotedLine > 0) {
      cleanText = lines.slice(0, firstQuotedLine).join('\n');
    }

    return cleanText.trim();
  }

  /**
   * Strip quoted HTML from HTML emails
   */
  private stripQuotedHtml(html: string): string {
    // Gmail wraps quoted content in specific divs/classes
    const gmailQuotePatterns = [
      /<div class="gmail_quote">.+<\/div>/is,
      /<div class="gmail_extra">.+<\/div>/is,
      /<blockquote[^>]*class="gmail_quote"[^>]*>[\s\S]*<\/blockquote>/gi,
    ];

    // Outlook uses different patterns
    const outlookQuotePatterns = [
      /<div[^>]*id="divRplyFwdMsg"[^>]*>[\s\S]*<\/div>/gi,
      /<hr[^>]*style="[^"]*border[^"]*"[^>]*>[\s\S]*$/i,
      /<div[^>]*style="[^"]*border-top:[^"]*"[^>]*>[\s\S]*$/i,
    ];

    // Generic patterns
    const genericPatterns = [
      /<blockquote[^>]*>[\s\S]*<\/blockquote>/gi,
      /<div[^>]*class="[^"]*quoted[^"]*"[^>]*>[\s\S]*<\/div>/gi,
    ];

    let cleanHtml = html;

    // Try Gmail patterns first
    for (const pattern of gmailQuotePatterns) {
      cleanHtml = cleanHtml.replace(pattern, '');
    }

    // Try Outlook patterns
    for (const pattern of outlookQuotePatterns) {
      cleanHtml = cleanHtml.replace(pattern, '');
    }

    // Try generic patterns
    for (const pattern of genericPatterns) {
      cleanHtml = cleanHtml.replace(pattern, '');
    }

    // Look for common text indicators in HTML
    const textIndicators = [
      /On .+?wrote:/i,
      /From:.+?<br>/i,
      /_{10,}/,
      /-{3,}\s*Original Message\s*-{3,}/i,
    ];

    for (const pattern of textIndicators) {
      const match = cleanHtml.match(pattern);
      if (match && match.index !== undefined) {
        cleanHtml = cleanHtml.substring(0, match.index);
        break;
      }
    }

    return cleanHtml.trim();
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

    // CRITICAL: Fetch thread messages to get the latest message headers for threading
    let messages: ThreadMessage[] = [];
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
      this.logger.warn('Failed to fetch thread messages for reply headers, proceeding without threading', error);
    }

    // Get the last message for threading headers
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    // Build references header by combining existing references with the message we're replying to
    let referencesHeader: string | undefined;
    if (lastMessage?.messageID) {
      if (lastMessage.references) {
        // Append the current messageID to existing references
        referencesHeader = `${lastMessage.references} ${lastMessage.messageID}`.trim();
      } else if (lastMessage.inReplyTo) {
        // If no references but has inReplyTo, use both
        referencesHeader = `${lastMessage.inReplyTo} ${lastMessage.messageID}`.trim();
      } else {
        // Just use the current messageID
        referencesHeader = lastMessage.messageID;
      }
    }

    const clientEmail = await this.getClientEmail(
      thread.participantID,
      thread.participantType as EmailParticipantType
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
        // Store threading headers in metadata for the processor to use
        metadata: {
          inReplyTo: lastMessage?.messageID,
          references: referencesHeader,
        } as any,
      },
    });

    // Get coach name for display
    const coach = await this.prisma.coach.findUnique({
      where: { id: userID },
      select: { firstName: true, lastName: true }
    });

    const coachName = coach ? `${coach.firstName} ${coach.lastName}`.trim() : 'You';
    const preview = this.createMessagePreview(replyData.text || replyData.html || '');

    await this.prisma.emailThread.update({
      where: { id: threadID },
      data: {
        lastMessageAt: new Date(),
        lastMessageFrom: coachName,
        lastMessageFromEmail: thread.emailAccount.emailAddress,
        lastMessagePreview: preview,
        messageCount: { increment: 1 },
      },
    });

    await this.invalidateThreadCache(userID, threadID);

    await this.deliveryService.sendThreadReply(message.id);

    return {
      success: true,
      message: 'Reply queued for delivery',
      messageID: message.id,
      threadID,
    };
  }

  private createMessagePreview(content: string): string {
    // First strip any HTML tags
    const text = content.replace(/<[^>]*>/g, ' ');

    // Strip quoted content from preview
    const stripped = this.stripQuotedText(text);

    // Clean up whitespace
    const cleaned = stripped.replace(/\s+/g, ' ').trim();

    return cleaned.length > 500 ? cleaned.substring(0, 497) + '...' : cleaned;
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

    await this.invalidateThreadCache(userID, threadID);

    return { message: 'Thread updated successfully', thread: updatedThread };
  }

  private async invalidateThreadCache(userID: string, threadID: string): Promise<void> {
    try {
      await Promise.all([
        this.cacheService.delByTag(`user:${userID}`),
        this.cacheService.delByTag(`thread:${threadID}`),
        this.cacheService.delByPattern(`threads:list:${userID}:*`),
      ]);

      this.logger.debug(`Cache invalidated for user: ${userID}, thread: ${threadID}`);
    } catch (error) {
      this.logger.error('Failed to invalidate thread cache', error);
    }
  }

  private async getClientEmail(
    participantID: string | null,
    participantType: EmailParticipantType | null
  ) {
    let client;

    if (participantID) {
      if (participantType === EmailParticipantType.CLIENT) {
        client = await this.prisma.client.findUnique({
          where: { id: participantID }
        });
      } else if (participantType === EmailParticipantType.COACH) {
        client = await this.prisma.coach.findUnique({
          where: { id: participantID }
        });
      } else if (participantType === EmailParticipantType.LEAD) {
        client = await this.prisma.lead.findUnique({
          where: { id: participantID }
        });
      }
    }

    return client?.email || '';
  }
}
