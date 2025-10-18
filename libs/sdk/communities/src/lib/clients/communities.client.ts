import { BaseClient, Paginated } from '@nlc-ai/sdk-core';
import { CommunityResponse } from "@nlc-ai/types";
import {
  CommunityFilters,
  CreateCommunityRequest,
  UpdateCommunityRequest,
  CommunityActivity,
  CommunityDetailStats
} from '@nlc-ai/types';

import { ModerationClient } from "./moderation.client";
import { PostsClient } from "./posts.client";
import { CommentsClient } from "./comments.client";
import { MembersClient } from "./members.client";
import { NLCClientConfig } from "@nlc-ai/sdk-main";

export class CommunitiesClient extends BaseClient {
  public moderation: ModerationClient;
  public posts: PostsClient;
  public comments: CommentsClient;
  public members: MembersClient;

  constructor(config: NLCClientConfig) {
    super(config);

    this.posts = new PostsClient(config);
    this.moderation = new ModerationClient(config);
    this.comments = new CommentsClient(config);
    this.members = new MembersClient(config);
  }

  override updateApiKey(apiKey: string | null) {
    super.updateApiKey(apiKey);
    const services = [
      this.posts, this.moderation, this.comments, this.members
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

  async createCommunity(data: CreateCommunityRequest): Promise<CommunityResponse> {
    const response = await this.request<CommunityResponse>('POST', '', { body: data });
    return response.data!;
  }

  async updateCommunity(id: string, data: UpdateCommunityRequest): Promise<CommunityResponse> {
    const response = await this.request<CommunityResponse>('PUT', `/${id}`, { body: data });
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

  async getUserCommunities(userID: string) {
    const response = await this.request<CommunityResponse[]>('GET', `/user/${userID}`);
    return response.data!;
  }

  async getCommunityStats(): Promise<{
    total: number;
    active: number;
    coachToCommunities: number;
    coachClientCommunities: number;
    totalMembers: number;
    totalPosts: number;
    avgMembersPerCommunity: number;
    avgPostsPerCommunity: number;
  }> {
    const response = await this.request<{
      total: number;
      active: number;
      coachToCommunities: number;
      coachClientCommunities: number;
      totalMembers: number;
      totalPosts: number;
      avgMembersPerCommunity: number;
      avgPostsPerCommunity: number;
    }>('GET', '/stats');
    return response.data!;
  }
}
