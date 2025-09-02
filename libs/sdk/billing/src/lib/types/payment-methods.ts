import {Client, Coach} from "@nlc-ai/sdk-users";

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
  coachID?: string | null;
  clientID?: string | null;
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
  client?: Client;
}

export interface CreatePaymentMethodRequest {
  coachID?: string;
  clientID?: string;
  type: PaymentMethodType;
  isDefault?: boolean;
  cardLast4?: string;
  cardBrand?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  stripePaymentMethodID?: string;
  paypalEmail?: string;
}

export interface UpdatePaymentMethodRequest {
  isDefault?: boolean;
  isActive?: boolean;
  cardLast4?: string;
  cardBrand?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  stripePaymentMethodID?: string;
  paypalEmail?: string;
}
