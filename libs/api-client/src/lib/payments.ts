import { BaseAPI } from './base';
import {CreatePaymentIntentRequest, PaymentIntentResponse, PaymentResult, ProcessPaymentRequest} from "@nlc-ai/types";

class PaymentsAPI extends BaseAPI {
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

  async createSetupIntent(customerId: string): Promise<{ client_secret: string }> {
    return this.makeRequest('/payments/setup-intent', {
      method: 'POST',
      body: JSON.stringify({ customerId }),
    });
  }
}

export const paymentsAPI = new PaymentsAPI();
