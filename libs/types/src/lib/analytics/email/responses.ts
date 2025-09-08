import {
  EmailMetrics,
  TimeSeriesData,
  EmailPerformanceReport,
  DeliverabilityInsights,
  SequenceAnalytics,
  ComparisonMetrics
} from './common';

export interface GetEmailAnalyticsResponse {
  metrics: EmailMetrics;
  timeSeriesData?: TimeSeriesData[];
  comparison?: ComparisonMetrics;
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    message: string;
    metric: string;
    value: number;
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    suggestion: string;
    expectedImpact: string;
  }>;
}

export interface GetSequenceAnalyticsResponse {
  analytics: SequenceAnalytics;
  participantJourney: Array<{
    stage: string;
    participantCount: number;
    dropoffRate: number;
    avgTimeSpent: number;
  }>;
}

export interface GetTemplateAnalyticsResponse {
  templateMetrics: Array<{
    templateID: string;
    templateName: string;
    metrics: EmailMetrics;
    usageCount: number;
    lastUsed: string;
  }>;
  comparison?: Array<{
    templateID: string;
    templateName: string;
    currentMetrics: EmailMetrics;
    comparisonMetrics: EmailMetrics;
    improvements: Record<string, number>;
  }>;
  bestPerformingElements: {
    subjects: Array<{
      subject: string;
      openRate: number;
      usageCount: number;
    }>;
    content: Array<{
      element: string;
      clickRate: number;
      description: string;
    }>;
  };
}

export interface GetDeliverabilityReportResponse {
  insights: DeliverabilityInsights;
  trends: Array<{
    date: string;
    deliveryRate: number;
    bounceRate: number;
    spamRate: number;
  }>;
  actionItems: Array<{
    priority: 'urgent' | 'high' | 'medium' | 'low';
    issue: string;
    solution: string;
    impact: string;
  }>;
}

export interface GeneratePerformanceReportResponse {
  report: EmailPerformanceReport;
  downloadUrl?: string;
  success: boolean;
  message: string;
}

export interface GetMetricTrendsResponse {
  trends: Array<{
    metric: string;
    data: Array<{
      timestamp: string;
      value: number;
    }>;
    growth: {
      value: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    };
  }>;
  correlations: Array<{
    metric1: string;
    metric2: string;
    correlation: number;
    significance: 'strong' | 'moderate' | 'weak';
  }>;
}

export interface GetTopPerformersResponse {
  performers: Array<{
    id: string;
    name: string;
    type: 'email' | 'template' | 'sequence';
    metrics: EmailMetrics;
    rank: number;
    improvementSuggestions?: string[];
  }>;
  benchmarks: {
    industry: EmailMetrics;
    platform: EmailMetrics;
    yourAverage: EmailMetrics;
  };
}

export interface GetAudienceInsightsResponse {
  segments: Array<{
    segmentName: string;
    size: number;
    metrics: EmailMetrics;
    characteristics: Record<string, any>;
    engagement: 'high' | 'medium' | 'low';
  }>;
  recommendations: Array<{
    segment: string;
    strategy: string;
    expectedImprovement: string;
  }>;
  growthOpportunities: Array<{
    opportunity: string;
    potentialValue: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}
