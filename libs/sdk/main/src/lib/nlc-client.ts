import {NLCClientConfig} from "./nlc-client.types";
import {UsersClient} from "@nlc-ai/sdk-users";
import {AuthClient} from "@nlc-ai/sdk-auth";
import {EmailClient} from "@nlc-ai/sdk-email";
import {BillingClient} from "@nlc-ai/sdk-billing";
import {AnalyticsClient} from "@nlc-ai/sdk-analytics";
import {LeadsClient} from "@nlc-ai/sdk-leads";
import {CommunitiesClient} from "@nlc-ai/sdk-communities";
import {MediaClient} from "@nlc-ai/sdk-media";
import {NotificationsServiceClient} from "@nlc-ai/sdk-notifications";
import {MessagesClient} from "@nlc-ai/sdk-messages";
import {AgentsClient} from "@nlc-ai/sdk-agents";
import {CoursesClient} from "@nlc-ai/sdk-courses";
import {IntegrationsClient} from "@nlc-ai/sdk-integrations";
import {ContentClient} from "@nlc-ai/sdk-content";


export class NLCClient {
  public users: UsersClient;
  public auth: AuthClient;
  public agents: AgentsClient;
  public email: EmailClient;
  public billing: BillingClient;
  public analytics: AnalyticsClient;
  public leads: LeadsClient;
  public communities: CommunitiesClient;
  public media: MediaClient;
  public notifications: NotificationsServiceClient;
  public messages: MessagesClient;
  public courses: CoursesClient;
  public integrations: IntegrationsClient;
  public content: ContentClient;

  constructor(config: NLCClientConfig) {
    const baseConfig = {
      apiKey: config.apiKey,
      antiSpamToken: config.antiSpamToken,
      timeout: config.timeout,
    };

    this.users = new UsersClient({
      ...baseConfig,
      baseURL: config.services?.users || `${config.baseURL}/users`,
    });

    this.auth = new AuthClient({
      ...baseConfig,
      baseURL: config.services?.auth || `${config.baseURL}/auth`,
    });

    this.email = new EmailClient({
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

    this.leads = new LeadsClient({
      ...baseConfig,
      baseURL: config.services?.leads || `${config.baseURL}/leads`,
    });

    this.communities = new CommunitiesClient({
      ...baseConfig,
      baseURL: config.services?.communities || `${config.baseURL}/communities`,
    });

    this.media = new MediaClient({
      ...baseConfig,
      timeout: 900000,
      baseURL: config.services?.media || `${config.baseURL}/media`,
    });

    this.notifications = new NotificationsServiceClient({
      ...baseConfig,
      baseURL: config.services?.notifications || `${config.baseURL}/notifications`,
    });

    this.messages = new MessagesClient({
      ...baseConfig,
      baseURL: config.services?.messages || `${config.baseURL}/messages`,
    });

    this.courses = new CoursesClient({
      ...baseConfig,
      baseURL: config.services?.courses || `${config.baseURL}/courses`,
    });

    this.agents = new AgentsClient({
      ...baseConfig,
      baseURL: config.services?.agents || `${config.baseURL}/agents`,
    });

    this.integrations = new IntegrationsClient({
      ...baseConfig,
      baseURL: config.services?.integrations || `${config.baseURL}/integrations`,
    });

    this.content = new ContentClient({
      ...baseConfig,
      baseURL: config.services?.content || `${config.baseURL}/content`,
    });
  }

  updateApiKey(apiKey: string | null) {
    const services = [
      this.users, this.auth, this.email, this.billing,
      this.analytics, this.leads, this.communities,
      this.media, this.notifications, this.messages,
      this.agents, this.content, this.integrations, this.courses,
    ];

    services.forEach(service => {
      service.updateApiKey(apiKey);
    });
  }
}
