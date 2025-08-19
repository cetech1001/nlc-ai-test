import {BaseServiceClient, Paginated} from '@nlc-ai/sdk-core';
import {
  CommunityFilters,
  CommunityResponse,
  CreatePostRequest,
  UpdatePostRequest,
  PostFilters,
  PostResponse,
  CreateCommentRequest,
  ReactToPostRequest,
  CommentListResponse,
  CreateConversationRequest,
  ConversationResponse,
  CreateMessageRequest,
  MessageResponse,
  MessageFilters,
  MessageListResponse,
  UnreadCountResponse,
  ActionResponse,
} from './community.types';
import {CommunityType} from "./enums";

export class CommunityServiceClient extends BaseServiceClient {
  // Community methods
  async getCommunities(filters?: CommunityFilters): Promise<Paginated<CommunityResponse>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<CommunityResponse>>(
      'GET',
      `/communities?${searchParams}`
    );
    return response.data!;
  }

  async getCommunity(id: string): Promise<CommunityResponse> {
    const response = await this.request<CommunityResponse>('GET', `/communities/${id}`);
    return response.data!;
  }

  async getCoachToCommunity(): Promise<CommunityResponse> {
    const response = await this.request<Paginated<CommunityResponse>>(
      'GET',
      `/communities?type=${CommunityType.COACH_TO_COACH}&memberOf=true&limit=1`
    );

    if (response.data!.data.length === 0) {
      throw new Error('Coach-to-coach community not found');
    }

    return response.data!.data[0];
  }

  // Post methods
  async createPost(postData: CreatePostRequest): Promise<PostResponse> {
    const response = await this.request<PostResponse>('POST', '/posts', { body: postData });
    return response.data!;
  }

  async getPosts(filters?: PostFilters): Promise<Paginated<PostResponse>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<PostResponse>>('GET', `/posts?${searchParams}`);
    return response.data!;
  }

  async getPost(id: string): Promise<PostResponse> {
    const response = await this.request<PostResponse>('GET', `/posts/${id}`);
    return response.data!;
  }

  async updatePost(id: string, updateData: UpdatePostRequest): Promise<PostResponse> {
    const response = await this.request<PostResponse>('PUT', `/posts/${id}`, { body: updateData });
    return response.data!;
  }

  async deletePost(id: string): Promise<ActionResponse> {
    const response = await this.request<ActionResponse>('DELETE', `/posts/${id}`);
    return response.data!;
  }

  async reactToPost(postID: string, reaction: ReactToPostRequest): Promise<ActionResponse> {
    const response = await this.request<ActionResponse>('POST', `/posts/${postID}/reactions`, { body: reaction });
    return response.data!;
  }

  async createComment(postID: string, commentData: CreateCommentRequest): Promise<PostResponse> {
    const response = await this.request<PostResponse>('POST', `/posts/${postID}/comments`, { body: commentData });
    return response.data!;
  }

  async getComments(postID: string, page = 1, limit = 20): Promise<CommentListResponse> {
    const response = await this.request<CommentListResponse>('GET', `/posts/${postID}/comments?page=${page}&limit=${limit}`);
    return response.data!;
  }

  async reactToComment(commentID: string, reaction: ReactToPostRequest): Promise<ActionResponse> {
    const response = await this.request<ActionResponse>('POST', `/posts/comments/${commentID}/reactions`, { body: reaction });
    return response.data!;
  }

  // Message methods
  async createConversation(conversationData: CreateConversationRequest): Promise<ConversationResponse> {
    const response = await this.request<ConversationResponse>('POST', '/messages/conversations', { body: conversationData });
    return response.data!;
  }

  async getConversations(page = 1, limit = 20): Promise<ConversationResponse[]> {
    const response = await this.request<Paginated<ConversationResponse>>('GET', `/messages/conversations?page=${page}&limit=${limit}`);
    return response.data!.data;
  }

  async sendMessage(conversationID: string, messageData: CreateMessageRequest): Promise<MessageResponse> {
    const response = await this.request<MessageResponse>('POST', `/messages/conversations/${conversationID}/messages`, { body: messageData });
    return response.data!;
  }

  async getMessages(conversationID: string, filters?: MessageFilters): Promise<MessageListResponse> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<MessageListResponse>('GET', `/messages/conversations/${conversationID}/messages?${searchParams}`);
    return response.data!;
  }

  async markAsRead(conversationID: string): Promise<ActionResponse> {
    const response = await this.request<ActionResponse>('PUT', `/messages/conversations/${conversationID}/read`);
    return response.data!;
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await this.request<UnreadCountResponse>('GET', '/messages/unread-count');
    return response.data!;
  }

  async editMessage(messageID: string, content: string): Promise<MessageResponse> {
    const response = await this.request<MessageResponse>('PUT', `/messages/messages/${messageID}`, { body: { content } });
    return response.data!;
  }

  async deleteMessage(messageID: string): Promise<ActionResponse> {
    const response = await this.request<ActionResponse>('DELETE', `/messages/messages/${messageID}`);
    return response.data!;
  }
}
