import { TransactionStatus, PaymentMethodType } from '@prisma/client';

export interface CreateTransactionRequest {
  coachID: string;
  planID: string;
  subscriptionID?: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethodType;
  stripePaymentID?: string;
  paypalOrderID?: string;
  description?: string;
  metadata?: Record<string, any>;
  invoiceDate?: Date;
  dueDate?: Date;
}

export interface UpdateTransactionRequest {
  status?: TransactionStatus;
  paidAt?: Date;
  failureReason?: string;
  refundReason?: string;
  refundedAmount?: number;
  metadata?: Record<string, any>;
}

export interface TransactionFilters {
  coachID?: string;
  planID?: string;
  subscriptionID?: string;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethodType;
  amountRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  currency?: string;
}

export interface TransactionWithDetails {
  id: string;
  coachID: string;
  subscriptionID?: string;
  planID: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethodType;
  stripePaymentID?: string;
  paypalOrderID?: string;
  invoiceNumber?: string;
  invoiceDate: Date;
  dueDate?: Date;
  paidAt?: Date;
  description?: string;
  metadata?: any;
  failureReason?: string;
  refundReason?: string;
  refundedAmount?: number;
  createdAt: Date;
  updatedAt: Date;
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
  subscription?: {
    status: string;
    billingCycle: string;
  };
}

export interface RefundRequest {
  amount?: number; // Partial refund amount, if not provided, full refund
  reason: string;
  refundToOriginalPaymentMethod?: boolean;
}
