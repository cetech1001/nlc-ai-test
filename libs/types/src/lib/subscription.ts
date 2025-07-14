import {Coach} from "./coach";
import {Plan} from "./plan";
import {Transaction} from "./transaction";
import {Invoice} from "./invoice";

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

export interface Subscription {
  id: string;
  coachID: string;
  planID: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date | null;
  cancelReason?: string | null;
  trialStart?: Date | null;
  trialEnd?: Date | null;
  nextBillingDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  coach?: Coach;
  plan?: Plan;
  transactions?: Transaction[];
  invoices?: Invoice[];
}
