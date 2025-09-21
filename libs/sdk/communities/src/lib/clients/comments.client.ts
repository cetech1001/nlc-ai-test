import { BaseClient, Paginated } from '@nlc-ai/sdk-core';
import {
  CommentFilters,
  CreateCommentRequest,
  UpdateCommentRequest,
  PostCommentResponse,
  ReactToPostRequest,
} from '../types';

export class CommentsClient extends BaseClient {
  async createComment(communityID: string, commentData: CreateCommentRequest): Promise<PostCommentResponse> {
    const response = await this.request<PostCommentResponse>('POST', `/${communityID}/comments`, { body: commentData });
    return response.data!;
  }

  async getComments(communityID: string, filters?: CommentFilters): Promise<Paginated<PostCommentResponse>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<PostCommentResponse>>('GET', `/${communityID}/comments?${searchParams}`);
    return response.data!;
  }

  async getComment(communityID: string, id: string): Promise<PostCommentResponse> {
    const response = await this.request<PostCommentResponse>('GET', `/${communityID}/comments/${id}`);
    return response.data!;
  }

  async updateComment(communityID: string, id: string, updateData: UpdateCommentRequest): Promise<PostCommentResponse> {
    const response = await this.request<PostCommentResponse>('PUT', `/${communityID}/comments/${id}`, { body: updateData });
    return response.data!;
  }

  async deleteComment(communityID: string, id: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('DELETE', `/${communityID}/comments/${id}`);
    return response.data!;
  }

  async reactToComment(communityID: string, commentID: string, reaction: ReactToPostRequest): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('POST', `/${communityID}/comments/${commentID}/reactions`, { body: reaction });
    return response.data!;
  }

  async getReplies(communityID: string, commentID: string, filters?: CommentFilters): Promise<Paginated<PostCommentResponse>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<PostCommentResponse>>('GET', `/${communityID}/comments/${commentID}/replies?${searchParams}`);
    return response.data!;
  }
}
