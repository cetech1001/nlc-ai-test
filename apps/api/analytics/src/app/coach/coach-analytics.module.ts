import { Module } from '@nestjs/common';
import { CoachAnalyticsController } from './coach-analytics.controller';
import { CoachAnalyticsService } from './coach-analytics.service';

@Module({
  controllers: [CoachAnalyticsController],
  providers: [CoachAnalyticsService],
  exports: [CoachAnalyticsService],
})
export class CoachAnalyticsModule {}
