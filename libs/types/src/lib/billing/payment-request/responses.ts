import {PaymentRequestStatus, PaymentRequestType} from "./requests";

export interface ExtendedPaymentRequest {
  id: string;
  createdByID: string;
  createdByType: string;
  payerID: string;
  payerType: string;

  type: PaymentRequestType;
  amount: number;
  currency: string;
  description?: string;
  notes?: string;

  status: PaymentRequestStatus;
  paymentLinkUrl?: string;
  stripePaymentLinkID?: string;

  paidAt?: Date;
  paidAmount?: number;
  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  payer: {
    id: string;
    name: string;
    email: string;
  };

  plan?: {
    name: string;
    monthlyPrice: number;
  };

  course?: {
    title: string;
    price: number;
  };

  community?: {
    name: string;
    pricingType: string;
  };
}
