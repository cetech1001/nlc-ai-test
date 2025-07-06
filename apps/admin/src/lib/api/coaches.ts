import { BaseAPI } from "@nlc-ai/api-client";

export type CoachStatus = 'active' | 'inactive' | 'blocked';

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessName?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  status: CoachStatus;
  currentPlan?: string;
  subscriptionStatus?: string;
}

export interface CoachDetails extends Coach {
  subscriptions: Array<{
    id: string;
    status: string;
    billingCycle: string;
    plan: {
      name: string;
      description?: string;
    };
  }>;
  clients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    plan: {
      name: string;
    };
  }>;
}

export interface CoachStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
}

export interface PaginatedCoaches {
  data: Coach[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class CoachesAPI extends BaseAPI{
  async getCoaches(
    page = 1,
    limit = 10,
    status?: CoachStatus,
    search?: string
  ): Promise<PaginatedCoaches> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) params.append('status', status);
    if (search) params.append('search', search);

    return this.makeRequest(`/coaches?${params.toString()}`);
  }

  async getInactiveCoaches(
    page = 1,
    limit = 10,
    search?: string
  ): Promise<PaginatedCoaches> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);

    return this.makeRequest(`/coaches/inactive?${params.toString()}`);
  }

  async getCoach(id: string): Promise<CoachDetails> {
    return this.makeRequest(`/coaches/${id}`);
  }

  async getCoachStats(): Promise<CoachStats> {
    return this.makeRequest('/coaches/stats');
  }

  async toggleCoachStatus(id: string): Promise<Coach> {
    return this.makeRequest(`/coaches/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async deleteCoach(id: string): Promise<{ message: string }> {
    return this.makeRequest(`/coaches/${id}`, {
      method: 'DELETE',
    });
  }

  async getCoachKpis(id: string, days = 30): Promise<{
    totalClients: number;
    activeClients: number;
    recentInteractions: number;
    tokensUsed: number;
  }> {
    return this.makeRequest(`/coaches/${id}/kpis?days=${days}`);
  }
}

export const coachesAPI = new CoachesAPI();
