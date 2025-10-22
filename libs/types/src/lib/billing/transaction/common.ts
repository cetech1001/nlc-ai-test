import {PaymentMethodType} from "../../payment";
import {Coach} from "../../coach";
import {BillingCycle, Subscription, SubscriptionStatus} from "../../subscription";
import {Plan} from "../../plan";
import {Invoice, InvoiceStatus} from "../../invoice";
import {TransactionStatus} from "../../transaction";
import {CommunityPricingType} from "../../communities";

export interface Transaction {
  id: string;
  coachID: string;
  subscriptionID?: string | null;
  planID: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethodType;
  stripePaymentID?: string | null;
  paypalOrderID?: string | null;
  invoiceNumber?: string | null;
  invoiceDate: Date;
  dueDate?: Date | null;
  paidAt?: Date | null;
  description?: string | null;
  metadata?: any | null;
  failureReason?: string | null;
  refundReason?: string | null;
  refundedAmount?: number | null;
  createdAt: Date;
  updatedAt: Date;
  coach?: Coach;
  subscription?: Subscription | null;
  plan?: Plan;
  invoices?: Invoice[];
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

export interface TransactionWithDetails {
  id: string;
  coachID: string;
  coachName: string;
  coachEmail: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  invoiceNumber?: string;
  invoiceDate: Date;
  transactionDate: Date;
  paidAt?: Date;
  description?: string;
}

export interface ExtendedTransaction {
  id: string;

  // Payer information
  payerID: string;
  payerType: string;

  // Payee information
  payeeID: string | null;
  payeeType: string | null;

  // Related entities
  planID: string | null;
  courseID: string | null;
  communityID: string | null;
  subscriptionID: string | null;
  paymentRequestID: string | null;

  // Payment details
  paymentMethodID: string | null;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethodType: PaymentMethodType;

  // External payment IDs
  stripePaymentID: string | null;
  paypalOrderID: string | null;

  // Invoice details
  invoiceID: string | null;
  invoiceNumber: string | null;
  invoiceDate: Date;
  dueDate: Date | null;
  paidAt: Date | null;

  // Additional information
  description: string | null;
  metadata: Record<string, any> | null;
  failureReason: string | null;
  refundReason: string | null;
  refundedAmount: number | null;

  // Platform fees
  platformFeeAmount: number | null;
  platformFeeRate: number | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Populated participant information
  payer: {
    id: string;
    type: string;
    name: string;
    email: string;
  } | null;

  payee: {
    id: string;
    type: string;
    name: string;
    email: string;
  } | null;

  // Included relations
  plan?: {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
  } | null;

  course?: {
    title: string;
    price: number | null;
  } | null;

  community?: {
    name: string;
    pricingType: CommunityPricingType;
  } | null;

  subscription?: {
    status: SubscriptionStatus;
    billingCycle: BillingCycle;
  } | null;

  invoice?: {
    invoiceNumber: string;
    status: InvoiceStatus;
  } | null;
}
