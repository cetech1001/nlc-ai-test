import {Subscription} from "@prisma/client";

export interface SubscriptionWithDetails extends Subscription {
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
