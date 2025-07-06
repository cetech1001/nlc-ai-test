export enum CoachStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked'
}

export interface CoachWithStatus {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  isActive: boolean | null;
  isVerified: boolean | null;
  lastLoginAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  status: CoachStatus | null;
  currentPlan?: string | null;
  subscriptionStatus?: string | null;
  clientCount?: number | null;
  totalRevenue?: number | null;
}

// export type CoachStatus = 'active' | 'inactive' | 'blocked';

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessName?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  status: CoachStatus;
  currentPlan?: string;
  subscriptionStatus?: string;
  clientCount?: number;
  totalRevenue?: number;
}

export interface CoachFilters {
  status?: CoachStatus;
  search?: string;
  subscriptionPlan?: string; // Comma-separated plan names
  dateJoinedStart?: string; // YYYY-MM-DD
  dateJoinedEnd?: string;   // YYYY-MM-DD
  lastActiveStart?: string; // YYYY-MM-DD
  lastActiveEnd?: string;   // YYYY-MM-DD
  isVerified?: boolean;
  includeInactive?: boolean;
}

export interface CoachQueryParams extends CoachFilters {
  page?: number;
  limit?: number;
}

export interface PaginatedCoachesResponse {
  data: Coach[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CoachStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
}

export interface CoachKpis {
  totalClients: number;
  activeClients: number;
  recentInteractions: number;
  tokensUsed: number;
  recentRevenue: number;
}

export interface RecentCoach {
  id: string;
  name: string;
  email: string;
  dateJoined: string;
  plan: string;
  status: string;
}

export interface CoachDetail extends Coach {
  subscriptions?: any[];
  clients?: any[];
  transactions?: any[];
}

