import {PostType, ReactionType} from "./enums";
import {CommunityType, MemberRole} from "../community";
import {UserType} from "@nlc-ai/sdk-users";

export interface Post {
  id: string;
  communityID: string;
  communityMemberID: string;
  type: PostType;
  content: string;
  mediaUrls: string[];
  linkUrl?: string;
  linkPreview?: Record<string, any>;
  pollOptions?: string[];
  eventData?: Record<string, any>;
  isPinned: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
  reactions?: PostReaction[];
}

export interface PostResponse extends Post{
  community?: {
    name: string;
    type: CommunityType;
  };
  communityMember?: {
    id: string;
    userName: string;
    userAvatarUrl?: string;
    role: MemberRole;
  };
  userReaction?: ReactionType;
  comments?: PostCommentResponse[];
  _count?: {
    reactions: number;
    comments: number;
  };
}

export interface PostComment {
  id: string;
  postID: string;
  communityMemberID: string;
  content: string;
  mediaUrls: string[];
  parentCommentID?: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  replies?: PostCommentResponse[];
  reactions?: PostReaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostCommentResponse extends PostComment{
  communityMember?: {
    id: string;
    userName: string;
    userAvatarUrl?: string;
    role: MemberRole;
  };
  userReaction?: ReactionType;
  _count?: {
    replies: number;
    reactions: number;
  };
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
