import {Transaction} from "./transaction";
import {Subscription} from "./subscription";
import {PaymentLink} from "./payment";

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

export interface TransformedPlan {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  monthlyPrice: number;
  billingCycle: string;
  monthlyBilling: string;
  features: string[];
  isCurrentPlan: boolean;
  colorClass: string;
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  color?: string;
  maxClients?: number;
  maxAiAgents?: number;
  features?: string[];
  isActive?: boolean;
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}

export interface PlanAnalytics {
  plan: Plan;
  analytics: {
    totalRevenue: number;
    activeSubscriptions: number;
    totalSubscriptions: number;
    conversionRate: number;
  };
}

export interface PlanFormData {
  planTitle: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  maxClients: string;
  maxAiAgents: string;
  features: string[];
  color: string; // Add color field
  isActive: boolean;
}

export interface PlanFormErrors {
  planTitle?: string;
  monthlyPrice?: string;
  annualPrice?: string;
  maxClients?: string;
  maxAiAgents?: string;
  features?: string;
  color?: string;
  general?: string;
}
