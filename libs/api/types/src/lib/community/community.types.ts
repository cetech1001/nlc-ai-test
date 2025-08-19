import { UserType } from '../auth';
import {
  CommunityType,
  CommunityVisibility,
  MemberRole,
  MemberStatus,
  MessageType,
  PostType,
  ReactionType
} from "./enums";

export interface Community {
  id: string;
  name: string;
  description?: string;
  type: CommunityType;
  visibility: CommunityVisibility;
  ownerID: string;
  ownerType: UserType;
  coachID?: string; // For coach-client communities
  courseID?: string; // For course communities
  avatarUrl?: string;
  bannerUrl?: string;
  settings: Record<string, any>;
  memberCount: number;
  postCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityMember {
  id: string;
  communityID: string;
  userID: string;
  userType: UserType;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date;
  lastActiveAt?: Date;
  invitedBy?: string;
  customTitle?: string;
  permissions: string[];
}

export interface Post {
  id: string;
  communityID: string;
  authorID: string;
  authorType: UserType;
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
  reactions?: PostReaction[];
}

export interface PostComment {
  id: string;
  postID: string;
  authorID: string;
  authorType: UserType;
  content: string;
  mediaUrls: string[];
  parentCommentID?: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostReaction {
  id: string;
  postID: string;
  commentID?: string;
  userID: string;
  userType: UserType;
  type: ReactionType;
  createdAt: Date;
}

export interface DirectMessage {
  id: string;
  conversationID: string;
  senderID: string;
  senderType: UserType;
  type: MessageType;
  content: string;
  mediaUrls: string[];
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  replyToMessageID?: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participantIDs: string[];
  participantTypes: UserType[];
  lastMessageID?: string;
  lastMessageAt?: Date;
  unreadCount: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
  messages?: DirectMessage[];
}
