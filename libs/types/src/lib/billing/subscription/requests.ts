import {UserType} from "../../users";

export interface CreateSubscriptionRequest {
  subscriberID: string;
  subscriberType: UserType;

  planID?: string;
  communityID?: string;
  courseID?: string;

  billingCycle: string;
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

  billingCycle?: string;
  amount?: number;
  status?: string;
  cancelReason?: string;
  nextBillingDate?: Date;
}

export interface SubscriptionFilters {
  subscriberID?: string;
  subscriberType?: UserType;

  planID?: string;
  communityID?: string;
  courseID?: string;

  status?: string;
  billingCycle?: string;
  expiringBefore?: Date;
  createdAfter?: Date;
}
