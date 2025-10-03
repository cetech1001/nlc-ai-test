import {BaseClient, Paginated} from '@nlc-ai/sdk-core';
import {
  CreatePostRequest,
  UpdatePostRequest,
  PostFilters,
  PostResponse,
  ReactToPostRequest,
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

  async togglePinPost(communityID: string, postID: string): Promise<PostResponse> {
    const response = await this.request<PostResponse>('PUT', `/${communityID}/posts/${postID}/pin`);
    return response.data!;
  }

  async getPostByID(communityID: string, postID: string): Promise<PostResponse> {
    const response = await this.request<PostResponse>('GET', `/${communityID}/posts/${postID}`);
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
}
