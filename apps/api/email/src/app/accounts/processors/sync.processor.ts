import { Processor, Process } from '@nestjs/bull';
import { type Job } from 'bull';
import { Logger } from '@nestjs/common';
import {AccountsService} from "../accounts.service";
import {AccountsRepository} from "../repositories/accounts.repository";

@Processor('email-sync')
export class SyncProcessor {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(
    private accountsService: AccountsService,
    private accountsRepo: AccountsRepository,
  ) {}

  @Process('sync-account')
  async processSyncAccount(job: Job<{
    accountID: string;
    forceFull?: boolean;
    maxEmails?: number;
  }>) {
    const { accountID, forceFull } = job.data;

    try {
      this.logger.log(`Processing sync for account: ${accountID}`);

      const account = await this.accountsRepo.getAccountByID(accountID);
      if (!account) {
        throw new Error(`Account ${accountID} not found`);
      }

      const syncProvider = await this.accountsService.getSyncProvider(account.provider);

      const isConnected = await syncProvider.testConnection(account.accessToken || '');
      if (!isConnected) {
        throw new Error('Failed to connect to email provider');
      }

      const syncResult = await syncProvider.syncEmails(
        account.accessToken || '',
        account.syncSettings as any,
        forceFull ? undefined : account.lastSyncAt?.toISOString()
      );

      await this.accountsRepo.updateLastSync(accountID, new Date());

      await this.accountsRepo.createSyncResult({
        accountID,
        emailsProcessed: syncResult.emails.length,
        newEmails: syncResult.emails.length,
        status: 'completed',
      });

      this.logger.log(`Sync completed for account: ${accountID}, processed ${syncResult.emails.length} emails`);

      return {
        success: true,
        emailsProcessed: syncResult.emails.length,
      };
    } catch (error: any) {
      this.logger.error(`Sync failed for account: ${accountID}`, error);

      await this.accountsRepo.createSyncResult({
        accountID,
        status: 'failed',
        error: error.message,
      });

      throw error;
    }
  }
}
