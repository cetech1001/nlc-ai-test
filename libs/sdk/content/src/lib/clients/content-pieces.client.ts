import { BaseClient, SearchQuery, Paginated } from "@nlc-ai/sdk-core";
import {
  ContentPiece,
  CreateContentPiece,
  UpdateContentPiece,
  ContentPieceQueryOptions,
  ContentAnalytics,
  ContentAnalyticsQuery
} from "../types";

export class ContentPiecesClient extends BaseClient {
  async getContentPieces(searchOptions: SearchQuery = {}, queryOptions: ContentPieceQueryOptions = {}): Promise<Paginated<ContentPiece>> {
    const params = new URLSearchParams();
    const { page = 1, limit = 20, search } = searchOptions;
    const {
      categoryID,
      contentType,
      platform,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      publishedAfter,
      publishedBefore
    } = queryOptions;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);
    if (categoryID) params.append('categoryID', categoryID);
    if (contentType) params.append('contentType', contentType);
    if (platform) params.append('platform', platform);
    if (status) params.append('status', status);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (publishedAfter) params.append('publishedAfter', publishedAfter);
    if (publishedBefore) params.append('publishedBefore', publishedBefore);

    const response = await this.request<Paginated<ContentPiece>>(
      'GET',
      `?${params.toString()}`
    );
    return response.data!;
  }

  async getAnalytics(query: ContentAnalyticsQuery = {}): Promise<ContentAnalytics> {
    const params = new URLSearchParams();
    const { period, categoryID, contentType } = query;

    if (period) params.append('period', period);
    if (categoryID) params.append('categoryID', categoryID);
    if (contentType) params.append('contentType', contentType);

    const response = await this.request<ContentAnalytics>(
      'GET',
      `/analytics?${params.toString()}`
    );
    return response.data!;
  }

  async getContentPiece(contentPieceID: string): Promise<ContentPiece> {
    const response = await this.request<ContentPiece>('GET', `/${contentPieceID}`);
    return response.data!;
  }

  async createContentPiece(data: CreateContentPiece): Promise<ContentPiece> {
    const response = await this.request<ContentPiece>('POST', '', { body: data });
    return response.data!;
  }

  async updateContentPiece(contentPieceID: string, data: UpdateContentPiece): Promise<ContentPiece> {
    const response = await this.request<ContentPiece>('PATCH', `/${contentPieceID}`, { body: data });
    return response.data!;
  }

  async deleteContentPiece(contentPieceID: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('DELETE', `/${contentPieceID}`);
    return response.data!;
  }

  async duplicateContentPiece(contentPieceID: string): Promise<ContentPiece> {
    const response = await this.request<ContentPiece>('POST', `/${contentPieceID}/duplicate`);
    return response.data!;
  }

  async bulkUpdateStatus(contentPieceIDs: string[], status: string): Promise<{ count: number }> {
    const response = await this.request<{ count: number }>('PATCH', '/bulk/status', {
      body: { contentPieceIDs, status }
    });
    return response.data!;
  }
}
