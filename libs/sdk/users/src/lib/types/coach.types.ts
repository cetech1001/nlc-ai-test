export enum CoachStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

export interface Coach {
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
  subscriptions?: any[];
  clientCoaches?: any[];
  transactions?: any[];
}

export interface ExtendedCoach extends Coach{
  status: CoachStatus;
  currentPlan: string;
  clientCount: number;
  totalRevenue: number;
}

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

export interface CoachStats {
  totalCoaches: number;
  totalCoachesGrowth: number;
  inactiveCoaches: number;
  inactiveCoachesGrowth: number;
}

export interface DataTableCoach {
  id: string;
  name: string;
  email: string;
  dateJoined: string;
  plan: string;
  status: string;
  rawStatus: string;
  originalID: string;
}

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role?: string | null;
  isActive?: boolean | null;
  lastLoginAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
