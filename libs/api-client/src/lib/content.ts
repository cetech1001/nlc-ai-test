import { BaseAPI } from './base';
import {
  ContentCategory,
  ContentPiece,
  ContentQueryParams, ContentStats,
  CreateCategoryData,
  Paginated,
  UpdateCategoryData, UploadVideoData
} from '@nlc-ai/types';

class ContentAPI extends BaseAPI {
  // Categories
  async getCategories(): Promise<ContentCategory[]> {
    return this.makeRequest('/content/categories');
  }

  async getCategory(id: string): Promise<ContentCategory> {
    return this.makeRequest(`/content/categories/${id}`);
  }

  async createCategory(data: CreateCategoryData): Promise<ContentCategory> {
    return this.makeRequest('/content/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: UpdateCategoryData): Promise<ContentCategory> {
    return this.makeRequest(`/content/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.makeRequest(`/content/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Videos
  async getVideos(params: ContentQueryParams = {}): Promise<Paginated<ContentPiece>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`/content/videos?${searchParams.toString()}`);
  }

  async getVideosByCategory(categoryID: string, params: ContentQueryParams = {}): Promise<ContentPiece[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('categoryID', categoryID);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && key !== 'categoryID') {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`/content/videos?${searchParams.toString()}`);
  }

  async getVideo(id: string): Promise<ContentPiece> {
    return this.makeRequest(`/content/videos/${id}`);
  }

  async uploadVideo(data: UploadVideoData): Promise<ContentPiece> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('categoryID', data.categoryID);

    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);

    return this.makeRequest('/content/videos/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      },
    });
  }

  async updateVideo(id: string, data: Partial<ContentPiece>): Promise<ContentPiece> {
    return this.makeRequest(`/content/videos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteVideo(id: string): Promise<void> {
    return this.makeRequest(`/content/videos/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getContentStats(): Promise<ContentStats> {
    return this.makeRequest('/content/stats');
  }

  async getCategoryStats(categoryID: string): Promise<{
    totalVideos: number;
    totalViews: number;
    avgEngagement: number;
    totalDuration: number;
  }> {
    return this.makeRequest(`/content/categories/${categoryID}/stats`);
  }

  async incrementVideoViews(videoID: string): Promise<void> {
    return this.makeRequest(`/content/videos/${videoID}/view`, {
      method: 'POST',
    });
  }
}

export const contentAPI = new ContentAPI();
