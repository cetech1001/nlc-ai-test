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

  clientCoaches?: Array<{
    coachID: string;
    isPrimary: boolean;
    status: string;
    coach: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      businessName: string | null;
    },
    communities: Array<{
      id: string;
      slug: string;
      avatarUrl: string | null;
      name: string;
      coachID: string | null;
    }>;
  }>;
}

export interface UserStats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  communitiesJoined: number;
  joinedDate: Date;
}
