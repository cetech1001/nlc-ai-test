import {Coach} from "./coach";
import {Plan} from "./plan";
import {Invoice} from "./invoice";
import {PaymentMethodType} from "./payment";
import {Subscription} from "./subscription";
import {QueryParams} from "./query-params";

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

export interface TransactionsQueryParams extends QueryParams{
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  planNames?: string;
}
