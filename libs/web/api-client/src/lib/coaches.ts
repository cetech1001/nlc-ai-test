import { BaseAPI } from './base';
import {
  Coach, CoachPaymentRequest, CoachPaymentRequestStats, CoachStats,
  CoachWithStatus, Paginated,
} from "@nlc-ai/types";

class CoachesAPI extends BaseAPI {
  async getCoaches(
    page = 1,
    limit = 10,
    filters: Record<string, any> = {},
    search = ''
  ): Promise<Paginated<CoachWithStatus>> {
    const params = new URLSearchParams();

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);

    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    if (filters.subscriptionPlan && Array.isArray(filters.subscriptionPlan) && filters.subscriptionPlan.length > 0) {
      params.append('subscriptionPlan', filters.subscriptionPlan.join(','));
    }

    if (filters.dateJoined) {
      if (filters.dateJoined.start) {
        params.append('dateJoinedStart', filters.dateJoined.start);
      }
      if (filters.dateJoined.end) {
        params.append('dateJoinedEnd', filters.dateJoined.end);
      }
    }

    if (filters.lastActive) {
      if (filters.lastActive.start) {
        params.append('lastActiveStart', filters.lastActive.start);
      }
      if (filters.lastActive.end) {
        params.append('lastActiveEnd', filters.lastActive.end);
      }
    }

    if (filters.isVerified && filters.isVerified !== '') {
      params.append('isVerified', filters.isVerified);
    }

    if (filters.includeDeleted && filters.includeDeleted !== '') {
      params.append('includeDeleted', filters.includeDeleted);
    }

    return this.makeRequest(`/coaches?${params.toString()}`);
  }

  async getCoachStats(): Promise<CoachStats> {
    return this.makeRequest('/coaches/stats');
  }

  async getCoach(id: string): Promise<CoachWithStatus> {
    return this.makeRequest(`/coaches/${id}`);
  }

  async getCoachKpis(id: string, days = 30) {
    return this.makeRequest(`/coaches/${id}/kpis?days=${days}`);
  }

  async toggleCoachStatus(id: string): Promise<Coach> {
    return this.makeRequest(`/coaches/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async deleteCoach(id: string): Promise<Coach> {
    return this.makeRequest(`/coaches/${id}`, {
      method: 'DELETE',
    });
  }

  async updateCoach(id: string, data: Partial<Coach>): Promise<Coach> {
    return this.makeRequest(`/coaches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createCoach(data: Omit<Coach, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Coach> {
    return this.makeRequest('/coaches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async restoreCoach(id: string): Promise<Coach> {
    return this.makeRequest(`/coaches/${id}/restore`, {
      method: 'PATCH',
    });
  }

  async getCoachPaymentRequests(
    coachID: string,
    page = 1,
    limit = 10,
    filters: Record<string, any> = {},
    search?: string
  ): Promise<Paginated<CoachPaymentRequest>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);

    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    return this.makeRequest(`/coaches/${coachID}/payment-requests?${params.toString()}`);
  }

  async getCoachPaymentRequestStats(coachID: string): Promise<CoachPaymentRequestStats> {
    return this.makeRequest(`/coaches/${coachID}/payment-requests/stats`);
  }
}

export const coachesAPI = new CoachesAPI();
