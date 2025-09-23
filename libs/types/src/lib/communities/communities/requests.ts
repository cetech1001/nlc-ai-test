import {
  CommunityType,
  CommunityVisibility,
  MemberRole,
  MemberStatus,
  CommunityPricingType
} from './enums';
import { UserType } from '../../users';
import { CommunitySettings } from "./responses";

export interface CommunityPricing {
  type: CommunityPricingType;
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
  settings?: CommunitySettings;
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

export interface CommunityMemberFilters {
  role?: MemberRole;
  status?: MemberStatus;
  userType?: UserType;
  search?: string;
  joinedDateStart?: string;
  joinedDateEnd?: string;
  lastActiveDateStart?: string;
  lastActiveDateEnd?: string;
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
