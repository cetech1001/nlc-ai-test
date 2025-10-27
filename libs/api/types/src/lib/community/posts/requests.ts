import {
  PostType,
  ReactionType,
} from './enums';

export interface CreatePostRequest {
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
  communityMemberID?: string;
  type?: PostType;
  search?: string;
  isPinned?: boolean;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CommentFilters {
  parentCommentID?: string | null;
  postID?: string;
  search?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateCommentRequest {
  content: string;
  postID?: string;
  mediaUrls?: string[];
  parentCommentID?: string;
}

export interface UpdateCommentRequest {
  content?: string;
  mediaUrls?: string[];
  parentCommentID?: string;
}

export interface ReactToPostRequest {
  type: ReactionType;
}
