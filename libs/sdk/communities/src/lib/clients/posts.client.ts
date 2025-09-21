import {BaseClient, Paginated} from '@nlc-ai/sdk-core';
import {
  CreatePostRequest,
  UpdatePostRequest,
  PostFilters,
  CommentFilters,
  PostResponse,
  CreateCommentRequest,
  ReactToPostRequest,
  PostComment,
} from '../types';

export class PostsClient extends BaseClient {
  async createPost(postData: CreatePostRequest): Promise<PostResponse> {
    const response = await this.request<PostResponse>('POST', '', { body: postData });
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

    const response = await this.request<Paginated<PostResponse>>('GET', `?${searchParams}`);
    return response.data!;
  }

  async getPost(id: string): Promise<PostResponse> {
    const response = await this.request<PostResponse>('GET', `/${id}`);
    return response.data!;
  }

  async updatePost(id: string, updateData: UpdatePostRequest): Promise<PostResponse> {
    const response = await this.request<PostResponse>('PUT', `/${id}`, { body: updateData });
    return response.data!;
  }

  async deletePost(id: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('DELETE', `/${id}`);
    return response.data!;
  }

  async reactToPost(postID: string, reaction: ReactToPostRequest): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('POST', `/${postID}/reactions`, { body: reaction });
    return response.data!;
  }

  async createComment(postID: string, commentData: CreateCommentRequest): Promise<PostResponse> {
    const response = await this.request<PostResponse>('POST', `/${postID}/comments`, { body: commentData });
    return response.data!;
  }

  async getComments(postID: string, filters?: CommentFilters): Promise<Paginated<PostComment>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<PostComment>>('GET', `/${postID}/comments?${searchParams}`);
    return response.data!;
  }

  async reactToComment(commentID: string, reaction: ReactToPostRequest): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('POST', `/comments/${commentID}/reactions`, { body: reaction });
    return response.data!;
  }
}
