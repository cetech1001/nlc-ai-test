import { BaseClient } from "@nlc-ai/sdk-core";
import { NLCClientConfig } from "@nlc-ai/sdk-main";
import { AdminAnalyticsClient } from "./admin-analytics.client";
import { CoachAnalyticsClient } from "./coach-analytics.client";

export class AnalyticsClient extends BaseClient {
  public admin: AdminAnalyticsClient;
  public coach: CoachAnalyticsClient;

  constructor(config: NLCClientConfig) {
    super(config);

    this.admin = new AdminAnalyticsClient({
      ...config,
      baseURL: `${config.baseURL}/admin`,
    });

    this.coach = new CoachAnalyticsClient({
      ...config,
      baseURL: `${config.baseURL}/coach`,
    });
  }
}
