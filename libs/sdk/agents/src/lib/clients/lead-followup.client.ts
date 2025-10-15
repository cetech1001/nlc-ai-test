import { BaseClient } from '@nlc-ai/sdk-core';

export interface GenerateSequenceParams {
  leadID: string;
  sequenceConfig?: {
    emailCount?: number;
    sequenceType?: 'aggressive' | 'standard' | 'nurturing' | 'minimal';
    customInstructions?: string;
    timings?: string[];
  };
}

export interface RegenerateEmailsParams {
  sequenceID: string;
  emailOrders: number[];
  customInstructions?: string;
}

export interface GeneratedEmail {
  sequenceOrder: number;
  subject: string;
  body: string;
  keyPoints: string[];
  callToAction: string;
}

export interface GenerateSequenceResponse {
  message: string;
  emails: GeneratedEmail[];
  sequenceConfig: {
    emailCount: number;
    sequenceType: string;
    timings: string[];
  };
}

export interface RegenerateEmailsResponse {
  message: string;
  emails: GeneratedEmail[];
}

/**
 * Lead Followup Client - AI-powered email sequence generation
 *
 * This client focuses purely on AI content generation for lead follow-up sequences.
 * For sequence management (pause, resume, cancel, etc.), use the SequencesClient.
 */
export class LeadFollowupClient extends BaseClient {
  /**
   * Generate AI-powered follow-up sequence for a lead
   * Returns generated email content that can be used to create a sequence
   */
  async generateFollowupSequence(params: GenerateSequenceParams) {
    const response = await this.request<GenerateSequenceResponse>(
      'POST',
      '/generate',
      { body: params }
    );
    return response.data!;
  }

  /**
   * Regenerate specific emails in a sequence with AI
   * Returns new email content that can be used to update the sequence
   */
  async regenerateEmails(params: RegenerateEmailsParams) {
    const response = await this.request<RegenerateEmailsResponse>(
      'POST',
      '/regenerate',
      { body: params }
    );
    return response.data!;
  }
}
