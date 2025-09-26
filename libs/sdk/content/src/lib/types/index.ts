import { ContentType, ContentStatus } from "@nlc-ai/types";

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  coachID: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    contentPieces: number;
  };
}

export interface CreateCategory {
  name: string;
  description?: string;
}

export interface UpdateCategory {
  name?: string;
  description?: string;
}

export interface CategoryQueryOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Content Piece Types
export interface ContentPiece {
  id: string;
  title: string;
  categoryID: string;
  coachID: string;
  contentType: ContentType;
  platform?: string;
  platformID?: string;
  url?: string;
  description?: string;
  tags?: string[];
  thumbnailUrl?: string;
  durationSeconds?: number;
  views?: number;
  likes?: number;
  comments?: number;
  engagementRate?: number;
  status: ContentStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
  };
}

export interface CreateContentPiece {
  title: string;
  categoryID: string;
  contentType: ContentType;
  platform?: string;
  platformID?: string;
  url?: string;
  description?: string;
  tags?: string[];
  thumbnailUrl?: string;
  durationSeconds?: number;
  status?: ContentStatus;
  publishedAt?: string;
}

export interface UpdateContentPiece {
  title?: string;
  categoryID?: string;
  contentType?: ContentType;
  description?: string;
  tags?: string[];
  thumbnailUrl?: string;
  status?: ContentStatus;
  publishedAt?: string;
}

export interface ContentPieceQueryOptions {
  categoryID?: string;
  contentType?: ContentType;
  platform?: string;
  status?: ContentStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  publishedAfter?: string;
  publishedBefore?: string;
}

// Analytics Types
export interface ContentAnalytics {
  overview: {
    totalContent: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    averageViews: number;
  };
  byCategory: Array<{
    categoryID: string;
    categoryName: string;
    count: number;
    totalViews: number;
  }>;
  byType: Array<{
    contentType: ContentType;
    count: number;
    totalViews: number;
  }>;
  topPerforming: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    engagementRate?: number;
    category: { name: string };
  }>;
}

export interface ContentAnalyticsQuery {
  period?: 'week' | 'month' | 'quarter' | 'year';
  categoryID?: string;
  contentType?: ContentType;
}
