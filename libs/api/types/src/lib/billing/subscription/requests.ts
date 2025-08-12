import {BillingCycle, SubscriptionStatus} from "@prisma/client";

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
