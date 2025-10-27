import {UserType, CommunityPricingType} from "@nlc-ai/types";
import {CommunityType, CommunityVisibility, MemberRole, MemberStatus} from "./enums";

export interface CommunityPricing {
  type: CommunityPricingType;
  amount?: number | null;
  currency?: string | null;
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
  slug: string;
  pricingType: CommunityPricingType;
  oneTimePrice?: number | null;
  monthlyPrice?: number | null;
  annualPrice?: number | null;
  currency?: string;
  isSystemCreated: boolean;
  isDeleted: boolean;
  settings: Record<string, any>;
  members?: CommunityMember[];
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
  lastActiveAt?: string;
  invitedBy?: string;
  customTitle?: string;
  permissions: string[];
  userName: string;
  userEmail: string;
  userAvatarUrl?: string;
}

export interface CommunityResponse extends Community {
  userMembership?: CommunityMember;
  members?: CommunityMember[];
  _count?: {
    members: number;
    posts: number;
  };
}

export interface ExtendedCommunityMember extends CommunityMember {
  _count: {
    posts: number;
    comments: number;
  };
  isOnline: boolean;
}

export interface CommunityStats {
  totalMembers: number;
  totalPosts: number;
  activeMembers: number;
  onlineMembers: number;
}

export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  owners: number;
  admins: number;
  moderators: number;
  regularMembers: number;
  suspendedMembers: number;
  pendingMembers: number;
}

export interface CommunityActivity {
  id: string;
  type: 'post_created' | 'member_joined' | 'comment_added' | 'reaction_added';
  userID: string;
  userName?: string;
  userAvatarUrl?: string;
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
