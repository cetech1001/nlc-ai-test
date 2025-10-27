import {
  CommunityType,
  CommunityVisibility,
  MemberRole,
  MemberStatus,
  CommunityPricingType
} from './enums';
import { UserType } from '../../users';

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
  slug: string;
  pricingType: CommunityPricingType;
  oneTimePrice?: number | null;
  monthlyPrice?: number | null;
  annualPrice?: number | null;
  currency?: string;
  isSystemCreated: boolean;
  isDeleted: boolean;
  settings: Record<string, any>;
  memberCount: number;
  postCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userMembership?: CommunityMember;
  members?: CommunityMember[];
  _count?: {
    members: number;
    posts: number;
  };
}

export interface CommunityMember {
  id: string;
  communityID: string;
  userID: string;
  userType: UserType;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date;
  lastActiveAt?: string;
  invitedBy?: string;
  customTitle?: string;
  permissions: string[];
  userName: string;
  userEmail: string;
  userAvatarUrl?: string;
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

export interface CommunityActivity {
  id: string;
  type: 'post_created' | 'member_joined' | 'comment_added' | 'reaction_added';
  userID: string;
  userName?: string;
  userAvatarUrl?: string | null;
  description: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface CommunityDetailStats {
  memberGrowth: number;
  postGrowth: number;
  engagementRate: number;
  activeMembers: number;
  totalPosts: number;
  totalComments: number;
  averagePostsPerDay: number;
}

export interface CommunitySettings {
  allowMemberPosts?: boolean;
  requireApproval?: boolean;
  allowFileUploads?: boolean;
  maxPostLength?: number;
  allowPolls?: boolean;
  allowEvents?: boolean;
  moderationLevel?: 'strict' | 'moderate' | 'relaxed';
}
