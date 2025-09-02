import {BaseClient} from "@nlc-ai/sdk-core";
import {Subscription, BillingCycle, CreateSubscriptionRequest} from "../types";

export class SubscriptionsClient extends BaseClient{
  async createSubscription(data: CreateSubscriptionRequest) {
    const response = await this.request<Subscription>('POST', '/', {
      body: data
    });
    return response.data!;
  }

  async getCurrentSubscription(subscriberID: string, subscriberType: string): Promise<Subscription | null> {
    const response = await this.request<Subscription | null>(
      'GET',
      `/current?subscriberID=${subscriberID}&subscriberType=${subscriberType}`
    );
    return response.data!;
  }

  async getSubscriptionHistory(subscriberID: string, subscriberType: string): Promise<Subscription[]> {
    const response = await this.request<Subscription[]>(
      'GET',
      `/history?subscriberID=${subscriberID}&subscriberType=${subscriberType}`
    );
    return response.data!;
  }

  async getSubscription(id: string): Promise<Subscription> {
    const response = await this.request<Subscription>('GET', `/${id}`);
    return response.data!;
  }

  async cancelSubscription(id: string, reason: string, feedback?: string): Promise<Subscription> {
    const response = await this.request<Subscription>('PATCH', `/${id}/cancel`, {
      body: { reason, feedback }
    });
    return response.data!;
  }

  async reactivateSubscription(id: string): Promise<Subscription> {
    const response = await this.request<Subscription>('PATCH', `/${id}/reactivate`);
    return response.data!;
  }

  async updateBillingCycle(id: string, billingCycle: BillingCycle): Promise<Subscription> {
    const response = await this.request<Subscription>('PATCH', `/${id}/billing-cycle`, {
      body: { billingCycle }
    });
    return response.data!;
  }
}
