import {BaseClient, FilterValues, Paginated, SearchQuery} from "@nlc-ai/sdk-core";
import {
  PaymentResult,
  SendPaymentRequestResponse,
  CreatePaymentIntentRequest,
  PaymentLinkResponse,
  ProcessPaymentRequest,
  SendPaymentRequest,
  PaymentIntentResponse,
  PaymentLinkStatus,
  PaymentRequest,
  PaymentRequestStats, CreateSetupIntentRequest
} from "../types";


export class PaymentsClient extends BaseClient{
  async getPaymentRequests(coachID: string, searchOptions: SearchQuery, filters: FilterValues) {
    const params = new URLSearchParams();
    const { page = 1, search, limit = 10 } = searchOptions;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);

    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    const response = await this.request<Paginated<PaymentRequest>>('GET', `/requests/${coachID}?${params}`);
    return response.data!;
  }

  async getPaymentRequestStats(coachID: string) {
    const response = await this.request<PaymentRequestStats>('GET', `/requests/${coachID}/stats`);
    return response.data!;
  }

  async sendPaymentRequest(data: SendPaymentRequest): Promise<SendPaymentRequestResponse> {
    const response = await this.request<SendPaymentRequestResponse>('POST', '/send-payment-request', {
      body: data,
    });
    return response.data!;
  }

  async createPaymentLink(data: CreatePaymentIntentRequest): Promise<PaymentLinkResponse> {
    const response = await this.request<PaymentLinkResponse>('POST', '/create-payment-link', {
      body: data,
    });
    return response.data!;
  }

  async createPaymentIntent(data: CreatePaymentIntentRequest) {
    return this.request<PaymentIntentResponse>('POST', '/create-payment-intent', {
      body: data,
    });
  }

  async processPayment(data: ProcessPaymentRequest): Promise<PaymentResult> {
    const response = await this.request<PaymentResult>('POST', '/process-payment', {
      body: data,
    });
    return response.data!;
  }

  async getPaymentLinkStatus(linkID: string): Promise<PaymentLinkStatus> {
    const response = await this.request<PaymentLinkStatus>('GET', `/payment-link/${linkID}/status`);
    return response.data!;
  }

  async deactivatePaymentLink(linkID: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('PATCH', `/payment-link/${linkID}/deactivate`);
    return response.data!;
  }

  async createSetupIntent(data: CreateSetupIntentRequest) {
    return this.request<{ client_secret: string }>('POST', '/setup-intent', {
      body: data,
    });
  }
}
