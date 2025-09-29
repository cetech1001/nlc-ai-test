import {PaymentContext} from "../common";
import {UserType} from "../../users";

export interface CreatePaymentIntentRequest {
  payerID: string;
  payerType: UserType;

  planID?: string;
  courseID?: string;
  communityID?: string;

  amount: number;
  currency?: string;
  description?: string;
  paymentMethodID?: string;
}

export interface SendPaymentRequest extends CreatePaymentIntentRequest {
  paymentLink?: string;
  linkID?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentID: string;
  amount: number;
  currency: string;
  status: string;
}

export interface ProcessPaymentRequest {
  payerID: string;
  payerType: UserType;

  planID?: string;
  courseID?: string;
  communityID?: string;

  amount: number;
  paymentMethodID: string;
  description?: string;

  returnUrl: string;
}

export interface CreateSetupIntentRequest {
  customerID: string;
}

export interface PaymentLinkResponse {
  paymentLink: string;
  linkID: string;
}

export interface PaymentResult {
  transaction: any;
  paymentIntent: any;
  success: boolean;
}

export interface SendPaymentRequestResponse {
  paymentLink: string;
  linkID: string;
  emailSent: boolean;
}

export interface PaymentRequestData {
  payerID: string;
  payerType: UserType;
  payeeID?: string;
  payeeType?: 'coach' | 'platform';

  context: PaymentContext;
  amount: number;
  currency: string;
  description?: string;

  paymentMethodID?: string;
  stripePaymentID?: string;

  platformFeeAmount?: number;
  platformFeeRate?: number;
}

export interface PaymentRequestEmailData {
  to: string;
  payerName: string;
  itemName: string;
  itemDescription?: string;
  amount: number;
  paymentLink: string;
  description?: string;
}

export interface StripeWebhookData {
  signature: string;
  payload: Buffer | string;
}

export interface PaymentWebhookMetadata {
  payerID: string;
  payerType: UserType;
  planID?: string;
  courseID?: string;
  communityID?: string;
  contextType: 'plan' | 'course' | 'community';
}

export interface PaymentLinkData {
  id: string;
  payerID: string;
  payerType: UserType;
  context: PaymentContext;
  amount: number;
  currency: string;
  description?: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostPaymentSubscriptionData {
  subscriberID: string;
  subscriberType: UserType;
  resourceID: string;
  resourceType: 'plan' | 'course' | 'community';
  amount: number;
  billingCycle: 'monthly' | 'annual';
}

export interface PostPaymentEnrollmentData {
  clientID: string;
  courseID: string;
  paymentType: 'one_time' | 'installment' | 'subscription';
  totalPaid: number;
  remainingBalance?: number;
}

export interface PostPaymentCommunityAccessData {
  clientID: string;
  communityID: string;
  accessType: 'one_time' | 'subscription';
  paidAmount: number;
}
