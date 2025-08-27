import {BaseClient, SearchQuery, FilterValues, Paginated} from "@nlc-ai/sdk-core";
import {ExtendedCoach, CreateCoach, UpdateCoach} from "../types";

export class CoachesClient extends BaseClient{
  async getCoaches(searchOptions: SearchQuery = {}, filters: FilterValues = {}) {
    const params = new URLSearchParams();
    const { page = 1, search, limit = 10 } = searchOptions;

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

    const response = await this.request<Paginated<ExtendedCoach>>(
      'GET',
      `?${params.toString()}`
    );
    return response.data!;
  }

  async getCoach(id: string): Promise<ExtendedCoach> {
    const response = await this.request<ExtendedCoach>('GET', `/${id}`);
    return response.data!;
  }

  async createCoach(data: CreateCoach): Promise<ExtendedCoach> {
    const response = await this.request<ExtendedCoach>('POST', '', { body: data });
    return response.data!;
  }

  async updateCoach(id: string, data: UpdateCoach): Promise<ExtendedCoach> {
    const response = await this.request<ExtendedCoach>('PATCH', `/${id}`, { body: data });
    return response.data!;
  }

  async toggleCoachStatus(id: string): Promise<ExtendedCoach> {
    const response = await this.request<ExtendedCoach>('PATCH', `/${id}/toggle-status`);
    return response.data!;
  }

  async connectClientToCoach(clientID: string, coachID: string, notes?: string) {
    const response = await this.request('POST', '/relationships', {
      body: { clientID, coachID, notes }
    });
    return response.data!;
  }

  async inviteClient(email: string, coachID?: string, message?: string) {
    const response = await this.request('POST', '/invites', {
      body: { email, coachID, message }
    });
    return response.data!;
  }
}
