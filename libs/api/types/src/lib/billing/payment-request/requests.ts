export type PaymentRequestType = 'plan_payment' | 'course_payment' | 'community_payment' | 'custom_payment';
export type PaymentRequestStatus = 'pending' | 'paid' | 'expired' | 'canceled';

export interface CreatePaymentRequestRequest {
  createdByID: string;
  createdByType: 'coach' | 'admin';
  payerID: string;
  payerType: 'coach' | 'client';

  type: PaymentRequestType;
  planID?: string;
  courseID?: string;
  communityID?: string;

  amount: number;
  currency?: string;
  description?: string;
  notes?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentRequestRequest {
  description?: string;
  notes?: string;
  expiresAt?: Date;
  status?: PaymentRequestStatus;
  metadata?: Record<string, any>;
}

export interface PaymentRequestFilters {
  payerID?: string;
  payerType?: 'coach' | 'client';
  createdByID?: string;
  createdByType?: 'coach' | 'admin';
  type?: PaymentRequestType;
  status?: PaymentRequestStatus;
  expiringBefore?: Date;
}
