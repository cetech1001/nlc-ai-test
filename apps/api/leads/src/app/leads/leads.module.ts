import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LandingTokenGuard, ReplayCacheService } from '@nlc-ai/api-auth';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, LandingTokenGuard, ReplayCacheService],
  exports: [LeadsService],
})
export class LeadsModule {}
