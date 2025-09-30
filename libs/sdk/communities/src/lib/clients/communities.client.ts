import {BaseClient, Paginated, SearchQuery, FilterValues} from '@nlc-ai/sdk-core';
import {CommunityResponse} from "@nlc-ai/types";
import {
  CommunityFilters,
  CreateCommunityRequest,
  UpdateCommunityRequest,
  AddMemberRequest,
  CommunityType,
  CommunityMember,
  CommunityActivity,
  CommunityDetailStats
} from '@nlc-ai/types';
import {ExtendedCommunityMember, MemberStats} from "../types";

import {ModerationClient} from "./moderation.client";
import {PostsClient} from "./posts.client";
import {NLCClientConfig} from "@nlc-ai/sdk-main";
import { CommentsClient } from "./comments.client";

export class CommunitiesClient extends BaseClient {
  public moderation: ModerationClient;
  public posts: PostsClient;
  public comments: CommentsClient;

  constructor(config: NLCClientConfig) {
    super(config);

    this.posts = new PostsClient(config);
    this.moderation = new ModerationClient(config);
    this.comments = new CommentsClient(config);
  }

  override updateApiKey(apiKey: string | null) {
    const services = [
      this.posts, this.moderation, this.comments
    ];

    services.forEach(service => {
      service.updateApiKey(apiKey);
    });
  }

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

  async getCommunityBySlug(slug: string): Promise<CommunityResponse> {
    const response = await this.request<CommunityResponse>('GET', `/slug/${slug}`);
    return response.data!;
  }

  async getCoachCommunity(coachID: string) {
    const response = await this.request<CommunityResponse>('GET', `/coach/${coachID}`);
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

  async getCommunityActivity(communityID: string, limit: number = 10): Promise<CommunityActivity[]> {
    const response = await this.request<CommunityActivity[]>(
      'GET',
      `/${communityID}/activity?limit=${limit}`
    );
    return response.data!;
  }

  async getCommunityAnalytics(communityID: string, period: '7d' | '30d' | '90d' = '30d') {
    const response = await this.request<CommunityDetailStats>('GET', `/${communityID}/analytics?period=${period}`);
    return response.data!;
  }

  async getCommunityMemberStats(communityID: string): Promise<MemberStats> {
    return {
      totalMembers: 89,
      activeMembers: 82,
      owners: 1,
      admins: 2,
      moderators: 5,
      regularMembers: 74,
      suspendedMembers: 3,
      pendingMembers: 4,
    };
  }
}
