import { BaseAPI } from './base';
import {
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
  PaymentLinkResponse, PaymentResult, ProcessPaymentRequest,
  SendPaymentRequest, SendPaymentRequestResponse
} from "@nlc-ai/types";

class PaymentsAPI extends BaseAPI {
  async sendPaymentRequest(data: SendPaymentRequest): Promise<SendPaymentRequestResponse> {
    return this.makeRequest('/payments/send-payment-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPaymentLink(data: CreatePaymentIntentRequest): Promise<PaymentLinkResponse> {
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

  async getPaymentMethods(customerID: string): Promise<any[]> {
    return this.makeRequest(`/payments/customer/${customerID}/payment-methods`);
  }

  async getPaymentLinkStatus(linkID: string): Promise<{
    status: string;
    paymentsCount: number;
    totalAmount: number;
  }> {
    return this.makeRequest(`/payments/payment-link/${linkID}/status`);
  }

  async deactivatePaymentLink(linkID: string): Promise<{ message: string }> {
    return this.makeRequest(`/payments/payment-link/${linkID}/deactivate`, {
      method: 'PATCH',
    });
  }

  async createSetupIntent(customerID: string): Promise<{ client_secret: string }> {
    return this.makeRequest('/payments/setup-intent', {
      method: 'POST',
      body: JSON.stringify({ customerID }),
    });
  }
}

export const paymentsAPI = new PaymentsAPI();
