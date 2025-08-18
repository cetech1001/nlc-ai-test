import { BaseServiceClient } from "@nlc-ai/sdk-core";
import {CoachDashboardData} from "./types";

export class AnalyticsServiceClient extends BaseServiceClient {
  async getCoachDashboard(coachID: string): Promise<CoachDashboardData> {
    // For now, return default values for a newly registered coach
    const defaultData: CoachDashboardData = {
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
        { type: 'emails_to_approve', count: 0 },
        { type: 'clients_at_risk', count: 0 },
        { type: 'survey_responses_flagged', count: 0 },
        { type: 'clients_nearing_completion', count: 0 },
        { type: 'chatbot_escalations', count: 0 },
      ],

      agentStats: {
        leadsCaptured: 0,
        followUpEmailsSent: 0,
        feedbackSurveysSent: 0,
        testimonialsReceived: 0,
        contentIdeasGenerated: 0,
      },

      revenueData: [
        { date: 'Day 1', revenue: 0 },
        { date: 'Day 2', revenue: 0 },
        { date: 'Day 3', revenue: 0 },
        { date: 'Day 4', revenue: 0 },
        { date: 'Day 5', revenue: 0 },
        { date: 'Day 6', revenue: 0 },
        { date: 'Day 7', revenue: 0 },
      ],
      revenueGrowth: 0,

      timeSavedData: [
        { day: "Mon", date: "Day 1", manualHours: 0, savedHours: 0 },
        { day: "Tue", date: "Day 2", manualHours: 0, savedHours: 0 },
        { day: "Wed", date: "Day 3", manualHours: 0, savedHours: 0 },
        { day: "Thu", date: "Day 4", manualHours: 0, savedHours: 0 },
        { day: "Fri", date: "Day 5", manualHours: 0, savedHours: 0 },
        { day: "Sat", date: "Day 6", manualHours: 0, savedHours: 0 },
        { day: "Sun", date: "Day 7", manualHours: 0, savedHours: 0 },
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

    // TODO: Replace with actual API call when backend is ready
    // const response = await this.request<CoachDashboardData>('GET', `/analytics/coach-dashboard/${coachID}`);
    // return response.data!;

    return defaultData;
  }
}
