import {AnalyticsTimeframe} from "./enums";

export interface EmailMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  replied: number;

  // Calculated rates
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  unsubscribeRate: number;
  replyRate: number;

  // Engagement metrics
  clickToOpenRate: number;
  engagementRate: number;
}

export interface TimeSeriesData {
  date: string;
  metrics: EmailMetrics;
}

export interface EmailPerformanceReport {
  id: string;
  coachID: string;
  reportName: string;
  timeframe: AnalyticsTimeframe;
  dateRange: {
    start: string;
    end: string;
  };
  overallMetrics: EmailMetrics;
  timeSeriesData: TimeSeriesData[];
  topPerformingEmails: Array<{
    emailID: string;
    subject: string;
    sentAt: string;
    metrics: EmailMetrics;
  }>;
  templatePerformance: Array<{
    templateID: string;
    templateName: string;
    usageCount: number;
    metrics: EmailMetrics;
  }>;
  audienceInsights: {
    mostEngagedSegments: Array<{
      segmentName: string;
      criteria: string;
      metrics: EmailMetrics;
    }>;
    leastEngagedSegments: Array<{
      segmentName: string;
      criteria: string;
      metrics: EmailMetrics;
    }>;
  };
  generatedAt: string;
}

export interface DeliverabilityInsights {
  overallScore: number;
  domainReputation: Array<{
    domain: string;
    reputation: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
  }>;
  ipReputation: Array<{
    ip: string;
    reputation: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
  }>;
  bounceAnalysis: {
    hardBounces: number;
    softBounces: number;
    commonReasons: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
  };
  spamComplaints: {
    total: number;
    rate: number;
    trends: Array<{
      date: string;
      count: number;
    }>;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    suggestion: string;
    impact: string;
  }>;
}

export interface SequenceAnalytics {
  sequenceID: string;
  sequenceName: string;
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;

  overallMetrics: EmailMetrics;

  emailPerformance: Array<{
    emailIndex: number;
    emailSubject: string;
    metrics: EmailMetrics;
    dropoffRate: number;
  }>;

  conversionMetrics: {
    conversions: number;
    conversionRate: number;
    averageTimeToConversion: number; // in days
    revenue?: number;
  };

  optimizationSuggestions: Array<{
    emailIndex: number;
    suggestion: string;
    expectedImprovement: string;
  }>;
}

export interface ComparisonMetrics {
  current: EmailMetrics;
  comparison: EmailMetrics;
  changes: {
    sent: { value: number; percentage: number };
    delivered: { value: number; percentage: number };
    opened: { value: number; percentage: number };
    clicked: { value: number; percentage: number };
    bounced: { value: number; percentage: number };
    openRate: { value: number; percentage: number };
    clickRate: { value: number; percentage: number };
    deliveryRate: { value: number; percentage: number };
  };
}
