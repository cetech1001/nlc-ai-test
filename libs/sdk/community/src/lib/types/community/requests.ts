import {UserType} from "@nlc-ai/sdk-users";
import {CommunityType, CommunityVisibility, MemberRole, MemberStatus} from "./enums";
import {CommunityPricing} from "./responses";

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
  isSystemCreated: boolean;
  pricing: CommunityPricing;
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
  search?: string;
  page?: number;
  limit?: number;
}

