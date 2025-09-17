import { BaseAPI } from './base';
import {
  AnalyzeEmailRequest, CoachKnowledgeProfile, CoachReplicaRequest, CoachReplicaResponse,
  CreateSequenceRequest, DeliverabilityAnalysis, EmailAnalysis, EmailInSequence,
  EmailSequenceWithEmails,
  RegenerateEmailsRequest,
  UpdateEmailRequest,
  UpdateSequenceRequest,
  ClientEmailResponse,
  ClientEmailSyncResult,
  ClientEmailStats,
  ClientEmailAnalytics,
  EmailThreadDetail,
  ClientEmailThread,
} from "@nlc-ai/types";

class AiAgentsAPI extends BaseAPI {
  // ==================== LEAD FOLLOW-UP AGENT ====================

  async generateFollowupSequence(data: CreateSequenceRequest): Promise<EmailSequenceWithEmails> {
    return this.makeRequest('/ai-agents/lead-followup/create-sequence', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSequenceWithEmails(sequenceID: string): Promise<EmailSequenceWithEmails> {
    return this.makeRequest(`/ai-agents/lead-followup/sequence/${sequenceID}`);
  }

  async updateSequence(sequenceID: string, updates: Omit<UpdateSequenceRequest, 'sequenceID'>): Promise<EmailSequenceWithEmails> {
    return this.makeRequest(`/ai-agents/lead-followup/sequence/${sequenceID}`, {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    });
  }

  async updateEmail(emailID: string, updates: UpdateEmailRequest['updates']): Promise<EmailInSequence> {
    return this.makeRequest(`/ai-agents/lead-followup/email/${emailID}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async regenerateEmails(data: RegenerateEmailsRequest): Promise<EmailInSequence[]> {
    return this.makeRequest(`/ai-agents/lead-followup/sequence/${data.sequenceID}/regenerate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEmailByID(emailID: string): Promise<{
    email: EmailInSequence;
    deliverabilityAnalysis: Omit<EmailAnalysis, 'strengths'>;
    suggestions: string[];
  }> {
    return this.makeRequest(`/ai-agents/lead-followup/email/${emailID}/preview`);
  }

  async getSequencesForLead(leadID: string): Promise<{
    sequences: EmailSequenceWithEmails[],
    currentSequence: EmailSequenceWithEmails,
    sequenceHistory: EmailSequenceWithEmails[],
  }> {
    return this.makeRequest(`/ai-agents/lead-followup/sequences/lead/${leadID}`);
  }

  async pauseSequence(sequenceID: string): Promise<void> {
    await this.makeRequest(`/ai-agents/lead-followup/sequence/${sequenceID}/pause`, {
      method: 'POST',
    });
  }

  async resumeSequence(sequenceID: string): Promise<void> {
    await this.makeRequest(`/ai-agents/lead-followup/sequence/${sequenceID}/resume`, {
      method: 'POST',
    });
  }

  async cancelSequence(sequenceID: string): Promise<void> {
    await this.makeRequest(`/ai-agents/lead-followup/sequence/${sequenceID}/cancel`, {
      method: 'POST',
    });
  }

  // ==================== EMAIL DELIVERABILITY AGENT ====================

  async analyzeEmailDeliverability(data: AnalyzeEmailRequest): Promise<DeliverabilityAnalysis> {
    return this.makeRequest('/ai-agents/email-deliverability/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async quickDeliverabilityCheck(subject: string, body: string): Promise<{ score: number; issues: string[] }> {
    return this.makeRequest('/ai-agents/email-deliverability/quick-check', {
      method: 'POST',
      body: JSON.stringify({ subject, body }),
    });
  }

  // ==================== COACH REPLICA AGENT ====================

  async getCoachProfile(coachID: string, refresh = false): Promise<CoachKnowledgeProfile> {
    return this.makeRequest(`/ai-agents/coach-replica/profile/${coachID}?refresh=${refresh.toString()}`);
  }

  async generateCoachResponse(data: CoachReplicaRequest): Promise<CoachReplicaResponse> {
    return this.makeRequest('/ai-agents/coach-replica/generate-response', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async testCoachReplica(coachID: string, query: string): Promise<CoachReplicaResponse> {
    return this.makeRequest(`/ai-agents/coach-replica/test/${coachID}`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async clearCoachCache(coachID: string): Promise<void> {
    await this.makeRequest(`/ai-agents/coach-replica/clear-cache/${coachID}`, {
      method: 'POST',
    });
  }

  // ==================== CLIENT EMAIL AGENT ====================

  /**
   * Manually sync client emails and generate responses
   */
  async syncClientEmails(): Promise<ClientEmailSyncResult> {
    return this.makeRequest('/ai-agents/client-email/sync', {
      method: 'POST',
    });
  }

  /**
   * Get pending client email responses for approval
   */
  async getPendingClientResponses(): Promise<ClientEmailResponse[]> {
    return this.makeRequest('/ai-agents/client-email/pending');
  }

  /**
   * Approve and send client email response
   */
  async approveClientResponse(emailID: string, modifications?: { subject?: string; body?: string }): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/ai-agents/client-email/approve/${emailID}`, {
      method: 'POST',
      body: JSON.stringify(modifications || {}),
    });
  }

  /**
   * Reject/cancel pending email response
   */
  async rejectClientResponse(emailID: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/ai-agents/client-email/reject/${emailID}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get client email statistics for dashboard
   */
  async getClientEmailStats(): Promise<ClientEmailStats> {
    return this.makeRequest('/ai-agents/client-email/stats');
  }

  /**
   * Get detailed email thread with messages and pending response
   */
  async getClientEmailThread(threadID: string): Promise<EmailThreadDetail> {
    return this.makeRequest(`/ai-agents/client-email/thread/${threadID}`);
  }

  /**
   * Regenerate AI response for email thread
   */
  async regenerateClientResponse(threadID: string, customInstructions?: string): Promise<ClientEmailResponse> {
    return this.makeRequest(`/ai-agents/client-email/thread/${threadID}/regenerate`, {
      method: 'POST',
      body: JSON.stringify({ customInstructions }),
    });
  }

  /**
   * Get recent client email threads
   */
  async getClientEmailThreads(limit = 20, status?: string): Promise<ClientEmailThread[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const queryString = params.toString();
    return this.makeRequest(`/ai-agents/client-email/threads${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Update email thread status (read/unread, priority)
   */
  async updateClientEmailThreadStatus(
    threadID: string,
    updates: {
      isRead?: boolean;
      priority?: 'low' | 'normal' | 'high';
      status?: 'active' | 'archived' | 'closed';
    }
  ): Promise<{ success: boolean; thread: any }> {
    return this.makeRequest(`/ai-agents/client-email/thread/${threadID}/status`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Get email analytics and performance metrics
   */
  async getClientEmailAnalytics(days = 30): Promise<ClientEmailAnalytics> {
    return this.makeRequest(`/ai-agents/client-email/analytics?days=${days}`);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Helper method to check if there are pending responses
   */
  async hasPendingClientResponses(): Promise<boolean> {
    const pending = await this.getPendingClientResponses();
    return pending.length > 0;
  }

  /**
   * Helper method to get client email overview
   */
  async getClientEmailOverview(): Promise<{
    stats: ClientEmailStats;
    pendingCount: number;
    recentThreads: ClientEmailThread[];
  }> {
    const [stats, pending, threads] = await Promise.all([
      this.getClientEmailStats(),
      this.getPendingClientResponses(),
      this.getClientEmailThreads(5, 'active')
    ]);

    return {
      stats,
      pendingCount: pending.length,
      recentThreads: threads,
    };
  }

  /**
   * Helper method to bulk approve multiple responses
   */
  async bulkApproveResponses(emailIDs: string[]): Promise<{
    successful: string[];
    failed: Array<{ emailID: string; error: string }>;
  }> {
    const successful: string[] = [];
    const failed: Array<{ emailID: string; error: string }> = [];

    for (const emailID of emailIDs) {
      try {
        await this.approveClientResponse(emailID);
        successful.push(emailID);
      } catch (error: any) {
        failed.push({ emailID, error: error.message });
      }
    }

    return { successful, failed };
  }

  /**
   * Helper method to get thread with latest message preview
   */
  async getThreadWithPreview(threadID: string): Promise<EmailThreadDetail & { latestMessagePreview: string }> {
    const threadData = await this.getClientEmailThread(threadID);

    const latestMessage = threadData.messages[0];
    const preview = latestMessage?.text?.substring(0, 150) + '...' || 'No messages';

    return {
      ...threadData,
      latestMessagePreview: preview,
    };
  }
}

export const aiAgentsAPI = new AiAgentsAPI();
