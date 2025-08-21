import {NLCClientConfig} from "./nlc-client.types";
import {UsersServiceClient} from "@nlc-ai/sdk-users";
import {AuthServiceClient} from "@nlc-ai/sdk-auth";
import {EmailServiceClient} from "@nlc-ai/sdk-email";
import {BillingServiceClient} from "@nlc-ai/sdk-billing";
import {AnalyticsServiceClient} from "@nlc-ai/sdk-analytics";
import {LeadsServiceClient} from "@nlc-ai/sdk-leads";
import {CommunityServiceClient} from "@nlc-ai/sdk-community";
import {MediaServiceClient} from "@nlc-ai/sdk-media";
import {NotificationsServiceClient} from "@nlc-ai/sdk-notifications";


export class NLCClient {
  public users: UsersServiceClient;
  public auth: AuthServiceClient;
  public email: EmailServiceClient;
  public billing: BillingServiceClient;
  public analytics: AnalyticsServiceClient;
  public leads: LeadsServiceClient;
  public community: CommunityServiceClient;
  public media: MediaServiceClient;
  public notifications: NotificationsServiceClient;

  constructor(config: NLCClientConfig) {
    const baseConfig = {
      apiKey: config.apiKey,
      timeout: config.timeout,
    };

    this.users = new UsersServiceClient({
      ...baseConfig,
      baseURL: config.services?.users || `${config.baseURL}/api/users`,
    });

    this.auth = new AuthServiceClient({
      ...baseConfig,
      baseURL: config.services?.auth || `${config.baseURL}/api/auth`,
    });

    this.email = new EmailServiceClient({
      ...baseConfig,
      baseURL: config.services?.email || `${config.baseURL}/api/email`,
    });

    this.billing = new BillingServiceClient({
      ...baseConfig,
      baseURL: config.services?.billing || `${config.baseURL}/api/billing`,
    });

    this.analytics = new AnalyticsServiceClient({
      ...baseConfig,
      baseURL: config.services?.analytics || `${config.baseURL}/api/analytics`,
    });

    this.leads = new LeadsServiceClient({
      ...baseConfig,
      baseURL: config.services?.leads || `${config.baseURL}/api/leads`,
    });

    this.community = new CommunityServiceClient({
      ...baseConfig,
      baseURL: config.services?.community || `${config.baseURL}/api/community`,
    });

    this.media = new MediaServiceClient({
      ...baseConfig,
      baseURL: config.services?.media || `${config.baseURL}/api/media`,
    });

    this.notifications = new NotificationsServiceClient({
      ...baseConfig,
      baseURL: config.services?.notifications || `${config.baseURL}/api/notifications`,
    });
  }
}
