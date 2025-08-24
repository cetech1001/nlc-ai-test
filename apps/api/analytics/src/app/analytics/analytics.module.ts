import { Module } from '@nestjs/common';
import { AdminAnalyticsModule } from './admin/admin-analytics.module';
import {CoachAnalyticsModule} from "./coach/coach-analytics.module";

@Module({
  imports: [AdminAnalyticsModule, CoachAnalyticsModule],
})
export class AnalyticsModule {}
