import { QueryParams } from '../../query-params';
import {
  AnalyticsTimeframe,
  EmailMetricType,
  ComparisonPeriod
} from './enums';

export interface GetEmailAnalyticsRequest {
  coachID?: string;
  timeframe: AnalyticsTimeframe;
  dateRange?: {
    start: string;
    end: string;
  };
  compareWith?: ComparisonPeriod;
  segmentBy?: 'template' | 'sequence' | 'audience' | 'campaign';
  includeTimeSeries?: boolean;
}

export interface GetSequenceAnalyticsRequest {
  sequenceID: string;
  timeframe: AnalyticsTimeframe;
  dateRange?: {
    start: string;
    end: string;
  };
  includeParticipantDetails?: boolean;
}

export interface GetTemplateAnalyticsRequest {
  templateID?: string;
  coachID?: string;
  timeframe: AnalyticsTimeframe;
  dateRange?: {
    start: string;
    end: string;
  };
  compareTemplates?: string[];
}

export interface GetDeliverabilityReportRequest {
  coachID?: string;
  timeframe: AnalyticsTimeframe;
  dateRange?: {
    start: string;
    end: string;
  };
  includeDomainAnalysis?: boolean;
  includeIPAnalysis?: boolean;
}

export interface GeneratePerformanceReportRequest {
  coachID: string;
  reportName: string;
  timeframe: AnalyticsTimeframe;
  dateRange?: {
    start: string;
    end: string;
  };
  includeTemplatePerformance?: boolean;
  includeAudienceInsights?: boolean;
  includeRecommendations?: boolean;
}

export interface GetMetricTrendsRequest {
  coachID?: string;
  metrics: EmailMetricType[];
  timeframe: AnalyticsTimeframe;
  dateRange?: {
    start: string;
    end: string;
  };
  granularity: 'hour' | 'day' | 'week' | 'month';
}

export interface GetTopPerformersRequest extends QueryParams {
  coachID?: string;
  timeframe: AnalyticsTimeframe;
  dateRange?: {
    start: string;
    end: string;
  };
  metric: EmailMetricType;
  type: 'emails' | 'templates' | 'sequences';
}

export interface GetAudienceInsightsRequest {
  coachID?: string;
  timeframe: AnalyticsTimeframe;
  dateRange?: {
    start: string;
    end: string;
  };
  segmentBy: 'domain' | 'engagement_level' | 'location' | 'client_type';
}
