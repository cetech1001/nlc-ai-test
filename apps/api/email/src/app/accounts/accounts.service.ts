import {BadRequestException, Inject, Injectable, Logger,} from '@nestjs/common';
import {InjectQueue} from "@nestjs/bull";
import type {Queue} from "bull";
import {Cron, CronExpression} from '@nestjs/schedule';
import {OutboxService} from '@nlc-ai/api-messaging';
import {ClientEmailReceivedEvent, EmailAccountActionResponse, EmailSyncEvent} from '@nlc-ai/api-types';
import {
  BulkSyncRequest,
  BulkSyncResponse,
  IEmailSyncProvider,
  SyncedEmail,
  EmailAccount,
  SyncEmailAccountRequest,
  SyncEmailAccountResponse,
  SyncStatus,
  UserType, EmailAccountProvider
} from "@nlc-ai/types";
import {AccountsRepository} from "./repositories/accounts.repository";

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @Inject('SYNC_PROVIDERS') private syncProviders: Record<string, IEmailSyncProvider>,
    @InjectQueue('email-sync') private syncQueue: Queue,
    private readonly accountsRepo: AccountsRepository,
    private readonly outbox: OutboxService,
  ) {}

  async getEmailAccounts(userID: string): Promise<EmailAccount[]> {
    try {
      const emailAccounts = await this.accountsRepo.getAccountsByUser(userID);

      return emailAccounts.map(account => ({
        ...account,
        userType: account.userType as UserType,
        provider: account.provider as EmailAccountProvider,
        accessToken: account.accessToken ? '***' : null,
        refreshToken: account.refreshToken ? '***' : null,
      }));
    } catch (error: any) {
      throw new BadRequestException('Failed to retrieve email accounts');
    }
  }

  async hasAnAccount(userID: string): Promise<{ exists: boolean; }> {
    const accounts = await this.accountsRepo.hasAnAccount(userID);
    return { exists: accounts > 0 };
  }

  async setPrimaryEmailAccount(accountID: string, userID: string): Promise<EmailAccountActionResponse> {
    const emailAccount = await this.accountsRepo.getAccountByID(accountID, userID);

    try {
      await this.accountsRepo.setPrimaryEmailAccount(accountID, userID);

      return {
        success: true,
        message: `${emailAccount?.emailAddress} set as primary email account`,
      };
    } catch (error: any) {
      throw new BadRequestException('Failed to set primary email account');
    }
  }

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
        const accounts = await this.accountsRepo.getAccountsByUser(request.userID);

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
    return this.accountsRepo.getSyncStats(userID);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async autoSyncAllActiveAccounts(coachID?: string) {
    this.logger.log('Starting automatic email sync for all active accounts...');

    const accounts = await this.accountsRepo.getAllActiveAccounts(coachID);

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

      await this.accountsRepo.updateTokens(account.id, {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpiresAt: tokenData.expiresAt ? new Date(tokenData.expiresAt) : null,
      });

      this.logger.log(`Token refreshed successfully for account ${account.id}`);
      return tokenData.accessToken;
    } catch (error: any) {
      this.logger.error(`Failed to refresh token for account ${account.id}:`, error);

      await this.accountsRepo.markAccountAsNeedingReauth(account.id);

      throw new Error(`Token refresh failed: ${error.message}. Please re-authenticate your email account.`);
    }
  }

  async processAccountSync(accountID: string, forceFull?: boolean): Promise<{
    totalProcessed: number;
    clientEmailsFound: number;
    threadsCreated: number;
  }> {
    const account = await this.accountsRepo.getAccountByID(accountID);
    if (!account) {
      throw new Error(`Account ${accountID} not found`);
    }

    // Check if account is marked as needing re-authentication
    if (account.syncEnabled === false && account.accessToken === null) {
      throw new Error('Account requires re-authentication. Please reconnect your email account.');
    }

    const syncProvider = await this.getSyncProvider(account.provider);

    // Ensure we have a valid access token
    let validAccessToken: string;
    try {
      validAccessToken = await this.ensureValidToken(account);
    } catch (error: any) {
      this.logger.error(`Token validation failed for account ${accountID}:`, error);
      throw error;
    }

    // Test connection with the valid token
    const isConnected = await syncProvider.testConnection(validAccessToken);
    if (!isConnected) {
      // If connection still fails after token refresh, mark account for re-auth
      await this.accountsRepo.markAccountAsNeedingReauth(accountID);
      throw new Error('Failed to connect to email provider after token refresh. Please re-authenticate your email account.');
    }

    const lastSync = forceFull ? undefined : account.lastSyncAt?.toISOString();

    let syncResult;
    try {
      syncResult = await syncProvider.syncEmails(
        validAccessToken,
        {} as any,
        lastSync
      );
    } catch (error: any) {
      this.logger.error(`Email sync failed for account ${accountID}:`, error);

      // If it's an auth error, mark for re-auth
      if (this.isAuthError(error)) {
        await this.accountsRepo.markAccountAsNeedingReauth(accountID);
        throw new Error('Authentication failed during sync. Please re-authenticate your email account.');
      }

      throw error;
    }

    let clientEmailsFound = 0;
    let threadsCreated = 0;

    for (const email of syncResult.emails) {
      try {
        const processed = await this.processIncomingEmail(account, email);
        if (processed.isFromClient) {
          clientEmailsFound++;
        }
        if (processed.threadCreated) {
          threadsCreated++;
        }
      } catch (error: any) {
        this.logger.error(`Error processing email ${email.providerMessageID}:`, error);
      }
    }

    // Update last sync time and ensure account is marked as active
    await this.accountsRepo.updateLastSyncAndStatus(accountID, new Date(), true);

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

  /**
   * Check if an error is authentication-related
   */
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

  private async processIncomingEmail(account: any, email: SyncedEmail): Promise<{
    isFromClient: boolean;
    threadCreated: boolean;
  }> {
    console.log("Email: ", email.from);
    if (await this.isEmailFromCoach(email.from, account.userID)) {
      return { isFromClient: false, threadCreated: false };
    }

    const client = await this.accountsRepo.findClientByEmail(email.from, account.userID);
    if (!client) {
      return { isFromClient: false, threadCreated: false };
    }

    const thread = await this.accountsRepo.findOrCreateEmailThread({
      userID: account.userID,
      userType: account.userType,
      clientID: client.id,
      clientType: UserType.CLIENT,
      emailAccountID: account.id,
      threadID: email.threadID,
      subject: email.subject || 'No Subject',
    });

    const threadCreated = !await this.accountsRepo.threadExists(email.threadID);

    /*await this.accountsRepo.createEmailMessage({
      threadID: thread.id,
      providerMessageID: email.providerMessageID,
      from: email.from,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
      sentAt: new Date(email.sentAt),
      receivedAt: new Date(email.receivedAt || ''),
      isRead: email.isRead,
    });*/

    await this.outbox.saveAndPublishEvent<ClientEmailReceivedEvent>(
      {
        eventType: 'email.client.received',
        schemaVersion: 1,
        payload: {
          coachID: account.userID,
          clientID: client.id,
          threadID: thread.id,
          emailID: email.providerMessageID,
          subject: email.subject || '',
          receivedAt: new Date().toISOString(),
        },
      },
      'email.client.received'
    );

    return { isFromClient: true, threadCreated };
  }

  private async isEmailFromCoach(senderEmail: string, coachID: string): Promise<boolean> {
    const coachEmails = await this.accountsRepo.getCoachEmails(coachID);
    return coachEmails.includes(senderEmail);
  }
}
