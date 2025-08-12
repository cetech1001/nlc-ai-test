import {PaymentMethodType} from "@prisma/client";

export interface CreatePaymentMethodRequest {
  coachID: string;
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

export interface PaymentMethodFilters {
  coachID?: string;
  type?: PaymentMethodType;
  isDefault?: boolean;
  isActive?: boolean;
  cardBrand?: string;
  expiringBefore?: Date;
}
