import {AiInteraction, CoachAiAgent} from "./agent";
import {Client} from "./client";
import {ContentPiece, ContentSuggestion} from "./content";
import {Course} from "./course";
import {DailyKPI} from "./kpi";
import {EmailAccount, EmailTemplate, EmailThread} from "./email";
import {Integration} from "./integration";
import {Notification} from "./notification";
import {PaymentLink, PaymentMethod} from "./payment";
import {Transaction} from "./transaction";
import {Invoice} from "./invoice";
import {Subscription} from "./subscription";
import {Lead} from "./lead";
import {Plan} from "./plan";

export enum CoachStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  DELETED = 'deleted'
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
  subscriptionStatus?: string | null;
  subscriptionPlan?: string | null;
  subscriptionEndsAt?: Date | null;
  stripeCustomerID?: string | null;
  isActive?: boolean | null;
  isVerified?: boolean | null;
  isDeleted?: boolean | null;
  deletedAt?: Date | null;
  lastLoginAt?: Date | null;
  onboardingCompleted?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  aiInteractions?: AiInteraction[];
  clients?: Client[];
  coachAiAgents?: CoachAiAgent[];
  contentPieces?: ContentPiece[];
  contentSuggestions?: ContentSuggestion[];
  courses?: Course[];
  dailyKPIs?: DailyKPI[];
  emailAccounts?: EmailAccount[];
  emailTemplates?: EmailTemplate[];
  emailThreads?: EmailThread[];
  integrations?: Integration[];
  notifications?: Notification[];
  paymentMethods?: PaymentMethod[];
  transactions?: Transaction[];
  invoices?: Invoice[];
  subscriptions?: Subscription[];
  leads?: Lead[];
  paymentLinks?: PaymentLink[];
}

export type CreateCoach = Pick<Coach, 'email'
  | 'firstName'
  | 'lastName'
  | 'businessName'
  | 'phone'
  | 'avatarUrl'
  | 'bio'
  | 'websiteUrl'
  | 'timezone'>;
export type UpdateCoach = Partial<CreateCoach>;

export interface CoachWithStatus extends Coach {
  status: CoachStatus;
  currentPlan?: string;
  clientCount?: number;
  totalRevenue: number;
}

export interface CoachFilters {
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

export interface CoachQueryParams extends CoachFilters {
  page?: number;
  limit?: number;
}

export interface CoachWithSubscription extends Coach {
  subscriptions: (Subscription & {
    plan: Plan;
  })[];
}
