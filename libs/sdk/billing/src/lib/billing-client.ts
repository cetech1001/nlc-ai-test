import {BaseClient} from "@nlc-ai/sdk-core";
import {Paginated} from "@nlc-ai/types";

export class BillingServiceClient extends BaseClient {
  // Plans methods
  async getPlans(includeInactive = false, includeDeleted = false) {
    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', 'true');
    if (includeDeleted) params.append('includeDeleted', 'true');

    const response = await this.request('GET', `/billing/plans?${params}`);
    return response.data!;
  }

  async getPlan(planID: string) {
    const response = await this.request('GET', `/billing/plans/${planID}`);
    return response.data!;
  }

  async createPlan(data: any) {
    const response = await this.request('POST', '/billing/plans', { body: data });
    return response.data!;
  }

  async updatePlan(planID: string, data: any) {
    const response = await this.request('PATCH', `/billing/plans/${planID}`, { body: data });
    return response.data!;
  }

  async deletePlan(planID: string) {
    const response = await this.request('DELETE', `/billing/plans/${planID}`);
    return response.data!;
  }

  async restorePlan(planID: string) {
    const response = await this.request('POST', `/billing/plans/${planID}/restore`);
    return response.data!;
  }

  async togglePlanStatus(planID: string) {
    const response = await this.request('PATCH', `/billing/plans/${planID}/toggle-status`);
    return response.data!;
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
