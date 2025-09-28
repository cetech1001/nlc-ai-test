import { BaseAPI } from './base';
import {
  CoachPaymentRequest, CoachPaymentRequestStats, CoachStats,
  CoachWithStatus, Paginated,
} from "@nlc-ai/types";
import {ExtendedCoach} from "@nlc-ai/sdk-users";

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

    return this.makeRequest(`/users/coaches?${params.toString()}`);
  }

  async getCoachStats(): Promise<CoachStats> {
    return this.makeRequest('/users/coaches/stats');
  }

  async getCoach(id: string): Promise<CoachWithStatus> {
    return this.makeRequest(`/users/coaches/${id}`);
  }

  async getCoachKpis(id: string, days = 30) {
    return this.makeRequest(`/users/coaches/${id}/kpis?days=${days}`);
  }

  async toggleCoachStatus(id: string): Promise<ExtendedCoach> {
    return this.makeRequest(`/users/coaches/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async deleteCoach(id: string): Promise<ExtendedCoach> {
    return this.makeRequest(`/users/coaches/${id}`, {
      method: 'DELETE',
    });
  }

  async updateCoach(id: string, data: Partial<ExtendedCoach>): Promise<ExtendedCoach> {
    return this.makeRequest(`/users/coaches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createCoach(data: Omit<ExtendedCoach, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ExtendedCoach> {
    return this.makeRequest('/users/coaches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async restoreCoach(id: string): Promise<ExtendedCoach> {
    return this.makeRequest(`/users/coaches/${id}/restore`, {
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

    return this.makeRequest(`/users/coaches/${coachID}/payment-requests?${params.toString()}`);
  }

  async getCoachPaymentRequestStats(coachID: string): Promise<CoachPaymentRequestStats> {
    return this.makeRequest(`/users/coaches/${coachID}/payment-requests/stats`);
  }
}

export const coachesAPI = new CoachesAPI();
