import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { GmailSyncService } from './services/gmail-sync.service';
import { OutlookSyncService } from './services/outlook-sync.service';
import { EmailSyncService } from './services/email-sync.service';
import { SyncController } from './sync.controller';
import { SyncProcessor } from './processors/sync.processor';
import { EmailSyncRepository } from './repositories/email-sync.repository';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'email-sync',
    }),
  ],
  controllers: [SyncController],
  providers: [
    GmailSyncService,
    OutlookSyncService,
    EmailSyncService,
    SyncProcessor,
    EmailSyncRepository,
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
  exports: [EmailSyncService],
})
export class SyncModule {}
