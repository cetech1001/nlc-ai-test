import {PaymentMethodType} from "@prisma/client";
import {UserType} from "../../users";

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

export interface PaymentMethodFilters {
  userID?: string;
  userType?: UserType;
  type?: PaymentMethodType;
  isDefault?: boolean;
  isActive?: boolean;
  cardBrand?: string;
  expiringBefore?: Date;
}
