import {PostType, ReactionType} from "./enums";
import {UserType} from "@nlc-ai/sdk-users";
import {CommunityType} from "../community";

export interface Post {
  id: string;
  communityID: string;
  authorID: string;
  authorType: UserType;
  authorName: string;
  authorAvatarUrl: string;
  type: PostType;
  content: string;
  mediaUrls: string[];
  linkUrl?: string;
  linkPreview?: Record<string, any>;
  pollOptions?: string[];
  eventData?: Record<string, any>;
  isPinned: boolean;
  isEdited: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
  userReaction?: ReactionType;
  community?: {
    name: string;
    type: CommunityType;
  };
}

export interface PostComment {
  id: string;
  postID: string;
  authorID: string;
  authorType: UserType;
  authorName?: string;
  authorAvatarUrl?: string;
  content: string;
  mediaUrls: string[];
  parentCommentID?: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  userReaction?: ReactionType;
  replies?: PostComment[];
}

export interface PostReaction {
  id: string;
  postID?: string;
  commentID?: string;
  userID: string;
  userType: UserType;
  type: ReactionType;
  createdAt: Date;
}

export interface PostResponse extends Post {
  comments?: PostComment[];
  _count?: {
    reactions: number;
    comments: number;
  };
}
