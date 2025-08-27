import { BaseClient } from "@nlc-ai/sdk-core";
import {
  CommunityAnalytics,
  CommunityMemberAnalytics,
  CommunityEngagementMetrics,
  CommunityContentAnalytics,
  CommunitiesOverview
} from "../types";

export class CommunityAnalyticsClient extends BaseClient {
  async getCommunityAnalytics(
    communityID: string,
    startDate?: string,
    endDate?: string
  ): Promise<CommunityAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const query = params.toString();
    const url = `/${communityID}/analytics${query ? `?${query}` : ''}`;

    const response = await this.request<CommunityAnalytics>('GET', url);
    return response.data!;
  }

  async getMemberAnalytics(
    communityID: string,
    startDate?: string,
    endDate?: string
  ): Promise<CommunityMemberAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const query = params.toString();
    const url = `/${communityID}/member-analytics${query ? `?${query}` : ''}`;

    const response = await this.request<CommunityMemberAnalytics>('GET', url);
    return response.data!;
  }

  async getEngagementMetrics(
    communityID: string,
    startDate?: string,
    endDate?: string
  ): Promise<CommunityEngagementMetrics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const query = params.toString();
    const url = `/${communityID}/engagement-metrics${query ? `?${query}` : ''}`;

    const response = await this.request<CommunityEngagementMetrics>('GET', url);
    return response.data!;
  }

  async getContentAnalytics(
    communityID: string,
    startDate?: string,
    endDate?: string
  ): Promise<CommunityContentAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const query = params.toString();
    const url = `/${communityID}/content-analytics${query ? `?${query}` : ''}`;

    const response = await this.request<CommunityContentAnalytics>('GET', url);
    return response.data!;
  }

  async getCommunitiesOverview(
    startDate?: string,
    endDate?: string
  ): Promise<CommunitiesOverview> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const query = params.toString();
    const url = `/overview${query ? `?${query}` : ''}`;

    const response = await this.request<CommunitiesOverview>('GET', url);
    return response.data!;
  }
}
