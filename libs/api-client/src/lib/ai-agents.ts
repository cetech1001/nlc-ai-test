import { BaseAPI } from './base';

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

  async pauseSequence(leadID: string) {
    return this.makeRequest(`/ai-agents/lead-followup/${leadID}/pause`, {
      method: 'POST',
    });
  }

  async resumeSequence(leadID: string) {
    return this.makeRequest(`/ai-agents/lead-followup/${leadID}/resume`, {
      method: 'POST',
    });
  }

  async cancelSequence(leadID: string) {
    return this.makeRequest(`/ai-agents/lead-followup/${leadID}/cancel`, {
      method: 'POST',
    });
  }

  async getEmailStats() {
    return this.makeRequest('/ai-agents/email-stats');
  }
}

export const aiAgentsAPI = new AiAgentsAPI();
