import {BaseClient} from "@nlc-ai/sdk-core";
import {Paginated} from "@nlc-ai/types";
import {NLCClientConfig} from "@nlc-ai/sdk-main";
import {PlansClient} from "./plans.client";

export class BillingClient extends BaseClient {
  public plans: PlansClient;

  constructor(config: NLCClientConfig) {
    super(config);

    this.plans = new PlansClient({
      ...config,
      baseURL: `${config.baseURL}/plans`
    });
  }


  // Transactions methods
  async getTransactions(
    page = 1,
    limit = 10,
    filters?: any,
    search?: string
  ): Promise<Paginated<any>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (search) params.append('search', search);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<any>>('GET', `/billing/transactions?${params}`);
    return response.data!;
  }

  async downloadTransaction(transactionID: string) {
    const response = await this.request('GET', `/billing/transactions/${transactionID}/download`);
    return response.data!;
  }

  // Revenue methods
  async getRevenueStats() {
    const response = await this.request('GET', '/billing/revenue/stats');
    return response.data!;
  }

  async getRevenueByPeriod(period: 'week' | 'month' | 'year') {
    const response = await this.request('GET', `/billing/revenue/${period}`);
    return response.data!;
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
