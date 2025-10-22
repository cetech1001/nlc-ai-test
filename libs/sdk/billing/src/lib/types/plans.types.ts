import {Transaction} from "./transactions.types";
import {Subscription} from "./subscriptions.types";
import {PaymentLink} from "./payments.types";

export interface AiAgent {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface PlanAiAgent {
  id: string;
  planID: string;
  agentID: string;
  isActive: boolean;
  aiAgent: AiAgent;
}

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
  planAiAgents?: PlanAiAgent[];
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
  aiAgents: AiAgent[];
  isCurrentPlan: boolean;
  colorClass: string;
  colorValue: string;
  isDeleted: boolean;
}

export interface CreatePlanRequest {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description?: string;
  color?: string;
  maxClients?: number;
  maxAiAgents?: number;
  features?: string[];
  isActive?: boolean;
  accessibleAiAgents?: string[];
}

export type UpdatePlanRequest = Partial<CreatePlanRequest>

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
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  maxClients: string;
  maxAiAgents: string;
  features: string[];
  color: string;
  isActive: boolean;
  accessibleAiAgents: string[];
}

export interface PlanFormErrors {
  name?: string;
  monthlyPrice?: string;
  annualPrice?: string;
  maxClients?: string;
  maxAiAgents?: string;
  features?: string;
  color?: string;
  accessibleAiAgents?: string;
  general?: string;
}
