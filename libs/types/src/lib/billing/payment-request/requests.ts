import {UserType} from "../../users";

export type PaymentRequestType = 'plan_payment' | 'course_payment' | 'community_payment' | 'custom_payment';
export type PaymentRequestStatus = 'pending' | 'paid' | 'expired' | 'canceled';

export interface CreatePaymentRequestRequest {
  createdByID: string;
  createdByType: UserType;
  payerID: string;
  payerType: UserType;

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
  paidAt?: Date;
  paidAmount?: number;
  status?: PaymentRequestStatus;
  metadata?: Record<string, any>;
}

export enum PaymentRequestFiltersStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface PaymentRequestFilters {
  payerID?: string;
  payerType?: UserType;
  createdByID?: string;
  createdByType?: UserType;
  type?: PaymentRequestType;
  status?: PaymentRequestFiltersStatus;
  expiringBefore?: Date;
}
