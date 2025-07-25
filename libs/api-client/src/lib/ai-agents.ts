import { BaseAPI } from './base';
import {
  AnalyzeEmailRequest, CoachKnowledgeProfile, CoachReplicaRequest, CoachReplicaResponse,
  CreateSequenceRequest, DeliverabilityAnalysis, EmailAnalysis, EmailInSequence,
  EmailSequenceWithEmails,
  RegenerateEmailsRequest,
  UpdateEmailRequest,
  UpdateSequenceRequest
} from "@nlc-ai/types";

class AiAgentsAPI extends BaseAPI {
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

  // Coach Replica Methods
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
}

export const aiAgentsAPI = new AiAgentsAPI();
