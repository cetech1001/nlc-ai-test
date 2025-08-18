import { BaseServiceClient } from '@nlc-ai/sdk-core';
import {
  CreateClient,
  UpdateClient,
  ClientQueryParams,
  ClientWithDetails,
  CreateCoach,
  CoachQueryParams,
  CoachWithStatus,
  Paginated,
  ClientStats,
} from '@nlc-ai/api-types';

export class UsersServiceClient extends BaseServiceClient {
  // Client methods
  async getClients(params?: ClientQueryParams): Promise<Paginated<ClientWithDetails>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<ClientWithDetails>>(
      'GET',
      `/clients?${searchParams}`
    );
    return response.data!;
  }

  async getClientStats(): Promise<ClientStats> {
    const response = await this.request<ClientStats>('GET', '/clients/stats');
    return response.data!;
  }

  async getClient(id: string): Promise<ClientWithDetails> {
    const response = await this.request<ClientWithDetails>('GET', `/clients/${id}`);
    return response.data!;
  }

  async createClient(data: CreateClient): Promise<ClientWithDetails> {
    const response = await this.request<ClientWithDetails>('POST', '/clients', { body: data });
    return response.data!;
  }

  async updateClient(id: string, data: UpdateClient): Promise<ClientWithDetails> {
    const response = await this.request<ClientWithDetails>('PATCH', `/clients/${id}`, { body: data });
    return response.data!;
  }

  async deleteClient(id: string): Promise<void> {
    await this.request('DELETE', `/clients/${id}`);
  }

  // Coach methods
  async getCoaches(params?: CoachQueryParams): Promise<Paginated<CoachWithStatus>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<CoachWithStatus>>(
      'GET',
      `/coaches?${searchParams}`
    );
    return response.data!;
  }

  async getCoach(id: string): Promise<CoachWithStatus> {
    const response = await this.request<CoachWithStatus>('GET', `/coaches/${id}`);
    return response.data!;
  }

  async createCoach(data: CreateCoach): Promise<CoachWithStatus> {
    const response = await this.request<CoachWithStatus>('POST', '/coaches', { body: data });
    return response.data!;
  }

  async toggleCoachStatus(id: string): Promise<CoachWithStatus> {
    const response = await this.request<CoachWithStatus>('PATCH', `/coaches/${id}/toggle-status`);
    return response.data!;
  }

  // Relationship methods
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

  // Analytics methods
  async getPlatformAnalytics(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await this.request('GET', `/analytics/platform?${params}`);
    return response.data!;
  }

  async getCoachAnalytics(coachID: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await this.request('GET', `/analytics/coach/${coachID}/detailed?${params}`);
    return response.data!;
  }
}
