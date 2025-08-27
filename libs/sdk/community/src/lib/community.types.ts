import {
  CommunityType,
  CommunityVisibility,
  MemberRole,
  MemberStatus,
  MessageType,
  PostType,
  ReactionType,
  UserType
} from "./enums";

export interface Community {
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

export interface DirectMessage {
  id: string;
  conversationID: string;
  senderID: string;
  senderType: UserType;
  senderName?: string;
  senderAvatar?: string;
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
  participantNames?: string[];
  participantAvatars?: string[];
  lastMessageID?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: DirectMessage;
}

// Request Types
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

export interface CreateCommentRequest {
  content: string;
  mediaUrls?: string[];
  parentCommentID?: string;
}

export interface ReactToPostRequest {
  type: ReactionType;
}

export interface CreateConversationRequest {
  type: 'direct' | 'group';
  name?: string;
  participantIDs: string[];
  participantTypes: UserType[];
}

export interface CreateMessageRequest {
  type?: MessageType;
  content: string;
  mediaUrls?: string[];
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToMessageID?: string;
}

export interface MessageFilters {
  type?: MessageType;
  search?: string;
  before?: string;
  after?: string;
  page?: number;
  limit?: number;
}

export interface CommunityFilters {
  type?: CommunityType;
  visibility?: CommunityVisibility;
  coachID?: string;
  search?: string;
  memberOf?: boolean;
  page?: number;
  limit?: number;
}

// Response Types
export interface CommunityResponse extends Community {
  userMembership?: CommunityMember;
  members?: CommunityMember[];
  _count?: {
    members: number;
    posts: number;
  };
}

export interface PostResponse extends Post {
  comments?: PostComment[];
  _count?: {
    reactions: number;
    comments: number;
  };
}

export interface ConversationResponse extends Conversation {}

export interface MessageResponse extends DirectMessage {
  replyToMessage?: {
    id: string;
    content: string;
    senderID: string;
    senderType: UserType;
    createdAt: Date;
  };
}

export interface PostListResponse {
  posts: PostResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ConversationListResponse {
  conversations: ConversationResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface MessageListResponse {
  messages: MessageResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CommentListResponse {
  comments: PostComment[];
  total: number;
  page: number;
  limit: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

// Action Response Types
export interface ActionResponse {
  message: string;
}

// Request Types
export interface CreateCommunityRequest {
  name: string;
  description?: string;
  type: CommunityType;
  visibility?: CommunityVisibility;
  coachID?: string;
  courseID?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  settings?: Record<string, any>;
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  visibility?: CommunityVisibility;
  avatarUrl?: string;
  bannerUrl?: string;
  settings?: Record<string, any>;
  isActive?: boolean;
}

export interface AddMemberRequest {
  userID: string;
  userType: UserType;
  role?: MemberRole;
  customTitle?: string;
}

