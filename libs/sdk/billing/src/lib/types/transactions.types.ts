import {Coach, Client} from "@nlc-ai/sdk-users";
import {Plan} from "./plans.types";
import {Invoice} from "./invoices.types";
import {Subscription} from "./subscriptions.types";
import {PaymentMethodType} from "./payment-methods";

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export interface Transaction {
  id: string;
  payerID: string;
  payerType: string; // 'coach' | 'client'
  payeeID?: string;
  payeeType?: string;
  planID?: string;
  courseID?: string;
  communityID?: string;
  subscriptionID?: string;
  paymentRequestID?: string;
  paymentMethodID?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethodType: PaymentMethodType;
  stripePaymentID?: string | null;
  paypalOrderID?: string | null;
  invoiceID?: string;
  invoiceNumber?: string | null;
  invoiceDate: Date;
  dueDate?: Date | null;
  paidAt?: Date | null;
  description?: string | null;
  metadata?: any | null;
  failureReason?: string | null;
  refundReason?: string | null;
  refundedAmount?: number | null;
  platformFeeAmount?: number;
  platformFeeRate?: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  coach?: Coach;
  client?: Client;
  subscription?: Subscription | null;
  plan?: Plan;
  course?: any;
  community?: any;
  paymentMethod?: any;
  paymentRequest?: any;
  invoice?: Invoice;
}

export interface RevenueData {
  period: string;
  revenue: number;
  date?: string;
}

export interface RevenueGrowthData {
  data: RevenueData[];
  growthDescription: string;
  growthPercentage: number;
}

export interface TimePeriodRevenueData {
  weekly?: RevenueGrowthData;
  monthly?: RevenueGrowthData;
  yearly: RevenueGrowthData;
}

export interface RevenueStats {
  allTimeRevenue: number;
  allTimeRevenueGrowth: number;
  monthlyRevenue: number;
  monthlyRevenueGrowth: number;
}

export interface TransactionStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalRevenue: number;
}

export interface RevenueComparison {
  currentMonth: number;
  previousMonth: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TopCoach {
  coachID: string;
  coachName: string;
  coachEmail: string;
  totalAmount: number;
  transactionCount: number;
}

export interface DataTableTransaction {
  id: string;
  coachName?: string;
  coachEmail?: string;
  planName: string;
  amount: string;
  status: string;
  paymentMethod: string;
  transactionDate: string;
  invoiceNumber?: string;
}

export interface ExtendedTransaction {
  id: string;
  payerID: string;
  payerType: string;
  payeeID?: string;
  payeeType?: string;
  coachName?: string;
  coachEmail?: string;
  clientName?: string;
  clientEmail?: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  invoiceNumber?: string;
  invoiceDate: Date;
  transactionDate: Date;
  paidAt?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  payer?: {
    id: string;
    type: string;
    name: string;
    email: string;
  };
  payee?: {
    id: string;
    type: string;
    name: string;
    email: string;
  };
  plan?: {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
  };
  course?: {
    title: string;
    price: number;
  };
  community?: {
    name: string;
    pricingType: string;
  };
  subscription?: Pick<Subscription, 'status' | 'billingCycle'> | null;
  invoice?: {
    invoiceNumber: string;
    status: string;
  } | null;
}
