import { BaseAPI } from './base';
import {
  CreateSequenceRequest, EmailInSequence,
  EmailSequenceWithEmails,
  RegenerateEmailsRequest,
  UpdateEmailRequest,
  UpdateSequenceRequest
} from "@nlc-ai/types";

class AiAgentsAPI extends BaseAPI {
  async generateFollowupSequence(leadID: string) {
    return this.makeRequest(`/ai-agents/lead-followup/${leadID}/generate`, {
      method: 'POST',
    });
  }

  async updateLeadStatus(leadID: string, status: string) {
    return this.makeRequest(`/ai-agents/lead-followup/${leadID}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getEmailHistory(leadID: string): Promise<any[]> {
    return this.makeRequest(`/ai-agents/lead-followup/${leadID}/history`);
  }

  async getActiveSequences(): Promise<any[]> {
    return this.makeRequest('/ai-agents/lead-followup/sequences');
  }

  async getEmailStats() {
    return this.makeRequest('/ai-agents/email-stats');
  }

  async createFlexibleSequence(data: CreateSequenceRequest): Promise<EmailSequenceWithEmails> {
    const response: any = await this.makeRequest('/ai-agents/lead-followup/flexible/create-sequence', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getSequenceWithEmails(sequenceID: string): Promise<EmailSequenceWithEmails> {
    const response: any = await this.makeRequest(`/ai-agents/lead-followup/flexible/sequence/${sequenceID}`);
    return response.data;
  }

  async updateSequence(sequenceID: string, updates: Omit<UpdateSequenceRequest, 'sequenceID'>): Promise<EmailSequenceWithEmails> {
    const response: any = await this.makeRequest(`/ai-agents/lead-followup/flexible/sequence/${sequenceID}`, {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    });
    return response.data;
  }

  async updateEmail(emailID: string, updates: Omit<UpdateEmailRequest, 'emailID'>): Promise<EmailInSequence> {
    const response: any = await this.makeRequest(`/ai-agents/lead-followup/flexible/email/${emailID}`, {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    });
    return response.data;
  }

  async regenerateEmails(data: RegenerateEmailsRequest): Promise<EmailInSequence[]> {
    const response: any = await this.makeRequest(`/ai-agents/lead-followup/flexible/sequence/${data.sequenceID}/regenerate`, {
      body: JSON.stringify(data),
      method: 'POST',
    });
    return response.data;
  }

  async getEmailById(emailID: string): Promise<EmailInSequence> {
    const response: any = await this.makeRequest(`/ai-agents/lead-followup/flexible/email/${emailID}`);
    return response.data;
  }

  async getSequencesForLead(leadID: string): Promise<EmailSequenceWithEmails[]> {
    const response: any = await this.makeRequest(`/ai-agents/lead-followup/flexible/sequences/lead/${leadID}`);
    return response.data;
  }

  async pauseSequence(sequenceID: string): Promise<void> {
    await this.makeRequest(`/ai-agents/lead-followup/flexible/sequence/${sequenceID}/pause`, {
      method: 'POST',
    });
  }

  async resumeSequence(sequenceID: string): Promise<void> {
    await this.makeRequest(`/ai-agents/lead-followup/flexible/sequence/${sequenceID}/resume`, {
      method: 'POST',
    });
  }

  async cancelSequence(sequenceID: string): Promise<void> {
    await this.makeRequest(`/ai-agents/lead-followup/flexible/sequence/${sequenceID}/cancel`, {
      method: 'POST',
    });
  }

  async analyzeEmailDeliverability(data: AnalyzeEmailRequest): Promise<DeliverabilityAnalysis> {
    const response = await api.post('/ai-agents/email-deliverability/analyze', data);
    return response.data;
  }

  async quickDeliverabilityCheck(subject: string, body: string): Promise<{ score: number; issues: string[] }> {
    const response = await api.post('/ai-agents/email-deliverability/quick-check', { subject, body });
    return response.data;
  }

  // Coach Replica Methods
  async getCoachProfile(coachID: string, refresh = false): Promise<CoachKnowledgeProfile> {
    const response = await api.get(`/ai-agents/coach-replica/profile/${coachID}`, {
      params: { refresh: refresh.toString() }
    });
    return response.data;
  }

  async generateCoachResponse(data: CoachReplicaRequest): Promise<CoachReplicaResponse> {
    const response = await api.post('/ai-agents/coach-replica/generate-response', data);
    return response.data;
  }

  async testCoachReplica(coachID: string, query: string): Promise<CoachReplicaResponse> {
    const response = await api.post(`/ai-agents/coach-replica/test/${coachID}`, { query });
    return response.data;
  }

  async clearCoachCache(coachID: string): Promise<void> {
    await api.post(`/ai-agents/coach-replica/clear-cache/${coachID}`);
  }
}

export const aiAgentsAPI = new AiAgentsAPI();
