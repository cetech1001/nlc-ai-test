/*import {
  ContentPieces,
  ContentSuggestions,
  Courses,
  DailyKpis,
  EmailAccounts,
  EmailTemplates,
  EmailThreads,
  Integrations,
  Invoices,
  Leads,
  Notifications,
  PaymentLinks,
  PaymentMethods,
  Subscriptions,
  SubscriptionStatus,
  Transactions
} from "./index";*/

export enum CoachStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  DELETED = 'deleted'
}

/*export interface CoachWithStatus extends Coach{
  status: CoachStatus;
  currentPlan?: string;
  subscriptionStatus?: string;
  clientCount?: number;
  totalRevenue?: number;
}

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
}*/

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

export interface CoachStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
}

export interface CoachKPIs {
  totalClients: number;
  activeClients: number;
  recentInteractions: number;
  tokensUsed: number;
  recentRevenue: number;
}

export interface CoachDetail extends Coach {
  subscriptions?: any[];
  clients?: any[];
  transactions?: any[];
}

export interface Coach {
  id: string;
  email: string;
  passwordHash?: string | null;
  firstName: string;
  lastName: string;
  businessName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  websiteUrl?: string | null;
  timezone?: string | null;
  subscriptionStatus?: SubscriptionStatus | null;
  subscriptionPlan?: string | null;
  subscriptionEndsAt?: Date | null;
  stripeCustomerId?: string | null;
  isActive?: boolean | null;
  isVerified?: boolean | null;
  isDeleted?: boolean | null;
  deletedAt?: Date | null;
  lastLoginAt?: Date | null;
  onboardingCompleted?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  aiInteractions: AiInteractions[];
  clients: Clients[];
  coachAiAgents: CoachAiAgents[];
  contentPieces: ContentPieces[];
  contentSuggestions: ContentSuggestions[];
  courses: Courses[];
  dailyKpis: DailyKpis[];
  emailAccounts: EmailAccounts[];
  emailTemplates: EmailTemplates[];
  emailThreads: EmailThreads[];
  integrations: Integrations[];
  notifications: Notifications[];
  paymentMethods: PaymentMethods[];
  transactions: Transactions[];
  invoices: Invoices[];
  subscriptions: Subscriptions[];
  leads: Leads[];
  PaymentLinks: PaymentLinks[];
}
