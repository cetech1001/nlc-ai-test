import {NLCClientConfig} from "./nlc-client.types";
import {UsersClient} from "@nlc-ai/sdk-users";
import {AuthServiceClient} from "@nlc-ai/sdk-auth";
import {EmailClient} from "@nlc-ai/sdk-email";
import {BillingClient} from "@nlc-ai/sdk-billing";
import {AnalyticsClient} from "@nlc-ai/sdk-analytics";
import {LeadsServiceClient} from "@nlc-ai/sdk-leads";
import {CommunitiesClient} from "@nlc-ai/sdk-communities";
import {MediaServiceClient} from "@nlc-ai/sdk-media";
import {NotificationsServiceClient} from "@nlc-ai/sdk-notifications";
import {MessagesClient} from "@nlc-ai/sdk-messages";
import {AgentsClient} from "@nlc-ai/sdk-agents";
import {CoursesClient} from "@nlc-ai/sdk-courses";
import {IntegrationsClient} from "@nlc-ai/sdk-integrations";


export class NLCClient {
  public users: UsersClient;
  public auth: AuthServiceClient;
  public agents: AgentsClient;
  public email: EmailClient;
  public billing: BillingClient;
  public analytics: AnalyticsClient;
  public leads: LeadsServiceClient;
  public communities: CommunitiesClient;
  public media: MediaServiceClient;
  public notifications: NotificationsServiceClient;
  public messages: MessagesClient;
  public courses: CoursesClient;
  public integrations: IntegrationsClient;

  constructor(config: NLCClientConfig) {
    const baseConfig = {
      apiKey: config.apiKey,
      leadsPublicToken: config.leadsPublicToken,
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

    this.leads = new LeadsServiceClient({
      ...baseConfig,
      baseURL: config.services?.leads || `${config.baseURL}/leads`,
    });

    this.communities = new CommunitiesClient({
      ...baseConfig,
      baseURL: config.services?.communities || `${config.baseURL}/communities`,
    });

    this.media = new MediaServiceClient({
      ...baseConfig,
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
  }

  updateApiKey(apiKey: string | null) {
    const services = [
      this.users, this.auth, this.email, this.billing,
      this.analytics, this.leads, this.communities,
      this.media, this.notifications, this.messages
    ];

    services.forEach(service => {
      service.updateApiKey(apiKey);
    });
  }
}
