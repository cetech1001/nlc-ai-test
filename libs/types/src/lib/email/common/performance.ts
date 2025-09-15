import {BaseEvent} from "../../base-event";

export interface EmailPerformanceReportGeneratedEvent extends BaseEvent {
  eventType: 'email.performance.report.generated';
  payload: {
    reportID: string;
    coachID?: string;
    period: {
      start: string;
      end: string;
    };
    metrics: {
      totalSent: number;
      openRate: number;
      clickRate: number;
      bounceRate: number;
    };
    generatedAt: string;
  };
}

export interface EmailMetricThresholdExceededEvent extends BaseEvent {
  eventType: 'email.metric.threshold.exceeded';
  payload: {
    coachID: string;
    metric: 'bounce_rate' | 'complaint_rate' | 'unsubscribe_rate' | 'failure_rate';
    currentValue: number;
    threshold: number;
    period: string;
    detectedAt: string;
  };
}

export type EmailPerformanceEvent =
  | EmailPerformanceReportGeneratedEvent
  | EmailMetricThresholdExceededEvent;

export interface EmailPerformanceEventPayloads {
  'email.performance.report.generated': EmailPerformanceReportGeneratedEvent['payload'];
  'email.metric.threshold.exceeded': EmailMetricThresholdExceededEvent['payload'];
}

export const EMAIL_PERFORMANCE_ROUTING_KEYS = {
  PERFORMANCE_REPORT_GENERATED: 'email.performance.report.generated',
  METRIC_THRESHOLD_EXCEEDED: 'email.metric.threshold.exceeded',
};
