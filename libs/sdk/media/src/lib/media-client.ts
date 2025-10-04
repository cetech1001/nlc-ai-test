/// <reference lib="dom"/>

import { BaseClient } from '@nlc-ai/sdk-core';
import {MediaAsset, MediaUploadOptions, MediaUploadResult} from "@nlc-ai/types";

import {MediaFilters} from "./media.types";

export type UploadAssetOptions = {
  folder?: string;
  publicID?: string;
  overwrite?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  transformation?: Array<any>;
};

/**
 * MediaClient
 * - Adds uploadAsset(file, options, onProgress?) with real browser->server progress via XHR.
 * - For other endpoints, continue using BaseClient.request.
 */
export class MediaClient extends BaseClient {
  async uploadAsset(file: File, options?: MediaUploadOptions) {
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

    return this.request<MediaUploadResult>(
      'POST',
      '/upload/asset',
      {
        body: formData,
        headers: {}
      }
    );
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<MediaUploadResult>(
      'POST',
      '/upload/avatar',
      {
        body: formData,
        headers: {}
      }
    );
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
    }>('GET', `?${searchParams}`);

    return response.data!;
  }

  async getAsset(id: string): Promise<MediaAsset> {
    const response = await this.request<MediaAsset>('GET', `/${id}`);
    return response.data!;
  }

  async deleteAsset(id: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('DELETE', `/${id}`);
    return response.data!;
  }

  async generateUrl(id: string, transformations?: any[]): Promise<{ url: string }> {
    const response = await this.request<{ url: string }>(
      'POST',
      `/${id}/url`,
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
    }>('GET', `/${id}/stats`);
    return response.data!;
  }

  async checkProcessingStatus(assetID: string) {
    return this.request<{
      status: 'pending' | 'processing' | 'complete' | 'error';
      asset?: MediaAsset;
    }>('GET', `/${assetID}/processing-status`);
  }

  initMultipart(body: {
    filename: string; size: number; folder?: string; tags?: string[]; metadata?: Record<string, any>;
  }) {
    return this.request<any>('POST', '/upload/multipart/init', { body });
  }

  getPartUrl(body: { uploadId: string; key: string; partNumber: number; }) {
    return this.request<any>('POST', '/upload/multipart/part-url', { body });
  }

  completeMultipart(body: {
    uploadId: string; key: string;
    parts: { ETag: string; PartNumber: number }[];
  }) {
    return this.request<any>('POST', '/upload/multipart/complete', { body });
  }
}
