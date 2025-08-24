import {BaseClient, SearchQuery, Paginated, FilterValues} from "@nlc-ai/sdk-core";
import {
  ClientStats,
  ExtendedClient,
  CreateClient,
  UpdateClient
} from "./types";

export class ClientsClient extends BaseClient{
  async getClients(searchOptions: SearchQuery, filters: FilterValues): Promise<Paginated<ExtendedClient>> {
    const params = new URLSearchParams();
    const { page = 1, limit = 2, search } = searchOptions;

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

    const response = await this.request<Paginated<ExtendedClient>>(
      'GET',
      `/clients?${params.toString()}`
    );
    return response.data!;
  }

  async getClientStats(): Promise<ClientStats> {
    const response = await this.request<ClientStats>('GET', '/clients/stats');
    return response.data!;
  }

  async getClient(id: string): Promise<ExtendedClient> {
    const response = await this.request<ExtendedClient>('GET', `/clients/${id}`);
    return response.data!;
  }

  async createClient(data: CreateClient): Promise<ExtendedClient> {
    const response = await this.request<ExtendedClient>('POST', '/clients', { body: data });
    return response.data!;
  }

  async updateClient(id: string, data: UpdateClient): Promise<ExtendedClient> {
    const response = await this.request<ExtendedClient>('PATCH', `/clients/${id}`, { body: data });
    return response.data!;
  }

  async deleteClient(id: string): Promise<void> {
    await this.request('DELETE', `/clients/${id}`);
  }
}
