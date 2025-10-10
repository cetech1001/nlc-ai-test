import { BaseClient } from '@nlc-ai/sdk-core';
import {ChatbotCustomization} from "@nlc-ai/types";

export interface ChatbotCustomizationUpdateData {
  name: string;
  avatarUrl?: string;
  logoUrl?: string;
  primaryColor: string;
  gradientStart: string;
  gradientEnd: string;
  assistantTextColor: string;
  assistantBubbleColor: string;
  userTextColor: string;
  userBubbleColor: string;
  backgroundColor: string;
  glowColor: string;
  position: string;
  greeting?: string;
}

export class ChatbotCustomizationClient extends BaseClient {
  /**
   * Get chatbot customization for current coach
   */
  async getCustomization(): Promise<ChatbotCustomization> {
    const response = await this.request<ChatbotCustomization>(
      'GET',
      ''
    );
    return response.data!;
  }

  /**
   * Update chatbot customization
   */
  async updateCustomization(data: ChatbotCustomizationUpdateData): Promise<ChatbotCustomization> {
    const response = await this.request<ChatbotCustomization>(
      'PUT',
      '',
      { body: data }
    );
    return response.data!;
  }

  /**
   * Get public chatbot customization for a specific coach
   */
  async getPublicCustomization(coachID: string): Promise<Partial<ChatbotCustomization>> {
    const response = await this.request<Partial<ChatbotCustomization>>(
      'GET',
      `/public/${coachID}`
    );
    return response.data!;
  }
}
