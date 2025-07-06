import { BaseAPI } from "@nlc-ai/api-client";

export interface Plan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  maxClients?: number;
  maxAiAgents?: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
    transactions: number;
  };
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  maxClients?: number;
  maxAiAgents?: number;
  features?: string[];
  isActive?: boolean;
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}

export interface PlanAnalytics {
  plan: Plan;
  analytics: {
    totalRevenue: number;
    activeSubscriptions: number;
    totalSubscriptions: number;
    conversionRate: number;
  };
}

class PlansAPI extends BaseAPI {
  async getPlans(includeInactive = false): Promise<Plan[]> {
    return this.makeRequest(`/plans?includeInactive=${includeInactive}`);
  }

  async getPlan(id: string): Promise<Plan> {
    return this.makeRequest(`/plans/${id}`);
  }

  async createPlan(data: CreatePlanRequest): Promise<Plan> {
    return this.makeRequest('/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlan(id: string, data: UpdatePlanRequest): Promise<Plan> {
    return this.makeRequest(`/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePlan(id: string): Promise<{ message: string }> {
    return this.makeRequest(`/plans/${id}`, {
      method: 'DELETE',
    });
  }

  async togglePlanStatus(id: string): Promise<Plan> {
    return this.makeRequest(`/plans/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async getPlanAnalytics(id: string): Promise<PlanAnalytics> {
    return this.makeRequest(`/plans/${id}/analytics`);
  }
}

export const plansAPI = new PlansAPI();
