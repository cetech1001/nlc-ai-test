import { Processor, Process } from '@nestjs/bull';
import { type Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EmailSyncService } from '../services/email-sync.service';
import { EmailSyncRepository } from '../repositories/email-sync.repository';

@Processor('email-sync')
export class SyncProcessor {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(
    private emailSyncService: EmailSyncService,
    private emailSyncRepository: EmailSyncRepository,
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

      // Get account details
      const account = await this.emailSyncRepository.getAccountByID(accountID);
      if (!account) {
        throw new Error(`Account ${accountID} not found`);
      }

      // Get sync provider
      const syncProvider = await this.emailSyncService.getSyncProvider(account.provider);

      // Test connection first
      const isConnected = await syncProvider.testConnection(account.accessToken || '');
      if (!isConnected) {
        throw new Error('Failed to connect to email provider');
      }

      // Perform sync
      const syncResult = await syncProvider.syncEmails(
        account.accessToken || '',
        account.syncSettings as any,
        forceFull ? undefined : account.lastSyncAt?.toISOString()
      );

      // Update last sync time
      await this.emailSyncRepository.updateLastSync(accountID, new Date());

      // Store sync result
      await this.emailSyncRepository.createSyncResult({
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

      await this.emailSyncRepository.createSyncResult({
        accountID,
        status: 'failed',
        error: error.message,
      });

      throw error;
    }
  }
}
