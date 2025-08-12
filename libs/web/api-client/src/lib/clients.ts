import { BaseAPI } from './base';
import {
  Client,
  ClientWithDetails,
  ClientStats,
  Paginated,
  CreateClient,
  UpdateClient,
} from "@nlc-ai/types";

class ClientsAPI extends BaseAPI {
  async getClients(
    page = 1,
    limit = 10,
    filters: Record<string, any> = {},
    search = ''
  ): Promise<Paginated<ClientWithDetails>> {
    const params = new URLSearchParams();

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);

    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    if (filters.coursesBought && filters.coursesBought !== '') {
      params.append('coursesBought', filters.coursesBought);
    }

    if (filters.dateJoined) {
      if (filters.dateJoined.start) {
        params.append('dateJoinedStart', filters.dateJoined.start);
      }
      if (filters.dateJoined.end) {
        params.append('dateJoinedEnd', filters.dateJoined.end);
      }
    }

    if (filters.lastInteraction) {
      if (filters.lastInteraction.start) {
        params.append('lastInteractionStart', filters.lastInteraction.start);
      }
      if (filters.lastInteraction.end) {
        params.append('lastInteractionEnd', filters.lastInteraction.end);
      }
    }

    return this.makeRequest(`/clients?${params.toString()}`);
  }

  async getClientStats(): Promise<ClientStats> {
    return this.makeRequest('/clients/stats');
  }

  async getClient(id: string): Promise<ClientWithDetails> {
    return this.makeRequest(`/clients/${id}`);
  }

  async createClient(data: CreateClient): Promise<Client> {
    return this.makeRequest('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: string, data: UpdateClient): Promise<Client> {
    return this.makeRequest(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string): Promise<Client> {
    return this.makeRequest(`/clients/${id}`, {
      method: 'DELETE',
    });
  }
}

export const clientsAPI = new ClientsAPI();
