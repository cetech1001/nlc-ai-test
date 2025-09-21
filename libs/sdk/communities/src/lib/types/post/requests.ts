import {PostType, ReactionType} from "./enums";

export interface CreatePostRequest {
  communityID: string;
  type?: PostType;
  content: string;
  mediaUrls?: string[];
  linkUrl?: string;
  linkPreview?: Record<string, any>;
  pollOptions?: string[];
  eventData?: Record<string, any>;
}

export interface UpdatePostRequest {
  content?: string;
  mediaUrls?: string[];
  linkUrl?: string;
  linkPreview?: Record<string, any>;
  pollOptions?: string[];
  eventData?: Record<string, any>;
  isPinned?: boolean;
}

export interface PostFilters {
  communityID?: string;
  authorID?: string;
  type?: PostType;
  search?: string;
  isPinned?: boolean;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CommentFilters {
  parentCommentID?: string;
  search?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateCommentRequest {
  content: string;
  mediaUrls?: string[];
  parentCommentID?: string;
}

export interface ReactToPostRequest {
  type: ReactionType;
}
