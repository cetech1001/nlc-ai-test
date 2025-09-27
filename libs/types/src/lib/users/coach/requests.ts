import {CoachStatus} from "./responses";

export interface CreateCoach {
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  websiteUrl?: string;
  timezone?: string;
}

export interface UpdateCoach {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  websiteUrl?: string;
  timezone?: string;
}

export interface CoachQueryParams {
  page?: number;
  limit?: number;
  status?: CoachStatus;
  search?: string;
  subscriptionPlan?: string;
  dateJoinedStart?: string;
  dateJoinedEnd?: string;
  lastActiveStart?: string;
  lastActiveEnd?: string;
  isVerified?: boolean;
  includeInactive?: boolean;
  includeDeleted?: boolean;
}
