import { Module } from '@nestjs/common';
import { AdminAnalyticsModule } from './admin/admin-analytics.module';
import {CoachAnalyticsModule} from "./coach/coach-analytics.module";
import {CommunityAnalyticsModule} from "./community/community-analytics.module";

@Module({
  imports: [
    AdminAnalyticsModule,
    CoachAnalyticsModule,
    CommunityAnalyticsModule
  ],
})
export class AnalyticsModule {}
