import { BaseClient } from '@nlc-ai/sdk-core';

export interface ContentSuggestion {
  id: string;
  title: string;
  originalIdea: string;
  script: {
    hook: string;
    mainContent: string;
    callToAction: string;
  };
  contentCategory: string;
  recommendedPlatforms: string[];
  bestPostingTimes: string[];
  estimatedEngagement: {
    min: number;
    max: number;
  };
  confidence: number;
  status: 'generated' | 'updated' | 'superseded';
  createdAt: Date;
  updatedAt?: Date;
  metadata?: any;
}

export interface TopPerformingContent {
  title: string;
  description: string;
  contentType: string;
  platform: string;
  topicCategories: string[];
  engagementRate: number;
  views: number;
  likes: number;
  comments: number;
  publishedAt: Date;
}

export interface ContentTrends {
  categoryTrends: Array<{
    category: string;
    frequency: number;
    avgEngagement: number;
    avgViews: number;
  }>;
  platformTrends: Array<{
    platform: string;
    frequency: number;
    avgEngagement: number;
    avgViews: number;
  }>;
  timingTrends: Array<{
    hour: string;
    frequency: number;
    avgEngagement: number;
  }>;
  totalContentAnalyzed: number;
  analysisDate: Date;
}

export class ContentSuggestionClient extends BaseClient {
  /**
   * Generate content suggestion with script
   */
  async generateContentSuggestion(data: {
    idea: string;
    contentType?: string;
    targetPlatforms?: string[];
    customInstructions?: string;
  }): Promise<ContentSuggestion> {
    const response = await this.request<ContentSuggestion>(
      'POST',
      '/generate',
      { body: data }
    );
    return response.data!;
  }

  /**
   * Regenerate existing content suggestion
   */
  async regenerateContentSuggestion(suggestionID: string, customInstructions?: string): Promise<ContentSuggestion> {
    const response = await this.request<ContentSuggestion>(
      'POST',
      `/regenerate/${suggestionID}`,
      { body: { customInstructions } }
    );
    return response.data!;
  }

  /**
   * Get all generated content suggestions for coach
   */
  async getAllSuggestions(): Promise<ContentSuggestion[]> {
    const response = await this.request<ContentSuggestion[]>(
      'GET',
      '/suggestions'
    );
    return response.data!;
  }

  /**
   * Get specific content suggestion
   */
  async getSuggestion(suggestionID: string): Promise<ContentSuggestion> {
    const response = await this.request<ContentSuggestion>(
      'GET',
      `/suggestions/${suggestionID}`
    );
    return response.data!;
  }

  /**
   * Update content suggestion script
   */
  async updateSuggestion(suggestionID: string, updates: {
    title?: string;
    script?: string;
    hook?: string;
    mainContent?: string;
    callToAction?: string;
  }): Promise<ContentSuggestion> {
    const response = await this.request<ContentSuggestion>(
      'POST',
      `/suggestions/${suggestionID}/update`,
      { body: updates }
    );
    return response.data!;
  }

  /**
   * Get top performing content for suggestions
   */
  async getTopPerformingContent(): Promise<TopPerformingContent[]> {
    const response = await this.request<TopPerformingContent[]>(
      'GET',
      '/analytics/top-performing'
    );
    return response.data!;
  }

  /**
   * Analyze content trends for better suggestions
   */
  async analyzeContentTrends(): Promise<ContentTrends> {
    const response = await this.request<ContentTrends>(
      'POST',
      '/analyze-trends'
    );
    return response.data!;
  }
}
