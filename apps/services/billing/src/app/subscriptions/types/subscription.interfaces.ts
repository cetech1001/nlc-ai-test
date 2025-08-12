import { SubscriptionStatus, BillingCycle } from '@prisma/client';

export interface CreateSubscriptionRequest {
  coachID: string;
  planID: string;
  billingCycle: BillingCycle;
  trialDays?: number;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}

export interface UpdateSubscriptionRequest {
  planID?: string;
  billingCycle?: BillingCycle;
  status?: SubscriptionStatus;
  cancelReason?: string;
  nextBillingDate?: Date;
}

export interface SubscriptionFilters {
  coachID?: string;
  planID?: string;
  status?: SubscriptionStatus;
  billingCycle?: BillingCycle;
  expiringBefore?: Date;
  createdAfter?: Date;
}

export interface SubscriptionWithDetails {
  id: string;
  coachID: string;
  planID: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  cancelReason?: string;
  trialStart?: Date;
  trialEnd?: Date;
  nextBillingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  coach: {
    firstName: string;
    lastName: string;
    email: string;
  };
  plan: {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
  };
}
