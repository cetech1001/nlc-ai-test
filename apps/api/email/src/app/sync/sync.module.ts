import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SyncProcessor } from './processors/sync.processor';
import { SyncRepository } from './repositories/sync.repository';
import { GmailSyncService } from './services/gmail-sync.service';
import { OutlookSyncService } from './services/outlook-sync.service';
import {S3EmailService} from "./services/s3-email.service";
import {EmailFineTuningService} from "./services/email-fine-tuning.service";
import {FineTuningRepository} from "./repositories/fine-tuning.repository";
import {EmailCacheRepository} from "./repositories/email-cache.repository";

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-sync',
    }),
  ],
  controllers: [SyncController],
  providers: [
    SyncService,
    SyncRepository,
    GmailSyncService,
    OutlookSyncService,
    SyncProcessor,
    {
      provide: 'SYNC_PROVIDERS',
      useFactory: (gmail: GmailSyncService, outlook: OutlookSyncService) => ({
        gmail,
        outlook,
        google: gmail,
      }),
      inject: [GmailSyncService, OutlookSyncService],
    },
    S3EmailService,
    EmailFineTuningService,
    FineTuningRepository,
    EmailCacheRepository,
  ],
  exports: [SyncService, S3EmailService, EmailCacheRepository],
})
export class SyncModule {}
