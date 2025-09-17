import {BaseClient, FilterValues, Paginated, SearchQuery} from "@nlc-ai/sdk-core";
import {ExtendedClient} from "../types";

export class RelationshipClient extends BaseClient{
  async getClientInvites(searchOptions: SearchQuery, filters: FilterValues): Promise<Paginated<ExtendedClient>> {
    const params = new URLSearchParams();
    const { page = 1, limit = 2, search } = searchOptions;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('email', search);

    if (filters.coachID) {
      params.append('coachID', filters.coachID);
    }

    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    const response = await this.request<Paginated<ExtendedClient>>(
      'GET',
      `/invites?${params.toString()}`
    );
    return response.data!;
  }

  async inviteClient(email: string, coachID?: string, message?: string) {
    const response = await this.request('POST', '/invites', {
      body: { email, coachID, message }
    });
    return response.data!;
  }

  async resendClientInvite(id: string) {
    const response = await this.request<{ message: string }>('PATCH', `/invites/${id}/resend`);
    return response.data!;
  }

  async deleteClientInvite(id: string) {
    const response = await this.request<{ message: string }>('DELETE', `/invites/${id}`);
    return response.data!;
  }
}
