export interface EmailHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface EmailSystemHealth {
  overall: EmailHealthStatus;
  components: {
    mailgunConfig: EmailHealthStatus;
    database: EmailHealthStatus;
    scheduler: EmailHealthStatus;
    queueHealth: EmailHealthStatus;
    recentPerformance: EmailHealthStatus;
  };
  metrics: {
    pendingEmails: number;
    processingEmails: number;
    recentFailureRate: number;
    avgProcessingTime: number;
    lastSuccessfulSend?: Date;
  };
}
