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
