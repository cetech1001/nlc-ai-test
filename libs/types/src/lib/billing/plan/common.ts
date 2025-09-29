import {Subscription} from "../../subscription";
import {Transaction} from "../../transaction";
import {PaymentLink} from "../../payment";

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  monthlyPrice: number;
  annualPrice: number;
  color?: string;
  maxClients?: number | null;
  maxAiAgents?: number | null;
  features?: any | null;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptions?: Subscription[];
  transactions?: Transaction[];
  paymentLinks?: PaymentLink[];
  _count?: {
    subscriptions: number;
    transactions: number;
  };
}

export interface PlanAnalytics {
  plan: Plan;
  analytics: {
    totalRevenue: number;
    activeSubscriptions: number;
    totalSubscriptions: number;
    conversionRate: number;
  };
}
