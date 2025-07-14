import {AiInteraction, CoachAiAgent} from "./agent";
import {Client} from "./client";
import {ContentPiece, ContentSuggestion} from "./content";
import {Course, CourseEnrollment} from "./course";
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
  dailyKpis?: DailyKPI[];
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

export type CreateCoach = Omit<Coach, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCoach = Partial<Omit<Coach, 'id' | 'createdAt' | 'updatedAt'>>;
export type CreateClient = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateClient = Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>;

// Database response types with relations
export interface CoachWithClients extends Coach {
  clients: Client[];
}

export interface ClientWithCourses extends Client {
  courseEnrollments: (CourseEnrollment & {
    course: Course;
  })[];
}

export interface CoachWithSubscription extends Coach {
  subscriptions: (Subscription & {
    plan: Plan;
  })[];
}
