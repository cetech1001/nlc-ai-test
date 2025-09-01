import {BaseClient} from "@nlc-ai/sdk-core";
import {NLCClientConfig} from "@nlc-ai/sdk-main";
import {PlansClient} from "./plans.client";
import {PaymentsClient} from "./payments.client";
import {TransactionsClient} from "./transactions.client";


export class BillingClient extends BaseClient {
  public plans: PlansClient;
  public payments: PaymentsClient;
  public transactions: TransactionsClient;

  constructor(config: NLCClientConfig) {
    super(config);

    this.plans = new PlansClient({
      ...config,
      baseURL: `${config.baseURL}/plans`
    });

    this.payments = new PaymentsClient({
      ...config,
      baseURL: `${config.baseURL}/payments`
    });

    this.transactions = new TransactionsClient({
      ...config,
      baseURL: `${config.baseURL}/transactions`
    });
  }

  // Legacy subscription methods (keeping these for compatibility)
  async createSubscription(coachID: string, planID: string, billingCycle: string) {
    const response = await this.request('POST', '/billing/subscriptions', {
      body: { coachID, planID, billingCycle }
    });
    return response.data!;
  }

  async createPaymentLink(coachID: string, planID: string, amount: number) {
    const response = await this.request('POST', '/billing/payment-links', {
      body: { coachID, planID, amount }
    });
    return response.data!;
  }
}
