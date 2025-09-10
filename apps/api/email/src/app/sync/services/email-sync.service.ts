import {Inject, Injectable, Logger} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bull';
import {type Queue} from 'bull';
import {IEmailSyncProvider} from '../interfaces/email-sync-provider.interface';
import {EmailSyncRepository} from '../repositories/email-sync.repository';
import {
  BulkSyncRequest,
  BulkSyncResponse,
  SyncEmailAccountRequest,
  SyncEmailAccountResponse,
  SyncStatus
} from '@nlc-ai/types';

@Injectable()
export class EmailSyncService {
  private readonly logger = new Logger(EmailSyncService.name);

  constructor(
    @Inject('SYNC_PROVIDERS') private syncProviders: Record<string, IEmailSyncProvider>,
    @InjectQueue('email-sync') private syncQueue: Queue,
    private emailSyncRepository: EmailSyncRepository,
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
        // Get all accounts for user and queue them
        const accounts = await this.emailSyncRepository.getAccountsByUser(
          request.userID,
          request.userType
        );

        for (const account of accounts) {
          const job = await this.syncQueue.add('sync-account', {
            accountID: account.id,
            forceFull: request.forceFull,
          });
          jobs.push(job);
        }
      }

      return {
        results: [], // Will be populated as jobs complete
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

  async getSyncProvider(provider: string): Promise<IEmailSyncProvider> {
    const syncProvider = this.syncProviders[provider.toLowerCase()];
    if (!syncProvider) {
      throw new Error(`Sync provider ${provider} not found`);
    }
    return syncProvider;
  }
}
