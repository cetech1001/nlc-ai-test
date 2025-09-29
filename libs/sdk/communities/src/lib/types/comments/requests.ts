export interface CreateCommentRequest {
  content: string;
  mediaUrls?: string[];
  postID?: string;
  parentCommentID?: string;
}

export interface UpdateCommentRequest {
  content?: string;
  mediaUrls?: string[];
}

export interface CommentFilters {
  postID?: string;
  parentCommentID?: string | null;
  search?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
