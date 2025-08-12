import { BaseAPI } from "./base";
import {CreatePlanRequest, Plan, PlanAnalytics, UpdatePlanRequest} from "@nlc-ai/types";

class PlansAPI extends BaseAPI {
  async getPlans(includeInactive = false, includeDeleted = false): Promise<Plan[]> {
    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', 'true');
    if (includeDeleted) params.append('includeDeleted', 'true');

    return this.makeRequest(`/plans?${params.toString()}`);
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

  async restorePlan(id: string): Promise<Plan> {
    return this.makeRequest(`/plans/${id}/restore`, {
      method: 'PATCH',
    });
  }
}

export const plansAPI = new PlansAPI();
