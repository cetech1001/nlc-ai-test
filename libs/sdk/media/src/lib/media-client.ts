import {BaseClient} from '@nlc-ai/sdk-core';
import {MediaAsset, MediaFilters, MediaUploadOptions, MediaUploadResult} from './media.types';

export class MediaServiceClient extends BaseClient {
  async uploadAsset(file: File, options?: MediaUploadOptions): Promise<MediaUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    if (options?.folder) formData.append('folder', options.folder);
    if (options?.publicID) formData.append('publicID', options.publicID);
    if (options?.overwrite) formData.append('overwrite', String(options.overwrite));
    if (options?.tags) {
      formData.append('tags', options.tags.join(','));
    }
    if (options?.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }
    if (options?.transformation) {
      formData.append('transformation', JSON.stringify(options.transformation));
    }

    return this.request<MediaAsset>(
      'POST',
      '/upload/asset',
      {
        body: formData,
        headers: {}
      }
    );
  }

  async uploadAvatar(file: File): Promise<MediaUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.request<MediaUploadResult>(
      'POST',
      '/upload/avatar',
      {
        body: formData,
        headers: {}
      }
    );

    return response.data!;
  }

  async getAssets(filters?: MediaFilters): Promise<{
    assets: MediaAsset[];
    total: number;
    page: number;
    limit: number;
  }> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const response = await this.request<{
      assets: MediaAsset[];
      total: number;
      page: number;
      limit: number;
    }>('GET', `/media?${searchParams}`);

    return response.data!;
  }

  async getAsset(id: string): Promise<MediaAsset> {
    const response = await this.request<MediaAsset>('GET', `/media/${id}`);
    return response.data!;
  }

  async deleteAsset(id: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('DELETE', `/media/${id}`);
    return response.data!;
  }

  async generateUrl(id: string, transformations?: any[]): Promise<{ url: string }> {
    const response = await this.request<{ url: string }>(
      'POST',
      `/media/${id}/url`,
      { body: transformations || [] }
    );
    return response.data!;
  }

  async getAssetStats(id: string): Promise<{
    assetID: string;
    views: number;
    downloads: number;
    lastAccessed: string | null;
  }> {
    const response = await this.request<{
      assetID: string;
      views: number;
      downloads: number;
      lastAccessed: string | null;
    }>('GET', `/media/${id}/stats`);
    return response.data!;
  }
}
