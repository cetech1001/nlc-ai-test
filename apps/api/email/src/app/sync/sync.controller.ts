import { Controller, Post, Body, Logger } from '@nestjs/common';
import { EmailSyncService } from './services/email-sync.service';
import { SyncAccountDto, BulkSyncDto } from './dto';

@Controller('sync')
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(private emailSyncService: EmailSyncService) {}

  @Post('account')
  async syncAccount(@Body() dto: SyncAccountDto) {
    this.logger.log(`Starting sync for account: ${dto.accountID}`);
    return this.emailSyncService.syncAccount(dto);
  }

  @Post('bulk')
  async bulkSync(@Body() dto: BulkSyncDto) {
    this.logger.log(`Starting bulk sync for ${dto.accountIDs?.length || 'user accounts'} accounts`);
    return this.emailSyncService.bulkSync(dto);
  }
}
