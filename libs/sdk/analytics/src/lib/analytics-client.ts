import {BaseClient} from "@nlc-ai/sdk-core";
import {
  ClientEmailAgentData,
  ClientRetentionAgentData,
  CoachDashboardData,
  CoachReplicaAgentData,
  ContentCreationAgentData,
  LeadFollowUpAgentData,
  AdminDashboardData,
  TransactionStats
} from "./analytics.types";

export class AnalyticsServiceClient extends BaseClient {
  async getCoachDashboard(coachID: string): Promise<CoachDashboardData> {
    // For now, return default values for a newly registered coach
    // TODO: Replace with actual API call when backend is ready
    // const response = await this.request<CoachDashboardData>('GET', `/analytics/coach-dashboard/${coachID}`);
    // return response.data!;

    return {
      totalClients: 0,
      confidenceScore: 0, // No data yet

      clientEmailStats: {
        pendingResponses: 0,
        emailsProcessedToday: 0,
        emailsProcessedThisWeek: 0,
        averageResponseTime: 0,
        lastSyncAt: null,
        clientEmailsFound: 0,
      },

      priorities: [
        {type: 'emails_to_approve', count: 0},
        {type: 'clients_at_risk', count: 0},
        {type: 'survey_responses_flagged', count: 0},
        {type: 'clients_nearing_completion', count: 0},
        {type: 'chatbot_escalations', count: 0},
      ],

      agentStats: {
        leadsCaptured: 0,
        followUpEmailsSent: 0,
        feedbackSurveysSent: 0,
        testimonialsReceived: 0,
        contentIdeasGenerated: 0,
      },

      revenueData: [
        {date: 'Day 1', revenue: 0},
        {date: 'Day 2', revenue: 0},
        {date: 'Day 3', revenue: 0},
        {date: 'Day 4', revenue: 0},
        {date: 'Day 5', revenue: 0},
        {date: 'Day 6', revenue: 0},
        {date: 'Day 7', revenue: 0},
      ],
      revenueGrowth: 0,

      timeSavedData: [
        {day: "Mon", date: "Day 1", manualHours: 0, savedHours: 0},
        {day: "Tue", date: "Day 2", manualHours: 0, savedHours: 0},
        {day: "Wed", date: "Day 3", manualHours: 0, savedHours: 0},
        {day: "Thu", date: "Day 4", manualHours: 0, savedHours: 0},
        {day: "Fri", date: "Day 5", manualHours: 0, savedHours: 0},
        {day: "Sat", date: "Day 6", manualHours: 0, savedHours: 0},
        {day: "Sun", date: "Day 7", manualHours: 0, savedHours: 0},
      ],

      testimonialOpportunity: {
        available: false,
      },

      leadsFollowUp: {
        leadsOpenedLastEmail: 0,
        bookedCalls: 0,
        ghostedAgain: 0,
      },

      weeklyLeadsCaptured: 0,

      topPerformingContent: [], // Empty for new coach
    };
  }

  async getAdminDashboard(): Promise<AdminDashboardData> {
    // TODO: Replace with actual API call when backend is ready
    // const response = await this.request<AdminDashboardData>('GET', '/analytics/admin-dashboard');
    // return response.data!;

    return {
      allTimeRevenue: 125000,
      monthlyRevenue: 12500,
      allTimeRevenueGrowth: 15.5,
      monthlyRevenueGrowth: 8.3,

      totalCoaches: 245,
      inactiveCoaches: 32,
      totalCoachesGrowth: 12.1,
      inactiveCoachesGrowth: -5.2,

      revenueData: {
        weekly: [
          {date: 'Aug 17', revenue: 2800},
          {date: 'Aug 18', revenue: 3200},
          {date: 'Aug 19', revenue: 2950},
          {date: 'Aug 20', revenue: 3800},
          {date: 'Aug 21', revenue: 4100},
          {date: 'Aug 22', revenue: 3600},
          {date: 'Aug 23', revenue: 3900},
        ],
        monthly: [
          {date: 'Feb', revenue: 8500},
          {date: 'Mar', revenue: 9200},
          {date: 'Apr', revenue: 10800},
          {date: 'May', revenue: 11200},
          {date: 'Jun', revenue: 11800},
          {date: 'Jul', revenue: 12100},
          {date: 'Aug', revenue: 12500},
        ],
        yearly: [
          {date: '2019', revenue: 45000},
          {date: '2020', revenue: 62000},
          {date: '2021', revenue: 78000},
          {date: '2022', revenue: 95000},
          {date: '2023', revenue: 110000},
          {date: '2024', revenue: 125000},
        ],
      },
    };
  }

