import {Module} from "@nestjs/common";
import {CommunityAnalyticsController} from "./community-analytics.controller";
import {CommunityAnalyticsService} from "./community-analytics.service";

@Module({
  controllers: [CommunityAnalyticsController],
  providers: [CommunityAnalyticsService],
  exports: [CommunityAnalyticsService],
})
export class CommunityAnalyticsModule {}
