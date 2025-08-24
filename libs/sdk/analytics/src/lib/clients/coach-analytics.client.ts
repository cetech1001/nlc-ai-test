import { BaseClient } from "@nlc-ai/sdk-core";
import {
  CoachDashboardData,
  ClientEmailAgentData,
  ClientRetentionAgentData,
  LeadFollowUpAgentData,
  ContentCreationAgentData,
  CoachReplicaAgentData
} from "../types/analytics.types";

export class CoachAnalyticsClient extends BaseClient {
  async getDashboardData(coachID: string): Promise<CoachDashboardData> {
    const response = await this.request<CoachDashboardData>('GET', `/coach/${coachID}/dashboard`);
    return response.data!;
  }

  async getClientEmailStats(coachID: string): Promise<ClientEmailAgentData> {
    const response = await this.request<ClientEmailAgentData>('GET', `/coach/${coachID}/client-email-stats`);
    return response.data!;
  }

  async getClientRetentionStats(coachID: string): Promise<ClientRetentionAgentData> {
    const response = await this.request<ClientRetentionAgentData>('GET', `/coach/${coachID}/client-retention-stats`);
    return response.data!;
  }

  async getLeadFollowUpStats(coachID: string): Promise<LeadFollowUpAgentData> {
    const response = await this.request<LeadFollowUpAgentData>('GET', `/coach/${coachID}/lead-followup-stats`);
    return response.data!;
  }

  async getContentCreationStats(coachID: string): Promise<ContentCreationAgentData> {
    const response = await this.request<ContentCreationAgentData>('GET', `/coach/${coachID}/content-creation-stats`);
    return response.data!;
  }

  async getCoachReplicaStats(coachID: string): Promise<CoachReplicaAgentData> {
    const response = await this.request<CoachReplicaAgentData>('GET', `/coach/${coachID}/coach-replica-stats`);
    return response.data!;
  }
}
