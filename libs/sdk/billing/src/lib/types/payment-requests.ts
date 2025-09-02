import {Transaction} from "./transactions.types";
import {Plan} from "./plans.types";

export enum PaymentRequestStatus {
  PENDING = 'pending',
  PAID = 'paid',
  EXPIRED = 'expired',
  CANCELED = 'canceled'
}

export enum PaymentRequestType {
  PLAN_PAYMENT = 'plan_payment',
  COURSE_PAYMENT = 'course_payment',
  COMMUNITY_PAYMENT = 'community_payment',
  CUSTOM_PAYMENT = 'custom_payment'
}

export interface PaymentRequest {
  id: string;
  createdByID: string;
  createdByType: string;
  payerID: string;
  payerType: string;
  type: PaymentRequestType;
  planID?: string;
  courseID?: string;
  communityID?: string;
  amount: number;
  currency: string;
  description?: string;
  notes?: string;
  stripePaymentLinkID?: string;
  paymentLinkUrl?: string;
  status: PaymentRequestStatus;
  paidAt?: Date;
  paidAmount?: number;
  expiresAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  plan?: Plan;
  course?: any;
  community?: any;
  transactions?: Transaction[];
}

export interface CreatePaymentRequestData {
  createdByID: string;
  createdByType: string;
  payerID: string;
  payerType: string;
  type: 'plan_payment' | 'course_payment' | 'community_payment' | 'custom_payment';
  planID?: string;
  courseID?: string;
  communityID?: string;
  amount: number;
  currency: string;
  description?: string;
  notes?: string;
  expiresAt?: Date;
}
