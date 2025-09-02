import {Coach, UserType} from "@nlc-ai/sdk-users";
import {Plan} from "./plans.types";

export interface PaymentLink {
  id: string;
  coachID: string;
  planID: string;
  stripePaymentLinkID: string;
  paymentLinkUrl: string;
  amount: number;
  currency: string;
  description?: string | null;
  isActive: boolean;
  paymentsReceived: number;
  totalAmountReceived: number;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  coach?: Coach;
  plan?: Plan;
}

export interface CreatePaymentIntentRequest {
  payerID: string;
  payerType: UserType;
  planID?: string;
  amount: number;
  currency?: string;
  description?: string;
  paymentMethodID?: string;
}

export interface CreateSetupIntentRequest {
  payerID: string;
  payerType: UserType;
}

export interface SendPaymentRequest extends CreatePaymentIntentRequest{
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
  amount: number;
  paymentMethodID: string;
  description?: string;
  returnUrl: string;
}

export interface PaymentLinkResponse {
  paymentLink: string;
  linkID: string;
}

export interface PaymentResult {
  transaction: any;
  paymentIntent: any;
  paymentSuccessful: boolean;
}

export interface SendPaymentRequestResponse {
  paymentLink: string;
  linkID: string;
  emailSent: boolean;
}

export interface PaymentLinkStatus {
  status: string;
  paymentsCount: number;
  totalAmount: number;
}

export interface PaymentRequestStats {
  total: number;
  pending: number;
  paid: number;
  expired: number;
  totalAmountPaid: number;
}
