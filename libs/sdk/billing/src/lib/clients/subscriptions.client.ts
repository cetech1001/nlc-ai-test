import {BaseClient} from "@nlc-ai/sdk-core";

export class SubscriptionsClient extends BaseClient{
  async createSubscription(coachID: string, planID: string, billingCycle: string) {
    const response = await this.request('POST', '/', {
      body: { coachID, planID, billingCycle }
    });
    return response.data!;
  }
}
