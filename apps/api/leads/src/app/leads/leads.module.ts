import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { AntiSpamGuard, ReplayCacheService } from '@nlc-ai/api-auth';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, AntiSpamGuard, ReplayCacheService],
  exports: [LeadsService],
})
export class LeadsModule {}
