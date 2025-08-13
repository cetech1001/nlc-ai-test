import {PaymentMethodType, TransactionStatus} from "@prisma/client";

export interface CreateTransactionRequest {
  coachID: string;
  planID: string;
  subscriptionID?: string;
  paymentMethodID?: string;
  amount: number;
  currency?: string;
  paymentMethodType: PaymentMethodType;
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
  paymentMethodID?: string;
  status?: TransactionStatus;
  paymentMethodType?: PaymentMethodType;
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

export interface RefundRequest {
  amount?: number;
  reason: string;
  refundToOriginalPaymentMethod?: boolean;
}
