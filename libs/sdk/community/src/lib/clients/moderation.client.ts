import { BaseClient, Paginated, SearchQuery, FilterValues } from '@nlc-ai/sdk-core';
import {
  ModerationStats,
  FlaggedContent,
  ModerationAction,
  ModerationRule,
  ModerationActionFilters,
  ModerationActionRequest,
  CreateModerationRuleRequest,
  UpdateModerationRuleRequest,
} from '../types';

export class ModerationClient extends BaseClient {
  async getModerationStats(communityID: string): Promise<ModerationStats> {
    const response = await this.request<ModerationStats>(
      'GET',
      `/communities/${communityID}/moderation/stats`
    );
    return response.data!;
  }

  async getFlaggedContent(
    communityID: string,
    searchOptions: SearchQuery = {},
    filters: FilterValues = {}
  ): Promise<Paginated<FlaggedContent>> {
    const params = new URLSearchParams();
    const { page = 1, limit = 10, search } = searchOptions;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);

    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    if (filters.priority && filters.priority !== '') {
      params.append('priority', filters.priority);
    }

    if (filters.contentType && filters.contentType !== '') {
      params.append('contentType', filters.contentType);
    }

    if (filters.violationType && Array.isArray(filters.violationType) && filters.violationType.length > 0) {
      params.append('violationType', filters.violationType.join(','));
    }

    if (filters.flagCount) {
      if (filters.flagCount.min) {
        params.append('flagCountMin', filters.flagCount.min.toString());
      }
      if (filters.flagCount.max) {
        params.append('flagCountMax', filters.flagCount.max.toString());
      }
    }

    if (filters.dateRange) {
      if (filters.dateRange.start) {
        params.append('dateRangeStart', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        params.append('dateRangeEnd', filters.dateRange.end);
      }
    }

    const response = await this.request<Paginated<FlaggedContent>>(
      'GET',
      `/communities/${communityID}/moderation/flagged?${params.toString()}`
    );
    return response.data!;
  }

  async getModerationActions(
    communityID: string,
    filters: ModerationActionFilters = {}
  ): Promise<Paginated<ModerationAction>> {
    const params = new URLSearchParams();
    const { page = 1, limit = 10 } = filters;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters.type) params.append('type', filters.type);
    if (filters.targetType) params.append('targetType', filters.targetType);
    if (filters.moderatorID) params.append('moderatorID', filters.moderatorID);

    if (filters.dateRange) {
      if (filters.dateRange.start) {
        params.append('dateRangeStart', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        params.append('dateRangeEnd', filters.dateRange.end);
      }
    }

    const response = await this.request<Paginated<ModerationAction>>(
      'GET',
      `/communities/${communityID}/moderation/actions?${params.toString()}`
    );
    return response.data!;
  }

  async moderateContent(
    communityID: string,
    contentID: string,
    action: ModerationActionRequest
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(
      'POST',
      `/communities/${communityID}/moderation/content/${contentID}/action`,
      { body: action }
    );
    return response.data!;
  }

  async moderateMember(
    communityID: string,
    memberID: string,
    action: ModerationActionRequest
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(
      'POST',
      `/communities/${communityID}/moderation/members/${memberID}/action`,
      { body: action }
    );
    return response.data!;
  }

  async reportContent(
    communityID: string,
    contentID: string,
    contentType: 'post' | 'comment' | 'message',
    reason: string,
    details?: string
  ): Promise<{ success: boolean; reportID: string }> {
    const response = await this.request<{ success: boolean; reportID: string }>(
      'POST',
      `/communities/${communityID}/moderation/report`,
      {
        body: {
          contentID,
          contentType,
          reason,
          details,
        },
      }
    );
    return response.data!;
  }

  async getModerationRules(communityID: string): Promise<ModerationRule[]> {
    const response = await this.request<ModerationRule[]>(
      'GET',
      `/communities/${communityID}/moderation/rules`
    );
    return response.data!;
  }

  async createModerationRule(
    communityID: string,
    rule: CreateModerationRuleRequest
  ): Promise<ModerationRule> {
    const response = await this.request<ModerationRule>(
      'POST',
      `/communities/${communityID}/moderation/rules`,
      { body: rule }
    );
    return response.data!;
  }

  async updateModerationRule(
    communityID: string,
    ruleID: string,
    updates: UpdateModerationRuleRequest
  ): Promise<ModerationRule> {
    const response = await this.request<ModerationRule>(
      'PUT',
      `/communities/${communityID}/moderation/rules/${ruleID}`,
      { body: updates }
    );
    return response.data!;
  }

  async deleteModerationRule(
    communityID: string,
    ruleID: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(
      'DELETE',
      `/communities/${communityID}/moderation/rules/${ruleID}`
    );
    return response.data!;
  }

  async getAIModerationInsights(
    communityID: string,
    period: '7d' | '30d' | '90d' = '30d'
  ): Promise<{
    totalScanned: number;
    autoResolved: number;
    accuracyRate: number;
    commonViolations: Array<{ type: string; count: number }>;
    trendData: Array<{ date: string; scanned: number; flagged: number }>;
  }> {
    const response = await this.request<{
      totalScanned: number;
      autoResolved: number;
      accuracyRate: number;
      commonViolations: Array<{ type: string; count: number }>;
      trendData: Array<{ date: string; scanned: number; flagged: number }>;
    }>('GET', `/communities/${communityID}/moderation/ai-insights?period=${period}`);
    return response.data!;
  }
}
