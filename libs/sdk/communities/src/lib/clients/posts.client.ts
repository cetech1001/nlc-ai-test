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
  async createPost(communityID: string, postData: CreatePostRequest): Promise<PostResponse> {
    const response = await this.request<PostResponse>('POST', `/${communityID}/posts`, { body: postData });
    return response.data!;
  }

  async getPosts(communityID: string, filters?: PostFilters): Promise<Paginated<PostResponse>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<PostResponse>>('GET', `/${communityID}/posts?${searchParams}`);
    return response.data!;
  }

  async getPost(communityID: string, id: string): Promise<PostResponse> {
    const response = await this.request<PostResponse>('GET', `/${communityID}/posts/${id}`);
    return response.data!;
  }

  async updatePost(communityID: string, id: string, updateData: UpdatePostRequest): Promise<PostResponse> {
    const response = await this.request<PostResponse>('PUT', `/${communityID}/posts/${id}`, { body: updateData });
    return response.data!;
  }

  async deletePost(communityID: string, id: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('DELETE', `/${communityID}/posts/${id}`);
    return response.data!;
  }

  async reactToPost(communityID: string, postID: string, reaction: ReactToPostRequest): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('POST', `/${communityID}/posts/${postID}/reactions`, { body: reaction });
    return response.data!;
  }

  async createComment(communityID: string, postID: string, commentData: CreateCommentRequest): Promise<PostResponse> {
    const response = await this.request<PostResponse>('POST', `/${communityID}/posts/${postID}/comments`, { body: commentData });
    return response.data!;
  }

  async getComments(communityID: string, postID: string, filters?: CommentFilters): Promise<Paginated<PostComment>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<PostComment>>('GET', `/${communityID}/posts/${postID}/comments?${searchParams}`);
    return response.data!;
  }

  async reactToComment(communityID: string, commentID: string, reaction: ReactToPostRequest): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('POST', `/${communityID}/posts/comments/${commentID}/reactions`, { body: reaction });
    return response.data!;
  }
}
