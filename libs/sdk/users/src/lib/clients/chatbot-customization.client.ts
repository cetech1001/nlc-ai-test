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
  requireUserInfo: boolean;
  requireName: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
}

export class ChatbotCustomizationClient extends BaseClient {
  async getCustomization(): Promise<ChatbotCustomization> {
    const response = await this.request<ChatbotCustomization>(
      'GET',
      ''
    );
    return response.data!;
  }

  async updateCustomization(data: ChatbotCustomizationUpdateData): Promise<ChatbotCustomization> {
    const response = await this.request<ChatbotCustomization>(
      'PUT',
      '',
      { body: data }
    );
    return response.data!;
  }

  async getPublicCustomization(coachID: string): Promise<Partial<ChatbotCustomization>> {
    const response = await this.request<Partial<ChatbotCustomization>>(
      'GET',
      `/public/${coachID}`
    );
    return response.data!;
  }
}
