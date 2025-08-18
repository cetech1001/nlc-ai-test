export interface CoachDashboardData {
  // Stats cards
  totalClients: number;
  confidenceScore: number;

  // Client email agent stats
  clientEmailStats: {
    pendingResponses: number;
    emailsProcessedToday: number;
    emailsProcessedThisWeek: number;
    averageResponseTime: number; // in minutes
    lastSyncAt: Date | null;
    clientEmailsFound: number;
  };

  // Priority tasks
  priorities: Array<{
    type: 'emails_to_approve' | 'clients_at_risk' | 'survey_responses_flagged' | 'clients_nearing_completion' | 'chatbot_escalations';
    count: number;
  }>;

  // Agent stats
  agentStats: {
    leadsCaptured: number;
    followUpEmailsSent: number;
    feedbackSurveysSent: number;
    testimonialsReceived: number;
    contentIdeasGenerated: number;
  };

  // Revenue data
  revenueData: Array<{
    date: string;
    revenue: number;
  }>;
  revenueGrowth: number; // percentage

  // Time saved data
  timeSavedData: Array<{
    day: string;
    date: string;
    manualHours: number;
    savedHours: number;
  }>;

  // Testimonial opportunity
  testimonialOpportunity: {
    available: boolean;
    clientName?: string;
    message?: string;
  };

  // Leads follow up
  leadsFollowUp: {
    leadsOpenedLastEmail: number;
    bookedCalls: number;
    ghostedAgain: number;
  };

  // Weekly leads captured
  weeklyLeadsCaptured: number;

  // Top performing content
  topPerformingContent: Array<{
    id: number;
    thumbnail: string;
    duration: string;
    time: string;
    date: string;
    impressions: string;
    engagement: string;
    platform: 'instagram' | 'facebook' | 'tiktok';
  }>;
}
