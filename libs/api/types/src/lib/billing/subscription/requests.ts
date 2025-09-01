import {BillingCycle, SubscriptionStatus} from "@prisma/client";
import {UserType} from "../../auth";

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

export interface UpdateSubscriptionRequest {
  planID?: string;
  communityID?: string;
  courseID?: string;

  billingCycle?: BillingCycle;
  amount?: number;
  status?: SubscriptionStatus;
  cancelReason?: string;
  nextBillingDate?: Date;
}

export interface SubscriptionFilters {
  subscriberID?: string;
  subscriberType?: UserType;

  planID?: string;
  communityID?: string;
  courseID?: string;

  status?: SubscriptionStatus;
  billingCycle?: BillingCycle;
  expiringBefore?: Date;
  createdAfter?: Date;
}
