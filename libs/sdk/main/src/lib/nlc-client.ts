import {NLCClientConfig} from "./nlc-client.types";
import {UsersClient} from "@nlc-ai/sdk-users";
import {AuthServiceClient} from "@nlc-ai/sdk-auth";
import {EmailServiceClient} from "@nlc-ai/sdk-email";
import {BillingClient} from "@nlc-ai/sdk-billing";
import {AnalyticsClient} from "@nlc-ai/sdk-analytics";
import {LeadsServiceClient} from "@nlc-ai/sdk-leads";
import {CommunityClient} from "@nlc-ai/sdk-community";
import {MediaServiceClient} from "@nlc-ai/sdk-media";
import {NotificationsServiceClient} from "@nlc-ai/sdk-notifications";
import {MessagingClient} from "../../../messaging";

export class NLCClient {
  public users: UsersClient;
  public auth: AuthServiceClient;
  public email: EmailServiceClient;
  public billing: BillingClient;
  public analytics: AnalyticsClient;
  public leads: LeadsServiceClient;
  public community: CommunityClient;
  public media: MediaServiceClient;
  public notifications: NotificationsServiceClient;
  public messaging: MessagingClient;

  constructor(config: NLCClientConfig) {
    const baseConfig = {
      apiKey: config.apiKey,
      timeout: config.timeout,
    };

    this.users = new UsersClient({
      ...baseConfig,
      baseURL: config.services?.users || `${config.baseURL}/users`,
    });

    this.auth = new AuthServiceClient({
      ...baseConfig,
      baseURL: config.services?.auth || `${config.baseURL}/auth`,
    });

    this.email = new EmailServiceClient({
      ...baseConfig,
      baseURL: config.services?.email || `${config.baseURL}/email`,
    });

    this.billing = new BillingClient({
      ...baseConfig,
      baseURL: config.services?.billing || `${config.baseURL}/billing`,
    });

    this.analytics = new AnalyticsClient({
      ...baseConfig,
      baseURL: config.services?.analytics || `${config.baseURL}/analytics`,
    });

    this.leads = new LeadsServiceClient({
      ...baseConfig,
      baseURL: config.services?.leads || `${config.baseURL}/leads`,
    });

    this.community = new CommunityClient({
      ...baseConfig,
      baseURL: config.services?.community || `${config.baseURL}/community`,
    });

    this.media = new MediaServiceClient({
      ...baseConfig,
      baseURL: config.services?.media || `${config.baseURL}/media`,
    });

    this.notifications = new NotificationsServiceClient({
      ...baseConfig,
      baseURL: config.services?.notifications || `${config.baseURL}/notifications`,
    });

    this.messaging = new MessagingClient({
      ...baseConfig,
      baseURL: config.services?.messaging || `${config.baseURL}/messages`,
    });
  }

  updateApiKey(apiKey: string | null) {
    const services = [
      this.users, this.auth, this.email, this.billing,
      this.analytics, this.leads, this.community,
      this.media, this.notifications, this.messaging
    ];

    services.forEach(service => {
      service.updateApiKey(apiKey);
    });
  }
}
