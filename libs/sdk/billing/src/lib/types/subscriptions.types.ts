import {Coach, Client, UserType} from "@nlc-ai/sdk-users";
import {Plan} from "./plans.types";
import {Transaction} from "./transactions.types";
import {Invoice} from "./invoices.types";

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  UNPAID = 'unpaid'
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual'
}

export interface CreateSubscriptionRequest {
  subscriberID: string;
  subscriberType: UserType;

  planID?: string;
  communityID?: string;
  courseID?: string;

  billingCycle: BillingCycle;
  amount: number;
  currency?: string;

  trialDays?: number;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}

export interface Subscription {
  id: string;
  subscriberID: string;
  subscriberType: string; // 'coach' | 'client'
  planID?: string;
  communityID?: string;
  courseID?: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate?: Date;
  canceledAt?: Date | null;
  cancelReason?: string | null;
  trialStart?: Date | null;
  trialEnd?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations - these will be populated based on subscriberType
  coach?: Coach;
  client?: Client;
  plan?: Plan;
  community?: any;
  course?: any;
  transactions?: Transaction[];
  invoices?: Invoice[];
}
