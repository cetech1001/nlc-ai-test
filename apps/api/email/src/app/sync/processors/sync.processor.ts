import { Processor, Process } from '@nestjs/bull';
import { type Job } from 'bull';
import { Logger } from '@nestjs/common';
import {SyncService} from "../sync.service";
import {SyncRepository} from "../repositories/sync.repository";

@Processor('email-sync')
export class SyncProcessor {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(
    private sync: SyncService,
    private syncRepo: SyncRepository,
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

      const result = await this.sync.processAccountSync(accountID, forceFull);

      await this.syncRepo.createSyncResult({
        accountID,
        emailsProcessed: result.totalProcessed,
        newEmails: result.clientEmailsFound,
        status: 'completed',
      });

      this.logger.log(
        `Sync completed for account: ${accountID}, ` +
        `processed ${result.totalProcessed} emails, ` +
        `found ${result.clientEmailsFound} client emails, ` +
        `created ${result.threadsCreated} new threads`
      );

      return {
        success: true,
        emailsProcessed: result.totalProcessed,
        clientEmailsFound: result.clientEmailsFound,
        threadsCreated: result.threadsCreated,
      };
    } catch (error: any) {
      this.logger.error(`Sync failed for account: ${accountID}`, error);

      await this.syncRepo.createSyncResult({
        accountID,
        status: 'failed',
        error: error.message,
      });

      throw error;
    }
  }
}
