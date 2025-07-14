import {Coach} from "./coach";
import {Plan} from "./plan";

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  STRIPE = 'stripe',
  MANUAL = 'manual'
}

export interface PaymentMethod {
  id: string;
  coachID: string;
  type: PaymentMethodType;
  isDefault: boolean;
  isActive: boolean;
  cardLast4?: string | null;
  cardBrand?: string | null;
  cardExpMonth?: number | null;
  cardExpYear?: number | null;
  stripePaymentMethodID?: string | null;
  paypalEmail?: string | null;
  createdAt: Date;
  updatedAt: Date;
  coach?: Coach;
}

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
  coachId: string;
  planId: string;
  amount: number;
  currency?: string;
  description?: string;
  paymentMethodId?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface ProcessPaymentRequest {
  coachId: string;
  planId: string;
  amount: number;
  paymentMethodId: string;
  description?: string;
}

export interface PaymentResult {
  transaction: any;
  paymentIntent: any;
  success: boolean;
}
