export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  businessName?: string;
  websiteUrl?: string;
  phone?: string;
  timezone?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  // Coach specific
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  // Client specific
  source?: string;
  tags?: string[];
  engagementScore?: number;
  totalInteractions?: number;
  lastInteractionAt?: Date;
}

export interface UserStats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  communitiesJoined: number;
  joinedDate: Date;
}
