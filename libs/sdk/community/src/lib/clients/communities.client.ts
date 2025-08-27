import {BaseClient, Paginated} from '@nlc-ai/sdk-core';
import {
  CommunityFilters,
  CommunityResponse,
  CreateCommunityRequest,
  UpdateCommunityRequest,
  AddMemberRequest,
  CommunityType,
  CommunityMember, ExtendedCommunityMember,
} from '../types';

export class CommunitiesClient extends BaseClient {
  async getCommunities(filters?: CommunityFilters): Promise<Paginated<CommunityResponse>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<CommunityResponse>>(
      'GET',
      `?${searchParams}`
    );
    return response.data!;
  }

  async getCommunity(id: string): Promise<CommunityResponse> {
    const response = await this.request<CommunityResponse>('GET', `/${id}`);
    return response.data!;
  }

  async getCoachToCommunity(): Promise<CommunityResponse> {
    const response = await this.request<Paginated<CommunityResponse>>(
      'GET',
      `?type=${CommunityType.COACH_TO_COACH}&memberOf=true&limit=1`
    );

    if (response.data!.data.length === 0) {
      throw new Error('Coach-to-coach community not found');
    }

    return response.data!.data[0];
  }

  async createCommunity(data: CreateCommunityRequest): Promise<CommunityResponse> {
    const response = await this.request<CommunityResponse>('POST', '', { body: data });
    return response.data!;
  }

  async updateCommunity(id: string, data: UpdateCommunityRequest): Promise<CommunityResponse> {
    const response = await this.request<CommunityResponse>('PUT', `/${id}`, { body: data });
    return response.data!;
  }

  async addMember(communityID: string, data: AddMemberRequest): Promise<CommunityMember> {
    const response = await this.request<CommunityMember>('POST', `/${communityID}/members`, { body: data });
    return response.data!;
  }

  async removeMember(communityID: string, userID: string, userType: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('DELETE', `/${communityID}/members/${userID}/${userType}`);
    return response.data!;
  }

  async getCommunityMembers(communityID: string, page = 1, limit = 20): Promise<Paginated<ExtendedCommunityMember>> {
    const response = await this.request<Paginated<ExtendedCommunityMember>>(
      'GET',
      `/${communityID}/members?page=${page}&limit=${limit}`
    );
    return response.data!;
  }
}
