import { BaseClient } from '@nlc-ai/sdk-core';
import type { OnboardingData, CoachingProfile } from '@nlc-ai/types';

export interface OnboardingCompleteResponse {
  success: boolean;
  message: string;
  assistantID: string;
  vectorStoreID: string;
}

export interface OnboardingStatusResponse {
  isComplete: boolean;
  completedAt?: Date;
  scenariosCompleted: number;
  documentsUploaded: number;
  connectionsLinked: number;
  completionScore: number;
}

export interface SaveProgressResponse {
  success: boolean;
  message: string;
}

export interface RegenerateInstructionsResponse {
  success: boolean;
  message: string;
}

export class OnboardingClient extends BaseClient {
  /**
   * Complete onboarding and train AI assistant
   */
  async complete(data: OnboardingData): Promise<OnboardingCompleteResponse> {
    const response = await this.request<OnboardingCompleteResponse>(
      'POST',
      '/complete',
      { body: data }
    );
    return response.data!;
  }

  /**
   * Save onboarding progress without completing
   */
  async saveProgress(data: Partial<OnboardingData>): Promise<SaveProgressResponse> {
    const response = await this.request<SaveProgressResponse>(
      'POST',
      '/save-progress',
      { body: data }
    );
    return response.data!;
  }

  /**
   * Get onboarding data for prefilling
   */
  async getData(): Promise<OnboardingData> {
    const response = await this.request<OnboardingData>(
      'GET',
      '/data'
    );
    return response.data!;
  }

  /**
   * Get onboarding status
   */
  async getStatus(): Promise<OnboardingStatusResponse> {
    const response = await this.request<OnboardingStatusResponse>(
      'GET',
      '/status'
    );
    return response.data!;
  }

  /**
   * Get generated coaching profile
   */
  async getProfile(): Promise<CoachingProfile> {
    const response = await this.request<CoachingProfile>(
      'GET',
      '/profile'
    );
    return response.data!;
  }

  /**
   * Regenerate AI instructions from onboarding data
   */
  async regenerateInstructions(): Promise<RegenerateInstructionsResponse> {
    const response = await this.request<RegenerateInstructionsResponse>(
      'POST',
      '/regenerate-instructions'
    );
    return response.data!;
  }
}
