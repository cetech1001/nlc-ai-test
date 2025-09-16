import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {InjectQueue} from "@nestjs/bull";
import type {Queue} from "bull";
import {
  EmailAccount,
  EmailAccountActionResponse
} from '@nlc-ai/api-types';
import {
  BulkSyncRequest,
  BulkSyncResponse,
  SyncEmailAccountRequest,
  SyncEmailAccountResponse,
  SyncStatus,
  IEmailSyncProvider
} from "@nlc-ai/types";
import {AccountsRepository} from "./repositories/accounts.repository";

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @Inject('SYNC_PROVIDERS') private syncProviders: Record<string, IEmailSyncProvider>,
    @InjectQueue('email-sync') private syncQueue: Queue,
    private readonly accountsRepo: AccountsRepository,
  ) {
  }

  async getEmailAccounts(userID: string): Promise<EmailAccount[]> {
    try {
      const emailAccounts = await this.accountsRepo.getAccountsByUser(userID);

      return emailAccounts.map(account => ({
        ...account,
        accessToken: account.accessToken ? '***' : null,
        refreshToken: account.refreshToken ? '***' : null,
      }));
    } catch (error: any) {
      throw new BadRequestException('Failed to retrieve email accounts');
    }
  }

  async setPrimaryEmailAccount(userID: string, accountID: string): Promise<EmailAccountActionResponse> {
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

  async getSyncProvider(provider: string): Promise<IEmailSyncProvider> {
    const syncProvider = this.syncProviders[provider.toLowerCase()];
    if (!syncProvider) {
      throw new Error(`Sync provider ${provider} not found`);
    }
    return syncProvider;
  }
}
