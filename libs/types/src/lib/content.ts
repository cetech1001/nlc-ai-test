import {Coach} from "./coach";

export interface ContentPiece {
  id: string;
  coachID: string;
  title: string;
  contentType: string;
  platform?: string | null;
  platformID?: string | null;
  url?: string | null;
  description?: string | null;
  tags: string[];
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  views?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  engagementRate?: number | null;
  aiAnalyzed?: boolean | null;
  performancePrediction?: number | null;
  topicCategories: string[];
  suggestedImprovements?: any | null;
  status?: string | null;
  publishedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  coach?: Coach;
}

export interface ContentSuggestion {
  id: string;
  coachID: string;
  title: string;
  contentType: string;
  platform?: string | null;
  description?: string | null;
  reasoning?: string | null;
  promptUsed?: string | null;
  confidenceScore?: number | null;
  trendData?: any | null;
  status?: string | null;
  feedback?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  coach?: Coach;
}

export interface ContentCategory {
  id: string;
  name: string;
  description: string;
  videosCount: number;
  lastUpdated: string;
  totalViews: number;
  avgEngagement: number;
  coachID?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface VideoContent {
  id: string;
  categoryID: string;
  coachID: string;
  title?: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  fileSize: number; // in bytes
  mimeType: string;
  views: number;
  likes: number;
  shares: number;
  engagement: number;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentStats {
  totalCategories: number;
  totalVideos: number;
  totalViews: number;
  avgEngagement: number;
  totalStorage: number; // in bytes
}

export interface CreateCategoryData {
  name: string;
  description: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

export interface UploadVideoData {
  categoryID: string;
  title?: string;
  description?: string;
  file: File;
}

export interface ContentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryID?: string;
  sortBy?: 'createdAt' | 'views' | 'engagement' | 'title';
  sortOrder?: 'asc' | 'desc';
}
