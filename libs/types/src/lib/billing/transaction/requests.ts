import {UserType} from "../../users";

export interface CreateTransactionRequest {
  payerID: string;
  payerType: UserType;
  payeeID?: string;
  payeeType?: UserType.COACH | 'platform';

  planID?: string;
  courseID?: string;
  communityID?: string;
  subscriptionID?: string;
  paymentRequestID?: string;
  paymentMethodID?: string;

  amount: number;
  currency?: string;
  paymentMethodType: string;

  stripePaymentID?: string;
  paypalOrderID?: string;
  description?: string;
  metadata?: Record<string, any>;

  invoiceDate?: Date;
  dueDate?: Date;

  platformFeeAmount?: number;
  platformFeeRate?: number;
}

export interface UpdateTransactionRequest {
  status?: string;
  paidAt?: Date;
  failureReason?: string;
  refundReason?: string;
  refundedAmount?: number;
  metadata?: Record<string, any>;
}

export interface TransactionFilters {
  payerID?: string;
  payerType?: UserType;
  payeeID?: string;
  payeeType?: UserType.COACH | 'platform';

  planID?: string;
  courseID?: string;
  communityID?: string;
  subscriptionID?: string;
  paymentMethodID?: string;

  status?: string;
  paymentMethodType?: string;

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
