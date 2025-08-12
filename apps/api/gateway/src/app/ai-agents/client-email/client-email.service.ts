import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CoachReplicaService } from '../coach-replica/coach-replica.service';
import { EmailDeliverabilityService } from '../email-deliverability/email-deliverability.service';
import { EmailService } from '../../email/email.service';
import {
  ClientEmailResponse,
  ClientEmailSyncResult,
  EmailThread,
  EmailMessage,
  CoachReplicaRequest,
  AnalyzeEmailRequest
} from '@nlc-ai/types';

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{
      mimeType: string;
      body: { data?: string };
    }>;
    body?: { data?: string };
  };
  internalDate: string;
}

@Injectable()
export class ClientEmailService {
  private readonly logger = new Logger(ClientEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly coachReplicaService: CoachReplicaService,
    private readonly emailDeliverabilityService: EmailDeliverabilityService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Automatically sync emails every 10 minutes
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async autoSyncAllCoaches() {
    this.logger.log('Starting automatic email sync for all coaches...');

    try {
      const coaches = await this.prisma.coach.findMany({
        where: {
          isActive: true,
          emailAccounts: {
            some: {
              isActive: true,
              syncEnabled: true,
            }
          }
        },
        include: {
          emailAccounts: {
            where: {
              isActive: true,
              syncEnabled: true,
            }
          }
        }
      });

      for (const coach of coaches) {
        try {
          await this.syncClientEmails(coach.id);
        } catch (error: any) {
          this.logger.error(`Failed to sync emails for coach ${coach.id}:`, error);
        }
      }

      this.logger.log(`Completed auto-sync for ${coaches.length} coaches`);
    } catch (error) {
      this.logger.error('Error in autoSyncAllCoaches:', error);
    }
  }

  /**
   * Manually sync emails for a specific coach
   */
  async syncClientEmails(coachID: string): Promise<ClientEmailSyncResult> {
    this.logger.log(`Syncing client emails for coach ${coachID}`);

    const emailAccounts = await this.prisma.emailAccount.findMany({
      where: {
        coachID,
        provider: 'google',
        isActive: true,
        syncEnabled: true,
      }
    });

    if (emailAccounts.length === 0) {
      throw new BadRequestException('No active email accounts found for syncing');
    }

    let totalProcessed = 0;
    let clientEmailsFound = 0;
    let responsesGenerated = 0;
    const errors: string[] = [];

    for (const account of emailAccounts) {
      try {
        const result = await this.syncEmailsForAccount(coachID, account);
        totalProcessed += result.totalProcessed;
        clientEmailsFound += result.clientEmailsFound;
        responsesGenerated += result.responsesGenerated;
      } catch (error: any) {
        errors.push(`${account.emailAddress}: ${error.message}`);
      }
    }

    // Update last sync time
    await this.prisma.emailAccount.updateMany({
      where: {
        coachID,
        isActive: true,
      },
      data: {
        lastSyncAt: new Date(),
      }
    });

    return {
      totalProcessed,
      clientEmailsFound,
      responsesGenerated,
      errors,
      syncedAt: new Date(),
    };
  }

  /**
   * Sync emails for a specific email account
   */
  private async syncEmailsForAccount(
    coachID: string,
    emailAccount: any
  ): Promise<{ totalProcessed: number; clientEmailsFound: number; responsesGenerated: number }> {
    const lastSync = emailAccount.lastSyncAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Get recent emails from Gmail API
    const emails = await this.fetchEmailsFromProvider(emailAccount, lastSync);

    let clientEmailsFound = 0;
    let responsesGenerated = 0;

    for (const email of emails) {
      try {
        const processed = await this.processIncomingEmail(coachID, emailAccount, email);
        if (processed.isFromClient) {
          clientEmailsFound++;
          if (processed.responseGenerated) {
            responsesGenerated++;
          }
        }
      } catch (error: any) {
        this.logger.error(`Error processing email ${email.id}:`, error);
      }
    }


    return {
      totalProcessed: emails.length,
      clientEmailsFound,
      responsesGenerated,
    };
  }

  /**
   * Fetch emails from email provider (Gmail/Outlook)
   */
  private async fetchEmailsFromProvider(emailAccount: any, since: Date): Promise<GmailMessage[]> {
    if (emailAccount.provider === 'google') {
      return this.fetchGmailMessages(emailAccount, since);
    } else if (emailAccount.provider === 'microsoft') {
      return this.fetchOutlookMessages(emailAccount, since);
    }

    throw new Error(`Unsupported email provider: ${emailAccount.provider}`);
  }

  /**
   * Helper: Refresh Gmail access token using refresh_token
   */
  private async refreshGmailAccessToken(emailAccount: any): Promise<string | null> {
    // Assumes refreshToken and client credentials are available in emailAccount or config
    const refreshToken = emailAccount.refreshToken;
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    if (!refreshToken || !clientId || !clientSecret) {
      this.logger.error('Missing refresh token or client credentials for Gmail token refresh');
      return null;
    }
    try {
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`Failed to refresh Gmail access token: ${errText}`);
        return null;
      }
      const data: any = await response.json();
      if (data.access_token) {
        // Optionally, update the accessToken in DB
        await this.prisma.emailAccount.update({
          where: { id: emailAccount.id },
          data: { accessToken: data.access_token },
        });
        return data.access_token;
      }
      this.logger.error('No access_token found in Gmail refresh response');
      return null;
    } catch (err) {
      this.logger.error('Exception refreshing Gmail access token', err);
      return null;
    }
  }

  /**
   * Fetch emails from Gmail API (with token refresh on 401)
   */
  private async fetchGmailMessages(emailAccount: any, since: Date): Promise<GmailMessage[]> {
    const query = `after:${Math.floor(since.getTime() / 1000)} in:inbox`;
    let accessToken = emailAccount.accessToken;

    const fetchList = async (token: string) => {
      return fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );
    };

    try {
      // First, get list of message IDs (with retry on 401)
      let listResponse = await fetchList(accessToken);
      if (listResponse.status === 401) {
        // Try refreshing the token
        const newToken = await this.refreshGmailAccessToken(emailAccount);
        if (newToken) {
          accessToken = newToken;
          listResponse = await fetchList(accessToken);
        }
      }

      if (!listResponse.ok) {
        throw new Error(`Gmail API error: ${listResponse.statusText}`);
      }

      const listData: any = await listResponse.json();
      const messageIds = listData.messages || [];


      // Fetch full message details (with retry on 401 for each)
      const messages: GmailMessage[] = [];
      for (const messageRef of messageIds.slice(0, 20)) { // Limit to 20 most recent
        let messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageRef.id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
            }
          }
        );
        if (messageResponse.status === 401) {
          // Try refreshing again
          const newToken = await this.refreshGmailAccessToken(emailAccount);
          if (newToken) {
            accessToken = newToken;
            messageResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageRef.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Accept': 'application/json',
                }
              }
            );
          }
        }
        if (messageResponse.ok) {
          const message = await messageResponse.json();
          messages.push(message);
        }
      }
      return messages;
    } catch (error: any) {
      this.logger.error(`Error fetching Gmail messages:`, error);
      return [];
    }
  }

  /**
   * Fetch emails from Outlook API
   */
  private async fetchOutlookMessages(emailAccount: any, since: Date): Promise<any[]> {
    const filter = `receivedDateTime ge ${since.toISOString()}`;

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/messages?$filter=${encodeURIComponent(filter)}&$top=20&$orderby=receivedDateTime desc`,
        {
          headers: {
            'Authorization': `Bearer ${emailAccount.accessToken}`,
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Outlook API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.value || [];
    } catch (error: any) {
      this.logger.error(`Error fetching Outlook messages:`, error);
      return [];
    }
  }

  /**
   * Process an incoming email and determine if it's from a client
   */
  private async processIncomingEmail(
    coachID: string,
    emailAccount: any,
    rawEmail: any
  ): Promise<{ isFromClient: boolean; responseGenerated: boolean }> {
    const emailData = this.parseEmailData(rawEmail, emailAccount.provider);


    const isSender = await this.isEmailFromCoach(emailData.senderEmail, coachID);
    // Skip emails sent by the coach themselves
    if (isSender) {
      return { isFromClient: false, responseGenerated: false };
    }

    // Check if sender is a known client
    const client = await this.prisma.client.findFirst({
      where: {
        email: emailData.senderEmail,
        coachID,
      }
    });

    if (!client) {
      return { isFromClient: false, responseGenerated: false };
    }

    // Find or create email thread
    const thread = await this.findOrCreateEmailThread(
      coachID,
      client.id,
      emailAccount.id,
      emailData.threadID || emailData.messageID,
      emailData.subject
    );

    // Create email message record
    await this.createEmailMessage(thread.id, emailData);

    // Check if this email needs a response
    const needsResponse = await this.determineIfResponseNeeded(emailData, thread);

    if (needsResponse) {
      // Generate AI response
      await this.generateClientEmailResponse(coachID, client, thread, emailData);
      return { isFromClient: true, responseGenerated: true };
    }

    return { isFromClient: true, responseGenerated: false };
  }

  /**
   * Parse email data from provider-specific format
   */
  private parseEmailData(rawEmail: any, provider: string): any {
    if (provider === 'google') {
      return this.parseGmailData(rawEmail);
    } else if (provider === 'microsoft') {
      return this.parseOutlookData(rawEmail);
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }

  /**
   * Parse Gmail message data
   */
  private parseGmailData(message: GmailMessage): any {
    const headers = message.payload.headers;
    const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    let bodyText = '';
    let bodyHtml = '';

    // Extract body content
    if (message.payload.body?.data) {
      bodyText = Buffer.from(message.payload.body.data, 'base64').toString();
    } else if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          bodyText = Buffer.from(part.body.data, 'base64').toString();
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          bodyHtml = Buffer.from(part.body.data, 'base64').toString();
        }
      }
    }

    return {
      messageID: message.id,
      threadID: message.threadId,
      senderEmail: getHeader('From').match(/<(.+)>/)?.[1] || getHeader('From'),
      senderName: getHeader('From').replace(/<.+>/, '').trim(),
      recipientEmails: [getHeader('To')],
      subject: getHeader('Subject'),
      bodyText: bodyText || message.snippet,
      bodyHtml,
      sentAt: new Date(parseInt(message.internalDate)),
      receivedAt: new Date(),
    };
  }

  /**
   * Parse Outlook message data
   */
  private parseOutlookData(message: any): any {
    return {
      messageID: message.id,
      threadID: message.conversationId,
      senderEmail: message.sender?.emailAddress?.address || '',
      senderName: message.sender?.emailAddress?.name || '',
      recipientEmails: message.toRecipients?.map((r: any) => r.emailAddress?.address) || [],
      subject: message.subject || '',
      bodyText: message.body?.content || '',
      bodyHtml: message.body?.contentType === 'html' ? message.body?.content : '',
      sentAt: new Date(message.sentDateTime),
      receivedAt: new Date(message.receivedDateTime),
    };
  }

  /**
   * Check if email is from the coach themselves
   */
  private async isEmailFromCoach(senderEmail: string, coachID: string): Promise<boolean> {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true }
    });

    const emailAccounts = await this.prisma.emailAccount.findMany({
      where: { coachID },
      select: { emailAddress: true }
    });

    const coachEmails = [coach?.email, ...emailAccounts.map(acc => acc.emailAddress)];

    if (senderEmail === 'okwudiliezeoke12@gmail.com') {
    }

    return coachEmails.includes(senderEmail);
  }

  /**
   * Find or create email thread
   */
  private async findOrCreateEmailThread(
    coachID: string,
    clientID: string,
    emailAccountID: string,
    threadID: string,
    subject: string
  ): Promise<EmailThread> {
    let thread = await this.prisma.emailThread.findFirst({
      where: {
        coachID,
        clientID,
        threadID,
      }
    });

    if (!thread) {
      thread = await this.prisma.emailThread.create({
        data: {
          coachID,
          clientID,
          emailAccountID,
          threadID,
          subject,
          participants: [], // Will be populated when needed
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

  /**
   * Create email message record
   */
  private async createEmailMessage(threadID: string, emailData: any): Promise<EmailMessage> {
    // Check if message already exists
    const existing = await this.prisma.emailMessage.findFirst({
      where: {
        threadID,
        messageID: emailData.messageID,
      }
    });

    if (existing) {
      return existing;
    }

    return await this.prisma.emailMessage.create({
      data: {
        threadID,
        messageID: emailData.messageID,
        senderEmail: emailData.senderEmail,
        recipientEmails: emailData.recipientEmails,
        ccEmails: [],
        bccEmails: [],
        subject: emailData.subject,
        bodyText: emailData.bodyText,
        bodyHtml: emailData.bodyHtml,
        attachments: [],
        sentAt: emailData.sentAt,
        receivedAt: emailData.receivedAt,
      }
    });
  }

  /**
   * Determine if an email needs a response
   */
  private async determineIfResponseNeeded(emailData: any, thread: any): Promise<boolean> {
    // Skip auto-generated emails
    const autoGeneratedKeywords = [
      'noreply', 'no-reply', 'donotreply', 'do-not-reply',
      'automated', 'automatic', 'newsletter', 'unsubscribe'
    ];

    const fromAddress = emailData.senderEmail.toLowerCase();
    if (autoGeneratedKeywords.some(keyword => fromAddress.includes(keyword))) {
      return false;
    }

    // Skip if we already have a pending response for this thread
    const pendingResponse = await this.prisma.scheduledEmail.findFirst({
      where: {
        lead: null, // Client emails don't have leadID
        coachID: thread.coachID,
        status: 'pending_approval',
        metadata: {
          path: ['clientEmailThread'],
          equals: thread.id
        }
      }
    });

    if (pendingResponse) {
      return false;
    }

    // Skip very recent auto-responses (within last hour)
    const recentResponse = await this.prisma.scheduledEmail.findFirst({
      where: {
        coachID: thread.coachID,
        status: 'sent',
        sentAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        },
        metadata: {
          path: ['clientEmailThread'],
          equals: thread.id
        }
      }
    });

    if (recentResponse) {
      return false;
    }

    return true;
  }

  /**
   * Generate AI response for client email
   */
  async generateClientEmailResponse(
    coachID: string,
    client: any,
    thread: any,
    incomingEmail: any
  ): Promise<ClientEmailResponse> {
    this.logger.log(`Generating response for client ${client.email}`);

    // Get recent message history for context
    const recentMessages = await this.prisma.emailMessage.findMany({
      where: { threadID: thread.id },
      orderBy: { sentAt: 'desc' },
      take: 5
    });

    // Build context for AI
    const context = this.buildEmailResponseContext(client, thread, incomingEmail, recentMessages);

    // Generate response using Coach Replica
    const request: CoachReplicaRequest = {
      coachID,
      context,
      requestType: 'email_response',
      additionalData: {
        clientInfo: {
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          status: client.status,
          engagementScore: client.engagementScore,
          totalInteractions: client.totalInteractions,
          lastInteractionAt: client.lastInteractionAt,
          tags: client.tags,
        },
        incomingEmail: {
          subject: incomingEmail.subject,
          body: incomingEmail.bodyText,
          sentAt: incomingEmail.sentAt,
        },
        threadContext: {
          subject: thread.subject,
          messageCount: recentMessages.length,
          recentMessages: recentMessages.map(msg => ({
            sender: msg.senderEmail,
            body: msg.bodyText?.substring(0, 200),
            sentAt: msg.sentAt,
          }))
        }
      }
    };

    const aiResponse = await this.coachReplicaService.generateCoachResponse(request);

    // Extract subject and body from AI response
    const responseSubject = this.extractSubjectFromResponse(aiResponse.response, incomingEmail.subject);
    const responseBody = this.extractBodyFromResponse(aiResponse.response);

    // Analyze deliverability
    const deliverabilityRequest: AnalyzeEmailRequest = {
      subject: responseSubject,
      body: responseBody,
      coachID,
      recipientType: 'client',
    };

    const deliverabilityAnalysis = await this.emailDeliverabilityService.analyzeEmailDeliverability(deliverabilityRequest);

    // Create scheduled email with pending approval status
    const scheduledEmail = await this.prisma.scheduledEmail.create({
      data: {
        coachID,
        clientID: client.id,
        subject: responseSubject,
        body: responseBody,
        sequenceOrder: 1,
        scheduledFor: new Date(), // Will be updated when approved
        status: 'pending_approval',
        metadata: JSON.stringify({
          clientEmailThread: thread.id,
          clientID: client.id,
          originalEmail: incomingEmail.messageID,
          aiResponse: aiResponse,
          deliverabilityScore: deliverabilityAnalysis.overallScore,
          deliverabilityAnalysis: deliverabilityAnalysis,
          generatedAt: new Date(),
        })
      }
    });

    return {
      id: scheduledEmail.id,
      threadID: thread.id,
      clientID: client.id,
      subject: responseSubject,
      body: responseBody,
      status: 'pending_approval',
      deliverabilityScore: deliverabilityAnalysis.overallScore,
      aiConfidence: aiResponse.confidence,
      generatedAt: new Date(),
      scheduledFor: null,
      approvedAt: null,
      sentAt: null,
      originalEmailID: incomingEmail.messageID,
    };
  }

  /**
   * Get pending client email responses for approval
   */
  async getPendingClientResponses(coachID: string): Promise<ClientEmailResponse[]> {
    console.log("Came in here");
    const pendingEmails = await this.prisma.scheduledEmail.findMany({
      where: {
        coachID,
        status: 'pending_approval',
      },
      orderBy: { createdAt: 'desc' }
    });

    const responses: ClientEmailResponse[] = [];

    for (const email of pendingEmails) {
      try {
        const metadata = JSON.parse(email.metadata || '{}');
        const thread = await this.prisma.emailThread.findUnique({
          where: { id: metadata.clientEmailThread },
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
              }
            }
          }
        });


        if (thread) {
          responses.push({
            id: email.id,
            threadID: thread.id,
            clientID: metadata.clientID,
            subject: email.subject,
            body: email.body,
            status: 'pending_approval',
            deliverabilityScore: metadata.deliverabilityScore,
            aiConfidence: metadata.aiResponse?.confidence || 0.8,
            generatedAt: email.createdAt,
            scheduledFor: email.scheduledFor,
            approvedAt: null,
            sentAt: null,
            originalEmailID: metadata.originalEmail,
            client: thread.client,
            thread: {
              id: thread.id,
              subject: thread.subject,
              lastMessageAt: thread.lastMessageAt,
            }
          });
        }
      } catch (error) {
        this.logger.error(`Error parsing email metadata for ${email.id}:`, error);
      }
    }

    return responses;
  }

  /**
   * Approve and send client email response
   */
  async approveAndSendResponse(
    coachID: string,
    emailID: string,
    modifications?: { subject?: string; body?: string }
  ): Promise<{ success: boolean; message: string }> {
    const scheduledEmail = await this.prisma.scheduledEmail.findFirst({
      where: {
        id: emailID,
        coachID,
        status: 'pending_approval',
      }
    });

    if (!scheduledEmail) {
      throw new NotFoundException('Pending email not found');
    }

    try {
      const metadata = JSON.parse(scheduledEmail.metadata || '{}');

      // Get thread and client info
      const thread = await this.prisma.emailThread.findUnique({
        where: { id: metadata.clientEmailThread },
        include: { client: true }
      });

      if (!thread) {
        throw new NotFoundException('Email thread not found');
      }

      // Get coach's primary email account
      const primaryEmailAccount = await this.prisma.emailAccount.findFirst({
        where: {
          coachID,
          isPrimary: true,
          isActive: true,
        }
      });

      if (!primaryEmailAccount) {
        throw new BadRequestException('No primary email account configured');
      }

      // Use modifications if provided, otherwise use original content
      const finalSubject = modifications?.subject || scheduledEmail.subject;
      const finalBody = /*modifications?.body || */scheduledEmail.body;

      // Send email through coach's email account
      const sendResult = await this.sendEmailThroughCoachAccount(
        primaryEmailAccount,
        thread.client.email,
        finalSubject,
        finalBody,
        thread.threadID // For threading
      );

      if (sendResult.success) {
        // Update scheduled email status
        await this.prisma.scheduledEmail.update({
          where: { id: emailID },
          data: {
            status: 'sent',
            sentAt: new Date(),
            subject: finalSubject,
            body: finalBody,
            providerMessageID: sendResult.messageID,
          }
        });

        // Update thread
        await this.prisma.emailThread.update({
          where: { id: thread.id },
          data: {
            lastMessageAt: new Date(),
            messageCount: { increment: 1 },
          }
        });

        // Update client last interaction
        await this.prisma.client.update({
          where: { id: thread.client.id },
          data: {
            lastInteractionAt: new Date(),
            totalInteractions: { increment: 1 },
          }
        });

        return {
          success: true,
          message: `Email sent successfully to ${thread.client.email}`,
        };
      } else {
        // Update status to failed
        await this.prisma.scheduledEmail.update({
          where: { id: emailID },
          data: {
            status: 'failed',
            errorMessage: JSON.stringify({ error: sendResult.error }),
          }
        });

        return {
          success: false,
          message: `Failed to send email: ${sendResult.error}`,
        };
      }
    } catch (error: any) {
      this.logger.error(`Error sending approved email ${emailID}:`, error);

      await this.prisma.scheduledEmail.update({
        where: { id: emailID },
        data: {
          status: 'failed',
          errorMessage: JSON.stringify({ error: error.message }),
        }
      });

      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Reject/delete a pending response
   */
  async rejectResponse(coachID: string, emailID: string): Promise<{ success: boolean; message: string }> {
    const scheduledEmail = await this.prisma.scheduledEmail.findFirst({
      where: {
        id: emailID,
        coachID,
        status: 'pending_approval',
      }
    });

    if (!scheduledEmail) {
      throw new NotFoundException('Pending email not found');
    }

    await this.prisma.scheduledEmail.update({
      where: { id: emailID },
      data: { status: 'cancelled' }
    });

    return {
      success: true,
      message: 'Response rejected successfully',
    };
  }

  /**
   * Send email through coach's email account
   */
  private async sendEmailThroughCoachAccount(
    emailAccount: any,
    toEmail: string,
    subject: string,
    body: string,
    threadID?: string
  ): Promise<{ success: boolean; messageID?: string; error?: string }> {
    try {
      if (emailAccount.provider === 'google') {
        return await this.sendThroughGmail(emailAccount, toEmail, subject, body, threadID);
      } else if (emailAccount.provider === 'microsoft') {
        return await this.sendThroughOutlook(emailAccount, toEmail, subject, body, threadID);
      } else {
        return { success: false, error: `Unsupported email provider: ${emailAccount.provider}` };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email through Gmail API
   */
  private async sendThroughGmail(
    emailAccount: any,
    toEmail: string,
    subject: string,
    body: string,
    threadID?: string
  ): Promise<{ success: boolean; messageID?: string; error?: string }> {
    const email = [
      `To: ${toEmail}`,
      `From: ${emailAccount.emailAddress}`,
      `Subject: ${subject}`,
      threadID ? `In-Reply-To: ${threadID}` : '',
      threadID ? `References: ${threadID}` : '',
      '',
      body
    ].filter(Boolean).join('\r\n');

    const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const requestBody: any = {
      raw: encodedEmail
    };

    if (threadID) {
      requestBody.threadId = threadID;
    }

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailAccount.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, messageID: result.id };
    } else {
      const error = await response.text();
      return { success: false, error: `Gmail API error: ${error}` };
    }
  }

  /**
   * Send email through Outlook API
   */
  private async sendThroughOutlook(
    emailAccount: any,
    toEmail: string,
    subject: string,
    body: string,
    threadID?: string
  ): Promise<{ success: boolean; messageID?: string; error?: string }> {
    const message = {
      subject,
      body: {
        contentType: 'HTML',
        content: body
      },
      toRecipients: [
        {
          emailAddress: {
            address: toEmail
          }
        }
      ]
    };

    const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailAccount.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    });

    if (response.ok) {
      return { success: true, messageID: 'outlook-sent' }; // Outlook doesn't return message ID
    } else {
      const error = await response.text();
      return { success: false, error: `Outlook API error: ${error}` };
    }
  }

  /**
   * Build context for email response generation
   */
  private buildEmailResponseContext(
    client: any,
    thread: any,
    incomingEmail: any,
    recentMessages: any[]
  ): string {
    return `
CLIENT INFORMATION:
- Name: ${client.firstName} ${client.lastName}
- Email: ${client.email}
- Status: ${client.status}
- Engagement Score: ${client.engagementScore || 'N/A'}
- Total Interactions: ${client.totalInteractions || 0}
- Last Interaction: ${client.lastInteractionAt ? new Date(client.lastInteractionAt).toLocaleDateString() : 'N/A'}
- Tags: ${client.tags?.join(', ') || 'None'}

INCOMING EMAIL:
Subject: ${incomingEmail.subject}
From: ${client.firstName} ${client.lastName} <${client.email}>
Sent: ${new Date(incomingEmail.sentAt).toLocaleString()}

Message:
${incomingEmail.bodyText}

EMAIL THREAD CONTEXT:
- Thread Subject: ${thread.subject}
- Total Messages in Thread: ${recentMessages.length}
- Recent Message History:
${recentMessages.slice(0, 3).map(msg => `
  From: ${msg.senderEmail}
  Date: ${new Date(msg.sentAt).toLocaleDateString()}
  Content: ${msg.bodyText?.substring(0, 150)}...
`).join('\n')}

RESPONSE INSTRUCTIONS:
1. Respond as the coach in a personal, authentic way
2. Address the client's specific question or concern
3. Reference their progress or previous interactions if relevant
4. Maintain a supportive and professional tone
5. Keep the response focused and actionable
6. Include a clear next step if appropriate
7. Use the coach's typical communication style and voice

Generate a helpful, personalized email response that addresses the client's message and maintains the coaching relationship.`;
  }

  /**
   * Extract subject from AI response
   */
  private extractSubjectFromResponse(response: string, originalSubject: string): string {
    const subjectMatch = response.match(/Subject:\s*(.+)/i);
    if (subjectMatch) {
      return subjectMatch[1].trim();
    }

    // If no explicit subject, create a reply subject
    if (originalSubject.toLowerCase().startsWith('re:')) {
      return originalSubject;
    }
    return `Re: ${originalSubject}`;
  }

  /**
   * Extract body from AI response
   */
  private extractBodyFromResponse(response: string): string {
    // Remove subject line if present
    const body = response.replace(/Subject:\s*.+\n*/i, '').trim();

    // If response is very short, return as is
    if (body.length < 50) {
      return response;
    }

    return body;
  }

  /**
   * Get email statistics for dashboard
   */
  async getClientEmailStats(coachID: string): Promise<{
    pendingResponses: number;
    emailsProcessedToday: number;
    emailsProcessedThisWeek: number;
    averageResponseTime: number;
    clientEmailsFound: number;
    lastSyncAt: Date | null;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      pendingResponses,
      emailsToday,
      emailsThisWeek,
      lastEmailAccount
    ] = await Promise.all([
      this.prisma.scheduledEmail.count({
        where: {
          coachID,
          status: 'pending_approval',
          metadata: {
            path: ['clientEmailThread'],
            not: null
          }
        }
      }),
      this.prisma.scheduledEmail.count({
        where: {
          coachID,
          createdAt: { gte: today },
          metadata: {
            path: ['clientEmailThread'],
            not: null
          }
        }
      }),
      this.prisma.scheduledEmail.count({
        where: {
          coachID,
          createdAt: { gte: weekAgo },
          metadata: {
            path: ['clientEmailThread'],
            not: null
          }
        }
      }),
      this.prisma.emailAccount.findFirst({
        where: { coachID, isActive: true },
        select: { lastSyncAt: true },
        orderBy: { lastSyncAt: 'desc' }
      })
    ]);

    // Calculate average response time (simplified)
    const sentEmails = await this.prisma.scheduledEmail.findMany({
      where: {
        coachID,
        status: 'sent',
        sentAt: { gte: weekAgo },
        metadata: {
          path: ['clientEmailThread'],
          not: null
        }
      },
      select: { createdAt: true, sentAt: true }
    });

    let averageResponseTime = 0;
    if (sentEmails.length > 0) {
      const totalResponseTime = sentEmails.reduce((sum, email) => {
        const responseTime = email.sentAt!.getTime() - email.createdAt.getTime();
        return sum + responseTime;
      }, 0);
      averageResponseTime = Math.round(totalResponseTime / sentEmails.length / (1000 * 60)); // Convert to minutes
    }

    return {
      pendingResponses,
      emailsProcessedToday: emailsToday,
      emailsProcessedThisWeek: emailsThisWeek,
      averageResponseTime,
      clientEmailsFound: emailsThisWeek, // Approximation
      lastSyncAt: lastEmailAccount?.lastSyncAt || null,
    };
  }

  /**
   * Get detailed client email thread with messages
   */
  async getClientEmailThread(coachID: string, threadID: string): Promise<{
    thread: EmailThread;
    messages: EmailMessage[];
    client: any;
    pendingResponse?: ClientEmailResponse;
  }> {
    const thread = await this.prisma.emailThread.findFirst({
      where: {
        id: threadID,
        coachID,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
            engagementScore: true,
            totalInteractions: true,
            lastInteractionAt: true,
            tags: true,
          }
        },
        emailMessages: {
          orderBy: { sentAt: 'desc' },
          take: 20,
        }
      }
    });

    if (!thread) {
      throw new NotFoundException('Email thread not found');
    }

    // Check for pending response
    const pendingResponse = await this.prisma.scheduledEmail.findFirst({
      where: {
        coachID,
        status: 'pending_approval',
        metadata: {
          path: ['clientEmailThread'],
          equals: threadID
        }
      }
    });

    let pendingResponseData: ClientEmailResponse | undefined;
    if (pendingResponse) {
      const metadata = JSON.parse(pendingResponse.metadata || '{}');
      pendingResponseData = {
        id: pendingResponse.id,
        threadID: thread.id,
        clientID: thread.client.id,
        subject: pendingResponse.subject,
        body: pendingResponse.body,
        status: 'pending_approval',
        deliverabilityScore: metadata.deliverabilityScore,
        aiConfidence: metadata.aiResponse?.confidence || 0.8,
        generatedAt: pendingResponse.createdAt,
        scheduledFor: pendingResponse.scheduledFor,
        approvedAt: null,
        sentAt: null,
        originalEmailID: metadata.originalEmail,
      };
    }

    return {
      thread,
      messages: thread.emailMessages,
      client: thread.client,
      pendingResponse: pendingResponseData,
    };
  }

  /**
   * Regenerate response for a specific email thread
   */
  async regenerateResponse(
    coachID: string,
    threadID: string,
    customInstructions?: string
  ): Promise<ClientEmailResponse> {
    const threadData = await this.getClientEmailThread(coachID, threadID);

    if (!threadData.thread || !threadData.client) {
      throw new NotFoundException('Thread or client not found');
    }

    // Get the most recent client message
    const clientMessages = threadData.messages.filter(msg =>
      msg.senderEmail === threadData.client.email
    );

    if (clientMessages.length === 0) {
      throw new BadRequestException('No client messages found in thread');
    }

    const latestClientMessage = clientMessages[0];

    // Cancel existing pending response
    if (threadData.pendingResponse) {
      await this.prisma.scheduledEmail.update({
        where: { id: threadData.pendingResponse.id },
        data: { status: 'cancelled' }
      });
    }

    // Generate new response
    const emailData = {
      messageID: latestClientMessage.messageID,
      subject: latestClientMessage.subject || threadData.thread.subject || '',
      bodyText: latestClientMessage.bodyText || '',
      sentAt: latestClientMessage.sentAt,
    };

    return await this.generateClientEmailResponse(
      coachID,
      threadData.client,
      threadData.thread,
      emailData
    );
  }
}
