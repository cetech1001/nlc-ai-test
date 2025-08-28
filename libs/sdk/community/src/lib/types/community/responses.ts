import {UserType} from "@nlc-ai/sdk-users";
import {CommunityType, CommunityVisibility, MemberRole, MemberStatus, CommunityPricingTypes} from "./enums";

export interface CommunityPricing {
  type: CommunityPricingTypes;
  amount?: number;
  currency?: string;
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
  pricingType: CommunityPricingTypes;
  pricingAmount?: number | null;
  pricingCurrency?: string;
  isSystemCreated: boolean;
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
