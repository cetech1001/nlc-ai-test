import { BaseAPI } from './base';

class AiAgentsAPI extends BaseAPI {
  async generateFollowupSequence(leadId: string) {
    return this.makeRequest(`/ai-agents/lead-followup/${leadId}/generate`, {
      method: 'POST',
    });
  }

  async updateLeadStatus(leadId: string, status: string) {
    return this.makeRequest(`/ai-agents/lead-followup/${leadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getEmailHistory(leadId: string) {
    return this.makeRequest(`/ai-agents/lead-followup/${leadId}/history`);
  }

  async getActiveSequences() {
    return this.makeRequest('/ai-agents/lead-followup/sequences');
  }

  async pauseSequence(leadId: string) {
    return this.makeRequest(`/ai-agents/lead-followup/${leadId}/pause`, {
      method: 'POST',
    });
  }

  async resumeSequence(leadId: string) {
    return this.makeRequest(`/ai-agents/lead-followup/${leadId}/resume`, {
      method: 'POST',
    });
  }

  async cancelSequence(leadId: string) {
    return this.makeRequest(`/ai-agents/lead-followup/${leadId}/cancel`, {
      method: 'POST',
    });
  }

  async getEmailStats() {
    return this.makeRequest('/ai-agents/email-stats');
  }
}

export const aiAgentsAPI = new AiAgentsAPI();
