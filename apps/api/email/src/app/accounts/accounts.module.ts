import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import {GmailSyncService} from "./services/gmail-sync.service";
import {OutlookSyncService} from "./services/outlook-sync.service";
import {SyncProcessor} from "./processors/sync.processor";
import {AccountsRepository} from "./repositories/accounts.repository";
import {BullModule} from "@nestjs/bull";

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-sync',
    }),
  ],
  controllers: [AccountsController],
  providers: [
    GmailSyncService,
    OutlookSyncService,
    AccountsService,
    AccountsRepository,
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
  exports: [AccountsService],
})
export class AccountsModule {}
