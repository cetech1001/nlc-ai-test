import { BaseClient } from '@nlc-ai/sdk-core';
import {AgentConversation, AgentConversationMessage, ConversationArtifact, ConversationHistory} from "@nlc-ai/types";

export interface StartConversationResponse {
  conversation: AgentConversation;
  firstResponse: AgentConversationMessage;
}

export interface CreateArtifactRequest {
  type: 'content_script' | 'social_post' | 'blog_outline';
  title: string;
  requirements: {
    platform?: string[];
    contentType?: string;
    targetAudience?: string;
    tone?: string;
    length?: string;
  };
}

export interface RefineArtifactRequest {
  refinements: string;
  changes?: {
    tone?: string;
    length?: string;
    focus?: string;
  };
}

export interface ArtifactResponse {
  artifact: ConversationArtifact;
  message: string;
}

export class ContentSuggestionConversationClient extends BaseClient {
  /**
   * Start new content creation conversation
   */
  async startConversation(data: {
    message: string;
    title?: string;
  }): Promise<StartConversationResponse> {
    const response = await this.request<StartConversationResponse>(
      'POST',
      '/start',
      { body: data }
    );
    return response.data!;
  }

  /**
   * Send message in conversation
   */
  async sendMessage(conversationID: string, data: {
    message: string;
  }): Promise<AgentConversationMessage> {
    const response = await this.request<AgentConversationMessage>(
      'POST',
      `/${conversationID}/message`,
      { body: data }
    );
    return response.data!;
  }

  /**
   * Get conversation with full history
   */
  async getConversation(conversationID: string): Promise<ConversationHistory> {
    const response = await this.request<ConversationHistory>(
      'GET',
      `/${conversationID}`
    );
    return response.data!;
  }

  /**
   * Get all content creation conversations
   */
  async getConversations(): Promise<AgentConversation[]> {
    const response = await this.request<AgentConversation[]>(
      'GET',
      ''
    );
    return response.data!;
  }

  /**
   * Generate content artifact
   */
  async createArtifact(conversationID: string, data: CreateArtifactRequest): Promise<ArtifactResponse> {
    const response = await this.request<ArtifactResponse>(
      'POST',
      `/${conversationID}/artifact`,
      { body: data }
    );
    return response.data!;
  }

  /**
   * Refine existing artifact
   */
  async refineArtifact(
    conversationID: string,
    artifactID: string,
    data: RefineArtifactRequest
  ): Promise<ArtifactResponse> {
    const response = await this.request<ArtifactResponse>(
      'POST',
      `/${conversationID}/artifact/${artifactID}/refine`,
      { body: data }
    );
    return response.data!;
  }
}
