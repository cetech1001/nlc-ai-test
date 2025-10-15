import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OutboxService } from '@nlc-ai/api-messaging';
import { EmailSyncEvent } from '@nlc-ai/api-types';
import {
  BulkSyncRequest,
  BulkSyncResponse,
  IEmailSyncProvider,
  SyncedEmail,
  SyncEmailAccountRequest,
  SyncEmailAccountResponse,
  SyncStatus,
} from '@nlc-ai/types';
import { SyncRepository } from './repositories/sync.repository';
import { S3EmailService } from './services/s3-email.service';
import { EmailFineTuningService } from './services/email-fine-tuning.service';
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @Inject('SYNC_PROVIDERS') private syncProviders: Record<string, IEmailSyncProvider>,
    @InjectQueue('email-sync') private syncQueue: Queue,
    private readonly syncRepo: SyncRepository,
    private readonly outbox: OutboxService,
    private readonly s3EmailService: S3EmailService,
    private readonly fineTuningService: EmailFineTuningService,
    private readonly prisma: PrismaService,
  ) {}

  async syncAccount(request: SyncEmailAccountRequest): Promise<SyncEmailAccountResponse> {
    try {
      const job = await this.syncQueue.add('sync-account', {
        accountID: request.accountID,
        forceFull: request.forceFull,
        maxEmails: request.maxEmails,
      });

      return {
        syncResult: {
          accountID: request.accountID,
          syncStartTime: new Date().toISOString(),
          syncEndTime: new Date().toISOString(),
          status: SyncStatus.SYNCING,
          emailsProcessed: 0,
          newEmails: 0,
          updatedEmails: 0,
          errorCount: 0,
          errors: [],
        },
        success: true,
        message: `Sync job queued with ID: ${job.id}`,
      };
    } catch (error: any) {
      this.logger.error('Failed to queue sync job', error);
      return {
        syncResult: {
          accountID: request.accountID,
          syncStartTime: new Date().toISOString(),
          syncEndTime: new Date().toISOString(),
          status: SyncStatus.FAILED,
          emailsProcessed: 0,
          newEmails: 0,
          updatedEmails: 0,
          errorCount: 1,
          errors: [error.message],
        },
        success: false,
        message: error.message,
      };
    }
  }

  async bulkSync(request: BulkSyncRequest): Promise<BulkSyncResponse> {
    try {
      const jobs = [];

      if (request.accountIDs?.length) {
        for (const accountID of request.accountIDs) {
          const job = await this.syncQueue.add('sync-account', {
            accountID,
            forceFull: request.forceFull,
          });
          jobs.push(job);
        }
      } else if (request.userID && request.userType) {
        const accounts = await this.syncRepo.getAccountsByUser(request.userID);

        for (const account of accounts) {
          const job = await this.syncQueue.add('sync-account', {
            accountID: account.id,
            forceFull: request.forceFull,
          });
          jobs.push(job);
        }
      }

      return {
        results: [],
        totalAccounts: jobs.length,
        successfulSyncs: 0,
        failedSyncs: 0,
        success: true,
        message: `Queued ${jobs.length} sync jobs`,
      };
    } catch (error: any) {
      this.logger.error('Failed to queue bulk sync jobs', error);
      return {
        results: [],
        totalAccounts: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        success: false,
        message: error.message,
      };
    }
  }

  async getSyncStats(userID: string) {
    return this.syncRepo.getSyncStats(userID);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncAllAccountsForCoach(coachID?: string) {
    this.logger.log('Starting automatic email sync for all active accounts...');

    const accounts = await this.syncRepo.getAllActiveAccounts(coachID);

    for (const account of accounts) {
      try {
        await this.syncQueue.add('sync-account', {
          accountID: account.id,
          forceFull: false,
        });
      } catch (error: any) {
        this.logger.error(`Failed to queue sync for account ${account.id}:`, error);
      }
    }
  }

  async getSyncProvider(provider: string): Promise<IEmailSyncProvider> {
    const syncProvider = this.syncProviders[provider.toLowerCase()];
    if (!syncProvider) {
      throw new Error(`Sync provider ${provider} not found`);
    }
    return syncProvider;
  }

  private isTokenExpired(tokenExpiresAt?: Date): boolean {
    if (!tokenExpiresAt) return true;

    const now = new Date();
    const expiryTime = new Date(tokenExpiresAt);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    return expiryTime <= fiveMinutesFromNow;
  }

  private async ensureValidToken(account: any): Promise<string> {
    if (!this.isTokenExpired(account.tokenExpiresAt)) {
      return account.accessToken;
    }

    this.logger.log(`Token expired for account ${account.id}, refreshing...`);

    if (!account.refreshToken) {
      throw new Error('No refresh token available for account');
    }

    try {
      const syncProvider = await this.getSyncProvider(account.provider);
      const tokenData = await syncProvider.refreshToken(account.refreshToken);

      await this.syncRepo.updateTokens(account.id, {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpiresAt: tokenData.expiresAt ? new Date(tokenData.expiresAt) : null,
      });

      this.logger.log(`Token refreshed successfully for account ${account.id}`);
      return tokenData.accessToken;
    } catch (error: any) {
      this.logger.error(`Failed to refresh token for account ${account.id}:`, error);
      await this.syncRepo.markAccountAsNeedingReauth(account.id);
      throw new Error(`Token refresh failed: ${error.message}. Please re-authenticate your email account.`);
    }
  }

  async processAccountSync(accountID: string, forceFull?: boolean): Promise<{
    totalProcessed: number;
    clientEmailsFound: number;
    threadsCreated: number;
  }> {
    const account = await this.syncRepo.getAccountByID(accountID);
    if (!account) {
      throw new Error(`Account ${accountID} not found`);
    }

    if (account.syncEnabled === false && account.accessToken === null) {
      throw new Error('Account requires re-authentication. Please reconnect your email account.');
    }

    const syncProvider = await this.getSyncProvider(account.provider);

    let validAccessToken: string;
    try {
      validAccessToken = await this.ensureValidToken(account);
    } catch (error: any) {
      this.logger.error(`Token validation failed for account ${accountID}:`, error);
      throw error;
    }

    const isConnected = await syncProvider.testConnection(validAccessToken);
    if (!isConnected) {
      await this.syncRepo.markAccountAsNeedingReauth(accountID);
      throw new Error('Failed to connect to email provider after token refresh. Please re-authenticate your email account.');
    }

    // Use the proper sync token (historyID for Gmail, skipToken for Outlook)
    const lastSync = forceFull ? undefined : (account.lastSyncToken || account.lastSyncAt?.toISOString());

    this.logger.log(`Starting sync for account ${accountID}`, {
      provider: account.provider,
      forceFull,
      lastSyncToken: lastSync,
    });

    let syncResult;
    try {
      syncResult = await syncProvider.syncEmails(
        validAccessToken,
        {} as any,
        lastSync
      );
    } catch (error: any) {
      this.logger.error(`Email sync failed for account ${accountID}:`, error);

      if (this.isAuthError(error)) {
        await this.syncRepo.markAccountAsNeedingReauth(accountID);
        throw new Error('Authentication failed during sync. Please re-authenticate your email account.');
      }

      throw error;
    }

    let clientEmailsFound = 0;
    let threadsCreated = 0;

    for (const email of syncResult.emails) {
      try {
        const result = await this.processIncomingEmail(account, email);
        if (result.isClientEmail) {
          clientEmailsFound++;
        }
        if (result.threadCreated) {
          threadsCreated++;
        }
      } catch (error: any) {
        this.logger.error(`Error processing email ${email.providerMessageID}:`, error);
      }
    }

    // Store the nextSyncToken for incremental sync
    await this.syncRepo.updateLastSyncAndStatus(
      accountID,
      new Date(),
      true,
      syncResult.nextSyncToken
    );

    this.logger.log(`Sync completed for account ${accountID}`, {
      totalProcessed: syncResult.emails.length,
      clientEmailsFound,
      threadsCreated,
      nextSyncToken: syncResult.nextSyncToken,
    });

    await this.outbox.saveAndPublishEvent<EmailSyncEvent>(
      {
        eventType: 'email.sync.completed',
        schemaVersion: 1,
        payload: {
          coachID: account.userID,
          totalProcessed: syncResult.emails.length,
          clientEmailsFound,
          syncedAt: new Date().toISOString(),
        },
      },
      'email.sync.completed'
    );

    return {
      totalProcessed: syncResult.emails.length,
      clientEmailsFound,
      threadsCreated,
    };
  }

  private isAuthError(error: any): boolean {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.status || error.code;

    return (
      errorCode === 401 ||
      errorCode === 403 ||
      errorMessage.includes('invalid credentials') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('authentication') ||
      errorMessage.includes('token') ||
      errorMessage.includes('oauth')
    );
  }

  private async processIncomingEmail(
    account: any,
    email: SyncedEmail
  ): Promise<{ isClientEmail: boolean; threadCreated: boolean }> {
    const isFromCoach = await this.isEmailFromCoach(email.from, account.userID);
    const isToCoach = await this.isEmailFromCoach(email.to, account.userID);

    // Check if this is a client/lead email
    const client = !isFromCoach ? await this.syncRepo.findClientByEmail(email.from, account.userID) : null;

    // Determine if we need to create/update a thread
    let thread = null;
    let threadCreated = false;

    if (client) {
      const existingThread = await this.prisma.emailThread.findFirst({
        where: {
          userID: account.userID,
          threadID: email.threadID,
        },
      });

      const senderEmail = this.extractEmailAddress(email.from);
      const preview = this.createMessagePreview(email.text || email.html || '');

      thread = await this.syncRepo.findOrCreateEmailThread({
        userID: account.userID,
        userType: account.userType,
        participantID: client.id,
        participantType: client.type,
        participantName: client.name,
        participantEmail: senderEmail,
        emailAccountID: account.id,
        threadID: email.threadID,
        subject: email.subject || 'No Subject',
        lastMessageAt: new Date(email.receivedAt || email.sentAt),
        lastMessageFrom: client.name,
        lastMessageFromEmail: senderEmail,
        lastMessagePreview: preview,
        isRead: email.isRead,
      });

      threadCreated = !existingThread;

      // Store thread message for agent context (client email in active thread)
      await this.s3EmailService.storeThreadMessage(
        account.userID,
        email.threadID,
        email.providerMessageID,
        {
          ...email,
          isFromCoach: false,
        }
      );

      this.logger.log(`Stored client email ${email.providerMessageID} in thread ${thread.id}`);
    }

    // If email is from coach to client/lead, store for fine-tuning
    if (isFromCoach) {
      const isToClientOrLead = !isToCoach;

      if (isToClientOrLead) {
        const s3Key = await this.s3EmailService.storeCoachEmail(
          account.userID,
          email.threadID,
          email.providerMessageID,
          email
        );

        await this.fineTuningService.queueEmailForFineTuning(account.userID, {
          threadID: email.threadID,
          messageID: email.providerMessageID,
          s3Key,
          from: email.from,
          to: email.to,
          subject: email.subject,
          sentAt: new Date(email.sentAt),
          isFromCoach: true,
          isToClientOrLead: true,
        });

        this.logger.log(`Queued coach email ${email.providerMessageID} for fine-tuning`);
      }

      // If coach replied in a client thread, also store as thread message
      if (thread) {
        await this.s3EmailService.storeThreadMessage(
          account.userID,
          email.threadID,
          email.providerMessageID,
          {
            ...email,
            isFromCoach: true,
          }
        );

        this.logger.log(`Stored coach reply ${email.providerMessageID} in thread ${thread.id}`);
      }

      return { isClientEmail: false, threadCreated };
    }

    return { isClientEmail: !!client, threadCreated };
  }

  private extractEmailAddress(emailString: string): string {
    const match = emailString.match(/<(.+?)>/);
    return match ? match[1] : emailString.trim();
  }

  private createMessagePreview(content: string): string {
    const text = content.replace(/<[^>]*>/g, ' ');
    const cleaned = text.replace(/\s+/g, ' ').trim();
    return cleaned.length > 500 ? cleaned.substring(0, 497) + '...' : cleaned;
  }

  private async isEmailFromCoach(senderEmail: string, coachID: string): Promise<boolean> {
    const coachEmails = await this.syncRepo.getCoachEmails(coachID);
    return coachEmails.includes(senderEmail);
  }
}
