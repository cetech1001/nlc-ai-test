import {BaseClient} from "@nlc-ai/sdk-core";
import {AiAgent, Plan, CreatePlanRequest} from "../types";

export class PlansClient extends BaseClient{
  async getPlans(includeInactive = false, includeDeleted = false) {
    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', 'true');
    if (includeDeleted) params.append('includeDeleted', 'true');

    const response = await this.request<Plan[]>('GET', `?${params}`);
    return response.data!;
  }

  async getPlan(planID: string) {
    const response = await this.request<Plan>('GET', `/${planID}`);
    return response.data!;
  }

  async createPlan(data: CreatePlanRequest) {
    const response = await this.request('POST', '', { body: data });
    return response.data!;
  }

  async updatePlan(planID: string, data: any) {
    const response = await this.request('PUT', `/${planID}`, { body: data });
    return response.data!;
  }

  async deletePlan(planID: string) {
    const response = await this.request('DELETE', `/${planID}`);
    return response.data!;
  }

  async restorePlan(planID: string) {
    const response = await this.request('POST', `/${planID}/restore`);
    return response.data!;
  }

  async togglePlanStatus(planID: string) {
    const response = await this.request('PATCH', `/${planID}/toggle-status`);
    return response.data!;
  }

  async getAllAiAgents() {
    const response = await this.request<AiAgent[]>('GET', '/ai-agents');
    return response.data!;
  }
}
