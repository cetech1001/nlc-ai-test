import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LandingTokenGuard } from '../auth/guards/landing-token.guard';
import { ReplayCacheService } from '../auth/guards/replay-cache.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, LandingTokenGuard, ReplayCacheService],
})
export class LeadsModule {}
