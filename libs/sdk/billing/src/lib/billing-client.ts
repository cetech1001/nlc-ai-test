import {BaseServiceClient} from "@nlc-ai/sdk-core";

export class BillingServiceClient extends BaseServiceClient {
  async getPlans() {
    const response = await this.request('GET', '/billing/plans');
    return response.data!;
  }

  async createSubscription(coachID: string, planID: string, billingCycle: string) {
    const response = await this.request('POST', '/billing/subscriptions', {
      body: { coachID, planID, billingCycle }
    });
    return response.data!;
  }

  async getTransactions(coachID: string, params?: any) {
    const searchParams = new URLSearchParams({ coachID, ...params });
    const response = await this.request('GET', `/billing/transactions?${searchParams}`);
    return response.data!;
  }

  async createPaymentLink(coachID: string, planID: string, amount: number) {
    const response = await this.request('POST', '/billing/payment-links', {
      body: { coachID, planID, amount }
    });
    return response.data!;
  }
}
