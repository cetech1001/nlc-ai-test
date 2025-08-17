import {NLCClientConfig} from "@nlc-ai/sdk-core";
import {UsersServiceClient} from "@nlc-ai/sdk-users";
import {AuthServiceClient} from "@nlc-ai/sdk-auth";
import {EmailServiceClient} from "@nlc-ai/sdk-email";
import {BillingServiceClient} from "@nlc-ai/sdk-billing";
import {CreateCoach} from "@nlc-ai/api-types";


export class NLCClient {
  public users: UsersServiceClient;
  public auth: AuthServiceClient;
  public email: EmailServiceClient;
  public billing: BillingServiceClient;

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
  }

  // Convenience methods for common workflows
  async createCoachWithSubscription(
    coachData: CreateCoach,
    planID: string,
    billingCycle: 'monthly' | 'annual'
  ) {
    // Create coach
    const coach = await this.users.createCoach(coachData);

    // Create subscription
    const subscription = await this.billing.createSubscription(
      coach.id,
      planID,
      billingCycle
    );

    return { coach, subscription };
  }

  async inviteAndConnectClient(
    email: string,
    coachID: string,
    message?: string
  ) {
    // Send invitation
    const invite = await this.users.inviteClient(email, coachID, message);

    return invite;
  }
}
