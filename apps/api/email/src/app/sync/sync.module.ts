import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SyncProcessor } from './processors/sync.processor';
import { SyncRepository } from './repositories/sync.repository';
import { GmailSyncService } from './services/gmail-sync.service';
import { OutlookSyncService } from './services/outlook-sync.service';

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
  ],
  exports: [SyncService],
})
export class SyncModule {}
