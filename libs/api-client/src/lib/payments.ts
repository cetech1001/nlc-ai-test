// libs/api-client/src/lib/payment.ts
import { BaseAPI } from './base';

export interface SendPaymentRequestResponse {
  paymentLink: string;
  linkId: string;
  emailSent: boolean;
}

export interface CreatePaymentLinkRequest {
  coachId: string;
  planId: string;
  amount: number; // in cents
  currency?: string;
  description?: string;
}

export interface SendPaymentRequest extends CreatePaymentLinkRequest{
  paymentLink?: string;
  linkId?: string;
}

export interface PaymentLinkResponse {
  paymentLink: string;
  linkId: string;
}

export interface CreatePaymentIntentRequest {
  coachId: string;
  planId: string;
  amount: number; // in cents
  currency?: string;
  description?: string;
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

class PaymentsAPI extends BaseAPI {
  async sendPaymentRequest(data: SendPaymentRequest): Promise<SendPaymentRequestResponse> {
    return this.makeRequest('/payments/send-payment-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPaymentLink(data: CreatePaymentLinkRequest): Promise<PaymentLinkResponse> {
    return this.makeRequest('/payments/create-payment-link', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    return this.makeRequest('/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async processPayment(data: ProcessPaymentRequest): Promise<PaymentResult> {
    return this.makeRequest('/payments/process-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentMethods(customerId: string): Promise<any[]> {
    return this.makeRequest(`/payments/customer/${customerId}/payment-methods`);
  }

  async getPaymentLinkStatus(linkId: string): Promise<{
    status: string;
    paymentsCount: number;
    totalAmount: number;
  }> {
    return this.makeRequest(`/payments/payment-link/${linkId}/status`);
  }

  async deactivatePaymentLink(linkId: string): Promise<{ message: string }> {
    return this.makeRequest(`/payments/payment-link/${linkId}/deactivate`, {
      method: 'PATCH',
    });
  }

  async createSetupIntent(customerId: string): Promise<{ client_secret: string }> {
    return this.makeRequest('/payments/setup-intent', {
      method: 'POST',
      body: JSON.stringify({ customerId }),
    });
  }
}

export const paymentsAPI = new PaymentsAPI();
