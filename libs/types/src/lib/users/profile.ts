import {UserType} from "./enums";

export interface UserProfile {
  id: string;
  type: UserType;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  businessName?: string | null;
  websiteUrl?: string | null;
  phone?: string | null;
  location?: string | null;
  timezone?: string | null;
  isActive: boolean | null;
  isVerified?: boolean | null;
  createdAt: Date;
  lastLoginAt?: Date | null;

  subscriptionStatus?: string | null;
  subscriptionPlan?: string | null;

  source?: string | null;
  tags?: string[] | null;
  engagementScore?: number | null;
  totalInteractions?: number | null;
  lastInteractionAt?: Date | null;

  coaches?: Array<{
    coachID: string;
    coachName: string;
    businessName: string;
    isPrimary: string;
    status: string;
  }>;

  currentCoach?: {
    coachID: string;
    coachName: string;
    businessName: string;
  };
}

export interface UserStats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  communitiesJoined: number;
  joinedDate: Date;
}
