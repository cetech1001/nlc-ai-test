import {Subscription, Transaction} from "@prisma/client";

export interface TransactionWithDetails extends Transaction {
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
  subscription?: Pick<Subscription, 'status' | 'billingCycle'> | null;
}
