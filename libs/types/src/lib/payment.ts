export interface CreatePaymentIntentRequest {
  coachId: string;
  planId: string;
  amount: number; // in cents
  currency?: string;
  description?: string;
  paymentMethodId?: string; // for immediate processing
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
