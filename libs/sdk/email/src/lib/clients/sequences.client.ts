import { BaseClient } from '@nlc-ai/sdk-core';
import {
  EmailSequenceStatus,
  EmailParticipantType,
  EmailSequence,
  EmailMessage, EmailInSequence,
} from '@nlc-ai/types';

export interface CreateSequenceFromAIParams {
  leadID: string;
  name: string;
  description: string;
  emails: Array<{
    sequenceOrder: number;
    subject: string;
    body: string;
    timing: string;
    keyPoints?: string[];
    callToAction?: string;
  }>;
}

export interface GetSequencesParams {
  status?: EmailSequenceStatus;
  isActive?: boolean;
  search?: string;
  targetID?: string;
  targetType?: EmailParticipantType;
}

export interface UpdateEmailParams {
  subject?: string;
  body?: string;
  scheduledFor?: string;
  timing?: string;
}

export interface SequenceAnalytics {
  totalEmails: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  pending: number;
  openRate: number;
  clickRate: number;
}

/**
 * Sequences Client - Manage email sequences
 *
 * This client handles all sequence management operations.
 * For AI content generation, use LeadFollowupClient.
 */
export class SequencesClient extends BaseClient {
  /**
   * Create a sequence from AI-generated emails
   */
  async createSequenceFromAI(params: CreateSequenceFromAIParams): Promise<{ sequence: EmailSequence }> {
    const now = new Date();
    const TIMING_CONFIGS: Record<string, { days: number }> = {
      immediate: { days: 0 },
      '1-day': { days: 1 },
      '2-days': { days: 2 },
      '3-days': { days: 3 },
      '1-week': { days: 7 },
      '2-weeks': { days: 14 },
      '1-month': { days: 30 },
    };

    // Calculate scheduled dates based on timing
    const emailsWithScheduling = params.emails.map((email) => {
      const timingConfig = TIMING_CONFIGS[email.timing] || TIMING_CONFIGS['1-week'];
      const scheduledFor = new Date(now);
      scheduledFor.setDate(scheduledFor.getDate() + timingConfig.days);

      return {
        order: email.sequenceOrder,
        delayDays: timingConfig.days,
        templateID: 'ai-generated', // Placeholder
        subject: email.subject,
        body: email.body,
        metadata: {
          timing: email.timing,
          keyPoints: email.keyPoints,
          callToAction: email.callToAction,
        },
      };
    });

    const response = await this.request<{ sequence: EmailSequence }>(
      'POST',
      '/',
      {
        body: {
          name: params.name,
          description: params.description,
          triggerType: 'manual',
          type: 'follow_up',
          steps: emailsWithScheduling,
        }
      }
    );

    // Execute the sequence immediately for the lead
    if (response.data?.sequence.id) {
      await this.executeSequence(response.data.sequence.id, {
        targetID: params.leadID,
        targetType: EmailParticipantType.LEAD,
      });
    }

    return response.data!;
  }

  /**
   * Get all sequences with optional filters
   */
  async getSequences(params?: GetSequencesParams): Promise<{ sequences: EmailSequence[] }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.search) queryParams.append('search', params.search);

    const response = await this.request<{ sequences: EmailSequence[] }>(
      'GET',
      `/?${queryParams.toString()}`
    );
    return response.data!;
  }

  /**
   * Get specific sequence by ID
   */
  async getSequence(sequenceID: string): Promise<{ sequence: EmailSequence & { emailMessages?: EmailMessage[] } }> {
    const response = await this.request<{ sequence: EmailSequence & { emailMessages?: EmailMessage[] } }>(
      'GET',
      `/${sequenceID}`
    );
    return response.data!;
  }

  /**
   * Get sequences for a specific lead
   */
  async getSequencesForLead(leadID: string): Promise<{ sequences: EmailSequence[] }> {
    return this.getSequences({
      targetID: leadID,
      targetType: EmailParticipantType.LEAD,
    });
  }

  /**
   * Execute a sequence for a target (lead, client, etc.)
   */
  async executeSequence(
    sequenceID: string,
    params: {
      targetID: string;
      targetType: EmailParticipantType;
      templateVariables?: Record<string, any>;
      startDate?: Date;
    }
  ): Promise<{ success: boolean; messagesCreated: number; messageIDs: string[] }> {
    const response = await this.request<{ success: boolean; messagesCreated: number; messageIDs: string[] }>(
      'POST',
      `/${sequenceID}/execute`,
      { body: params }
    );
    return response.data!;
  }

  /**
   * Pause sequence for a specific target
   */
  async pauseSequence(sequenceID: string, targetID: string, targetType: EmailParticipantType): Promise<{ success: boolean; pausedCount: number }> {
    const response = await this.request<{ success: boolean; pausedCount: number }>(
      'POST',
      `/${sequenceID}/pause/${targetID}?targetType=${targetType}`
    );
    return response.data!;
  }

  /**
   * Resume sequence for a specific target
   */
  async resumeSequence(sequenceID: string, targetID: string, targetType: EmailParticipantType): Promise<{ success: boolean; resumedCount: number }> {
    const response = await this.request<{ success: boolean; resumedCount: number }>(
      'POST',
      `/${sequenceID}/resume/${targetID}?targetType=${targetType}`
    );
    return response.data!;
  }

  /**
   * Update sequence configuration
   */
  async updateSequence(
    sequenceID: string,
    updates: {
      name?: string;
      description?: string;
      isActive?: boolean;
      status?: EmailSequenceStatus;
    }
  ): Promise<{ sequence: EmailSequence }> {
    const response = await this.request<{ sequence: EmailSequence }>(
      'PUT',
      `/${sequenceID}`,
      { body: updates }
    );
    return response.data!;
  }

  /**
   * Delete/cancel a sequence
   */
  async deleteSequence(sequenceID: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(
      'DELETE',
      `/${sequenceID}`
    );
    return response.data!;
  }

  /**
   * Get email by ID
   */
  async getEmail(emailID: string) {
    const response = await this.request<{ email: EmailInSequence }>(
      'GET',
      `/emails/${emailID}`
    );
    return response.data!;
  }

  /**
   * Update email content or scheduling
   */
  async updateEmail(emailID: string, updates: UpdateEmailParams) {
    const response = await this.request<{ message: string }>(
      'PATCH',
      `/emails/${emailID}`,
      { body: updates }
    );
    return response.data!;
  }

  /**
   * Get sequence analytics
   */
  async getSequenceAnalytics(sequenceID: string): Promise<{ analytics: SequenceAnalytics }> {
    const response = await this.request<{ analytics: SequenceAnalytics }>(
      'GET',
      `/${sequenceID}/analytics`
    );
    return response.data!;
  }
}