  async getTransactionStats(): Promise<TransactionStats> {
    // TODO: Replace with actual API call when backend is ready
    // const response = await this.request<TransactionStats>('GET', '/analytics/transaction-stats');
    // return response.data!;

    return {
      totalTransactions: 1250,
      totalVolume: 125000,
      averageTransactionValue: 100,
      successRate: 98.5,
      volumeGrowth: 15.2,
      transactionGrowth: 22.8,

      monthlyStats: [
        {month: 'Feb', transactions: 145, volume: 14500, averageValue: 100},
        {month: 'Mar', transactions: 162, volume: 16200, averageValue: 100},
        {month: 'Apr', transactions: 178, volume: 17800, averageValue: 100},
        {month: 'May', transactions: 185, volume: 18500, averageValue: 100},
        {month: 'Jun', transactions: 192, volume: 19200, averageValue: 100},
        {month: 'Jul', transactions: 198, volume: 19800, averageValue: 100},
        {month: 'Aug', transactions: 205, volume: 20500, averageValue: 100},
      ],

      planBreakdown: [
        {planName: 'Starter', transactions: 450, volume: 22500, percentage: 36},
        {planName: 'Professional', transactions: 520, volume: 62400, percentage: 42},
        {planName: 'Enterprise', transactions: 280, volume: 40200, percentage: 22},
      ],

      paymentMethodBreakdown: [
        {method: 'Credit Card', transactions: 875, volume: 87500, percentage: 70},
        {method: 'PayPal', transactions: 250, volume: 25000, percentage: 20},
        {method: 'Bank Transfer', transactions: 125, volume: 12500, percentage: 10},
      ],
    };
  }

  async getClientEmailAgentData(coachID: string): Promise<ClientEmailAgentData> {
    // TODO: Replace with actual API call
    return {
      totalEmailProcessed: 0,
      responseTimeSaved: 0,
      accuracyToneMatch: 0,
      approvalOutcomesEfficiency: 0,
      toneMatch: 0,

      emailProcessingBreakdown: {
        manuallyApproved: 0,
        flaggedForReview: 0,
        rejected: 0,
      },

      responseTimeData: {
        consumedThroughPlatform: 0,
        wouldHaveBeenConsumedManually: 0,
      },

      approvalOutcomes: {
        mailsSentAsIs: 0,
        mailsSentWithEdits: 0,
        mailResponsesDeleted: 0,
      },

      toneMatchData: {
        responsesRatedAbove3: 0,
        responsesRatedBelow3: 0,
      },
    };
  }

  async getClientRetentionAgentData(coachID: string): Promise<ClientRetentionAgentData> {
    // TODO: Replace with actual API call
    return {
      surveyResponseRate: 0,
      clientEngagementLevel: 0,
      churnReduction: 0,
      clientSatisfactionTrends: 0,
      successStories: 0,
      topClientRetentionTemplates: [],

      surveyResponseData: {
        thisWeek: 0,
        lastWeek: 0,
        custom: 0,
      },

      surveyTrendData: [
        {date: 'Jun 07', responseRate: 0},
        {date: 'Jun 08', responseRate: 0},
        {date: 'Jun 09', responseRate: 0},
        {date: 'Jun 10', responseRate: 0},
        {date: 'Jun 11', responseRate: 0},
        {date: 'Jun 12', responseRate: 0},
        {date: 'Jun 13', responseRate: 0},
      ],

      clientEngagementBreakdown: {
        activeClients: 0,
        atRiskClients: 0,
        inactiveClients: 0,
      },

      retentionTemplates: [
        {name: 'Feedback Survey 01', retentions: 0},
        {name: 'Client Drop-Off at 25%', retentions: 0},
        {name: 'Feedback Survey 02', retentions: 0},
      ],
    };
  }

  async getLeadFollowUpAgentData(coachID: string): Promise<LeadFollowUpAgentData> {
    // TODO: Replace with actual API call
    return {
      followUpSuccessRates: 0,
      leadConversionBoost: 0,
      responseRateAfterFollowUp: 0,
      highestConversionCourses: [],

      conversionData: {
        leadsConverted: 0,
        followUpEmailsSent: 0,
      },

      responseData: {
        responsesReceived: 0,
        followUpsSent: 0,
      },

      courseConversions: [
        {courseName: 'Course 01', conversions: 0},
        {courseName: 'Course 02', conversions: 0},
        {courseName: 'Course 03', conversions: 0},
      ],
    };
  }

  async getContentCreationAgentData(coachID: string): Promise<ContentCreationAgentData> {
    // TODO: Replace with actual API call
    return {
      styleEfficiency: [],
      socialMediaGrowth: 0,
      viralityFactor: 0,
      efficiencyBoost: 0,
      averageEngagement: {
        likes: 0,
        shares: 0,
        comments: 0,
        bestTimeToPost: "N/A",
      },

      socialGrowthData: [
        {month: 'Dec', followers: 0},
        {month: 'Jan', followers: 0},
        {month: 'Feb', followers: 0},
        {month: 'Mar', followers: 0},
        {month: 'Apr', followers: 0},
        {month: 'May', followers: 0},
        {month: 'Jun', followers: 0},
      ],

      efficiencyData: {
        timeSaved: 0,
        manualTimeRequirement: 0,
      },

      contentStyles: [
        {category: 'Controversial', views: 0},
        {category: 'Informative', views: 0},
        {category: 'Conversational', views: 0},
        {category: 'Entertainment', views: 0},
        {category: 'Case Studies', views: 0},
      ],
    };
  }

  async getCoachReplicaAgentData(coachID: string): Promise<CoachReplicaAgentData> {
    // TODO: Replace with actual API call
    return {
      appointmentSettingEfficiency: 0,
      totalClientInteractions: 0,
      highestLeadsCapturedIn: "N/A",
      leadCaptureRate: 0,
      clientInteractionQuality: 0,
      conversionMetrics: 0,

      interactionQualityData: {
        likesOnChatInteractions: 0,
        dislikesOnChatInteractions: 0,
      },

      conversionData: {
        leadsConverted: 0,
        totalLeadsCaptured: 0,
      },
    };
  }
}
