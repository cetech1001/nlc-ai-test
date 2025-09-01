import {Coach} from "@nlc-ai/sdk-users";
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
  coachID?: string;
  clientID?: string;
  planID: string;
  amount: number;
  currency?: string;
  description?: string;
  paymentMethodID?: string;
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
  coachID?: string;
  clientID?: string;
  planID: string;
  amount: number;
  paymentMethodID: string;
  description?: string;
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

export interface PaymentLinkStatus {
  status: string;
  paymentsCount: number;
  totalAmount: number;
}

export interface PaymentRequest {
  id: string;
  coachID?: string;
  clientID?: string;
  planName: string;
  amount: number;
  currency: string;
  description?: string | null;
  paymentLinkUrl: string;
  isActive: boolean;
  paymentsReceived: number;
  totalAmountReceived: number;
  expiresAt?: Date | null;
  createdAt: Date;
  status: 'pending' | 'paid' | 'expired';
}

export interface PaymentRequestStats {
  total: number;
  pending: number;
  paid: number;
  expired: number;
  totalAmountPaid: number;
}
