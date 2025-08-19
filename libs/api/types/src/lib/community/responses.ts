import { CommunityType, CommunityVisibility, MemberRole, MemberStatus, PostType, MessageType, ReactionType } from './enums';
import { UserType } from '../auth';

// Community Responses
export interface CommunityResponse {
  id: string;
  name: string;
  description?: string;
  type: CommunityType;
  visibility: CommunityVisibility;
  ownerID: string;
  ownerType: UserType;
  coachID?: string;
  courseID?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  settings: Record<string, any>;
  memberCount: number;
  postCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userMembership?: CommunityMemberResponse;
  members?: CommunityMemberResponse[];
  _count?: {
    members: number;
    posts: number;
  };
}

export interface CommunityMemberResponse {
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

export interface CommunityListResponse {
  communities: CommunityResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CommunityInviteResponse {
  id: string;
  communityID: string;
  inviterID: string;
  inviterType: UserType;
  inviteeID: string;
  inviteeType: UserType;
  message?: string;
  token: string;
  status: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

// Post Responses
export interface PostResponse {
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
  community?: {
    name: string;
    type: CommunityType;
  };
  userReaction?: ReactionType;
  comments?: PostCommentResponse[];
  _count?: {
    reactions: number;
    comments: number;
  };
}

export interface PostCommentResponse {
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
  userReaction?: ReactionType;
  replies?: PostCommentResponse[];
  _count?: {
    replies: number;
    reactions: number;
  };
}

export interface PostReactionResponse {
  id: string;
  postID?: string;
  commentID?: string;
  userID: string;
  userType: UserType;
  type: ReactionType;
  createdAt: Date;
}

export interface PostListResponse {
  posts: PostResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CommentListResponse {
  comments: PostCommentResponse[];
  total: number;
  page: number;
  limit: number;
}

// Message Responses
export interface ConversationResponse {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participantIDs: string[];
  participantTypes: UserType[];
  lastMessageID?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: DirectMessageResponse;
}

export interface DirectMessageResponse {
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
  replyToMessage?: {
    id: string;
    content: string;
    senderID: string;
    senderType: UserType;
    createdAt: Date;
  };
}

export interface ConversationListResponse {
  conversations: ConversationResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface MessageListResponse {
  messages: DirectMessageResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

// Generic Success Responses
export interface CommunityActionResponse {
  message: string;
}

export interface PostActionResponse {
  message: string;
}

export interface MessageActionResponse {
  message: string;
}
