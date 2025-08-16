export enum CoachStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

export interface CoachWithStatus {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  websiteUrl?: string;
  customDomain?: string;
  timezone?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  subscriptionEndsAt?: Date;
  stripeCustomerID?: string;
  isActive?: boolean;
  isVerified?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
  lastLoginAt?: Date;
  onboardingCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  status: CoachStatus;
  currentPlan: string;
  clientCount: number;
  totalRevenue: number;
  subscriptions?: any[];
  clientCoaches?: any[];
  transactions?: any[];
}
