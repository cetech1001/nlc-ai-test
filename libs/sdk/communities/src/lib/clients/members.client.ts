import { BaseClient, Paginated, SearchQuery, FilterValues } from '@nlc-ai/sdk-core';
import {CommunityMember, AddMemberRequest, InviteMemberRequest} from '@nlc-ai/types';
import { ExtendedCommunityMember } from '../types';

export class MembersClient extends BaseClient {
  async addMember(communityID: string, data: AddMemberRequest): Promise<CommunityMember> {
    const response = await this.request<CommunityMember>(
      'POST',
      `/${communityID}/members`,
      { body: data }
    );
    return response.data!;
  }

  async getCommunityMembers(
    communityID: string,
    searchOptions: SearchQuery = {},
    filters: FilterValues = {}
  ): Promise<Paginated<ExtendedCommunityMember>> {
    const params = new URLSearchParams();
    const { page = 1, limit = 10, search } = searchOptions;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);

    if (filters.role && filters.role !== '') {
      params.append('role', filters.role);
    }

    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    if (filters.userType && filters.userType !== '') {
      params.append('userType', filters.userType);
    }

    if (filters.joinedDate) {
      if (filters.joinedDate.start) {
        params.append('joinedDateStart', filters.joinedDate.start);
      }
      if (filters.joinedDate.end) {
        params.append('joinedDateEnd', filters.joinedDate.end);
      }
    }

    if (filters.lastActiveDate) {
      if (filters.lastActiveDate.start) {
        params.append('lastActiveDateStart', filters.lastActiveDate.start);
      }
      if (filters.lastActiveDate.end) {
        params.append('lastActiveDateEnd', filters.lastActiveDate.end);
      }
    }

    const response = await this.request<Paginated<ExtendedCommunityMember>>(
      'GET',
      `/${communityID}/members?${params.toString()}`
    );
    return response.data!;
  }

  async getMyMembership(communityID: string): Promise<ExtendedCommunityMember> {
    const response = await this.request<ExtendedCommunityMember>(
      'GET',
      `/${communityID}/members/me`
    );
    return response.data!;
  }

  async getCommunityMemberStats(communityID: string): Promise<{
    totalMembers: number;
    activeMembers: number;
    owners: number;
    admins: number;
    moderators: number;
    regularMembers: number;
    suspendedMembers: number;
    pendingMembers: number;
  }> {
    const response = await this.request<{
      totalMembers: number;
      activeMembers: number;
      owners: number;
      admins: number;
      moderators: number;
      regularMembers: number;
      suspendedMembers: number;
      pendingMembers: number;
    }>('GET', `/${communityID}/members/stats`);
    return response.data!;
  }

  async removeMember(
    communityID: string,
    userID: string,
    userType: string
  ): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(
      'DELETE',
      `/${communityID}/members/${userID}/${userType}`
    );
    return response.data!;
  }

  async inviteMember(
    communityID: string,
    data: InviteMemberRequest
  ): Promise<any> {
    const response = await this.request<any>(
      'POST',
      `/${communityID}/members/invites`,
      { body: data }
    );
    return response.data!;
  }
}
