import { BaseClient } from '@nlc-ai/sdk-core';
import {
  CreateSequenceRequest, EmailAnalysis,
  EmailInSequence,
  EmailSequenceWithEmails, RegenerateEmailsRequest,
  UpdateEmailRequest,
  UpdateSequenceRequest
} from "@nlc-ai/types";

export class LeadFollowupClient extends BaseClient {
  async generateFollowupSequence(data: CreateSequenceRequest): Promise<EmailSequenceWithEmails> {
    const response = await this.request<EmailSequenceWithEmails>('POST', '/create-sequence', {
      body: data,
    });
    return response.data!;
  }

  async getSequenceWithEmails(sequenceID: string): Promise<EmailSequenceWithEmails> {
    const response = await this.request<EmailSequenceWithEmails>('GET', `/sequence/${sequenceID}`);
    return response.data!;
  }

  async updateSequence(sequenceID: string, updates: Omit<UpdateSequenceRequest, 'sequenceID'>): Promise<EmailSequenceWithEmails> {
    const response = await this.request<EmailSequenceWithEmails>('PATCH', `/sequence/${sequenceID}`, {
      body: { updates },
    });
    return response.data!;
  }

  async updateEmail(emailID: string, updates: UpdateEmailRequest['updates']): Promise<EmailInSequence> {
    const response = await this.request<EmailInSequence>('PATCH', `/email/${emailID}`, {
      body: updates,
    });
    return response.data!;
  }

  async regenerateEmails(data: RegenerateEmailsRequest): Promise<EmailInSequence[]> {
    const response = await this.request<EmailInSequence[]>('POST', `/sequence/${data.sequenceID}/regenerate`, {
      body: data,
    });
    return response.data!;
  }

  async getEmailByID(emailID: string): Promise<{
    email: EmailInSequence;
    deliverabilityAnalysis: Omit<EmailAnalysis, 'strengths'>;
    suggestions: string[];
  }> {
    const response = await this.request<{
      email: EmailInSequence;
      deliverabilityAnalysis: Omit<EmailAnalysis, 'strengths'>;
      suggestions: string[];
    }>('GET', `/email/${emailID}/preview`);
    return response.data!;
  }

  async getSequencesForLead(leadID: string): Promise<{
    sequences: EmailSequenceWithEmails[],
    currentSequence: EmailSequenceWithEmails,
    sequenceHistory: EmailSequenceWithEmails[],
  }> {
    const response = await this.request<{
      sequences: EmailSequenceWithEmails[],
      currentSequence: EmailSequenceWithEmails,
      sequenceHistory: EmailSequenceWithEmails[],
    }>('GET', `/sequences/lead/${leadID}`);
    return response.data!;
  }

  async pauseSequence(sequenceID: string): Promise<void> {
    await this.request('POST', `/sequence/${sequenceID}/pause`);
  }

  async resumeSequence(sequenceID: string): Promise<void> {
    await this.request('POST', `/sequence/${sequenceID}/resume`);
  }

  async cancelSequence(sequenceID: string): Promise<void> {
    await this.request('POST', `/sequence/${sequenceID}/cancel`);
  }
}
