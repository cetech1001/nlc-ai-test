import {
  CommunityType,
  CommunityVisibility,
  MemberRole,
  PostType,
  ReactionType,
  MessageType,
  CommunityPricingTypes
} from './enums';
import { UserType } from '../auth';

export interface CommunityPricing {
  type: CommunityPricingTypes;
  amount?: number | null;
  currency?: string;
}

export interface CreateCommunityRequest {
  name: string;
  description?: string;
  slug: string;
  type: CommunityType;
  visibility?: CommunityVisibility;
  coachID?: string;
  courseID?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  pricing?: CommunityPricing;
  settings?: {
    allowMemberPosts?: boolean;
    requireApproval?: boolean;
    allowFileUploads?: boolean;
    maxPostLength?: number;
    allowPolls?: boolean;
    allowEvents?: boolean;
    moderationLevel?: string;
  };
  isSystemCreated?: boolean;
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  visibility?: CommunityVisibility;
  pricing?: CommunityPricing;
  avatarUrl?: string;
  bannerUrl?: string;
  settings?: Record<string, any>;
  isActive?: boolean;
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

export interface AddMemberRequest {
  userID: string;
  userType: UserType;
  role?: MemberRole;
  customTitle?: string;
}

export interface InviteMemberRequest {
  userID: string;
  userType: UserType;
  role?: MemberRole;
  message?: string;
}

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

// Message Requests
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

export interface EditMessageRequest {
  content: string;
}
