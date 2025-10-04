/// <reference lib="dom"/>

import { BaseClient } from '@nlc-ai/sdk-core';
import type { ApiResponse } from '@nlc-ai/sdk-core';
import {MediaAsset, MediaUploadResult} from "@nlc-ai/types";

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
  /**
   * Upload a media asset (multipart/form-data) to the gateway.
   * @param file File to upload
   * @param options Upload options (folder, tags, metadata, transformation, etc.)
   * @param onProgress Optional progress callback (0-100). If omitted, no progress events are emitted.
   */
  async uploadAsset(
    file: File | Blob,
    options: UploadAssetOptions = {},
    onProgress?: (percent: number) => void
  ): Promise<ApiResponse<any>> {
    // Build FormData exactly how your Nest UploadController expects it
    const form = new FormData();
    form.append('file', file);
    if (options.folder) form.append('folder', options.folder);
    if (options.publicID) form.append('publicID', options.publicID);
    if (typeof options.overwrite === 'boolean') form.append('overwrite', String(options.overwrite));
    if (options.tags && options.tags.length) {
      form.append('tags', options.tags.join(','));
    }
    if (options.metadata) form.append('metadata', JSON.stringify(options.metadata));
    if (options.transformation) form.append('transformation', JSON.stringify(options.transformation));

    const url = `${this.baseURL}/media/upload/asset`;

    // If no progress needed, we can fall back to fetch (simpler)
    if (!onProgress) {
      const headers: Record<string, string> = {};
      const token = this.getToken?.() || this.apiKey;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      // NOTE: Don't set Content-Type for FormData; the browser will set the proper boundary.
      try {
        const controller = new AbortController();
        const timeoutID = setTimeout(() => controller.abort(), this.timeout);
        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: form,
          credentials: 'include',
          signal: controller.signal,
        });
        clearTimeout(timeoutID);
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok) {
          if (contentType.includes('application/json')) {
            const data = await res.json();
            return {
              success: false,
              error: {
                code: data?.error?.code || String(res.status),
                message: data?.error?.message || data?.message || `HTTP ${res.status}`,
                details: data?.error?.details,
              },
              meta: {
                timestamp: new Date().toISOString(),
                path: '/media/upload/asset',
                method: 'POST',
              },
            };
          }
          return {
            success: false,
            error: { code: String(res.status), message: `HTTP ${res.status}` },
            meta: {
              timestamp: new Date().toISOString(),
              path: '/media/upload/asset',
              method: 'POST',
            },
          };
        }
        // success
        const data = contentType.includes('application/json') ? await res.json() : await res.text();
        return data as ApiResponse<any>;
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'NETWORK', message: err?.message || 'Network error' },
          meta: {
            timestamp: new Date().toISOString(),
            path: '/media/upload/asset',
            method: 'POST',
          },
        };
      }
    }

    // With progress: use XHR so we can tap into upload progress events.
    return new Promise<ApiResponse<any>>((resolve) => {
      const xhr = new XMLHttpRequest();
      const token = this.getToken?.() || this.apiKey;

      xhr.open('POST', url, true);
      xhr.withCredentials = true;
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      // Do NOT set Content-Type manually when sending FormData

      // Timeout support
      xhr.timeout = this.timeout;

      // Progress (browser -> gateway)
      xhr.upload.onprogress = (e: ProgressEvent) => {
        if (!onProgress) return;
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          onProgress(Math.min(100, Math.max(0, percent)));
        }
      };

      xhr.onerror = () => {
        resolve({
          success: false,
          error: { code: 'NETWORK', message: 'Network error' },
          meta: {
            timestamp: new Date().toISOString(),
            path: '/media/upload/asset',
            method: 'POST',
          },
        });
      };

      xhr.ontimeout = () => {
        resolve({
          success: false,
          error: { code: 'TIMEOUT', message: 'Request timeout' },
          meta: {
            timestamp: new Date().toISOString(),
            path: '/media/upload/asset',
            method: 'POST',
          },
        });
      };

      xhr.onload = () => {
        const contentType = xhr.getResponseHeader('content-type') || '';
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = contentType.includes('application/json')
              ? JSON.parse(xhr.responseText)
              : xhr.responseText;
            resolve(data as ApiResponse<any>);
          } catch {
            resolve({
              success: false,
              error: { code: 'PARSE', message: 'Failed to parse response' },
              meta: {
                timestamp: new Date().toISOString(),
                path: '/media/upload/asset',
                method: 'POST',
              },
            });
          }
        } else {
          let message = `HTTP ${xhr.status}`;
          try {
            const parsed = JSON.parse(xhr.responseText);
            message = parsed?.error?.message || parsed?.message || message;
          } catch {}
          resolve({
            success: false,
            error: { code: String(xhr.status), message },
            meta: {
              timestamp: new Date().toISOString(),
              path: '/media/upload/asset',
              method: 'POST',
            },
          });
        }
      };

      xhr.send(form);
    });
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
