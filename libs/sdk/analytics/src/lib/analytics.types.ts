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

export interface ClientEmailAgentData {
  totalEmailProcessed: number;
  responseTimeSaved: number; // in hours
  accuracyToneMatch: number; // percentage
  approvalOutcomesEfficiency: number; // percentage
  toneMatch: number; // percentage

  emailProcessingBreakdown: {
    manuallyApproved: number;
    flaggedForReview: number;
    rejected: number;
  };

  responseTimeData: {
    consumedThroughPlatform: number; // hours
    wouldHaveBeenConsumedManually: number; // hours
  };

  approvalOutcomes: {
    mailsSentAsIs: number;
    mailsSentWithEdits: number;
    mailResponsesDeleted: number;
  };

  toneMatchData: {
    responsesRatedAbove3: number;
    responsesRatedBelow3: number;
  };
}

export interface ClientRetentionAgentData {
  surveyResponseRate: number; // percentage
  clientEngagementLevel: number; // total count
  churnReduction: number; // percentage
  clientSatisfactionTrends: number; // rating out of 5
  successStories: number; // count
  topClientRetentionTemplates: Array<{
    name: string;
    retentions: number;
  }>;

  surveyResponseData: {
    thisWeek: number; // percentage
    lastWeek: number; // percentage
    custom: number; // percentage
  };

  surveyTrendData: Array<{
    date: string;
    responseRate: number; // percentage
  }>;

  clientEngagementBreakdown: {
    activeClients: number;
    atRiskClients: number;
    inactiveClients: number;
  };

  retentionTemplates: Array<{
    name: string;
    retentions: number;
  }>;
}

export interface LeadFollowUpAgentData {
  followUpSuccessRates: number; // percentage
  leadConversionBoost: number; // percentage
  responseRateAfterFollowUp: number; // percentage
  highestConversionCourses: Array<{
    courseName: string;
    conversions: number;
  }>;

  conversionData: {
    leadsConverted: number;
    followUpEmailsSent: number;
  };

  responseData: {
    responsesReceived: number;
    followUpsSent: number;
  };

  courseConversions: Array<{
    courseName: string;
    conversions: number;
  }>;
}

export interface ContentCreationAgentData {
  styleEfficiency: Array<{
    category: string;
    views: number;
  }>;
  socialMediaGrowth: number; // percentage
  viralityFactor: number; // count
  efficiencyBoost: number; // percentage
  averageEngagement: {
    likes: number;
    shares: number;
    comments: number;
    bestTimeToPost: string;
  };

  socialGrowthData: Array<{
    month: string;
    followers: number;
  }>;

  efficiencyData: {
    timeSaved: number; // hours
    manualTimeRequirement: number; // hours
  };

  contentStyles: Array<{
    category: string;
    views: number;
  }>;
}

export interface CoachReplicaAgentData {
  appointmentSettingEfficiency: number; // count
  totalClientInteractions: number; // count
  highestLeadsCapturedIn: string; // month name
  leadCaptureRate: number; // percentage or count
  clientInteractionQuality: number; // percentage
  conversionMetrics: number; // percentage

  interactionQualityData: {
    likesOnChatInteractions: number;
    dislikesOnChatInteractions: number;
  };

  conversionData: {
    leadsConverted: number;
    totalLeadsCaptured: number;
  };
}
