import {BaseClient, FilterValues, Paginated, SearchQuery} from "@nlc-ai/sdk-core";
import {CreatePaymentRequestData, PaymentRequest} from "../types";

export class PaymentRequestsClient extends BaseClient{
  async getPaymentRequests(searchOptions: SearchQuery = {}, filters: FilterValues = {}): Promise<Paginated<PaymentRequest>> {
    const { page = 1, limit = 10, search } = searchOptions;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);

    if (filters.payerID) params.append('payerID', filters.payerID);
    if (filters.status) params.append('status', filters.status);

    const response = await this.request<Paginated<PaymentRequest>>('GET', `/?${params}`);
    return response.data!;
  }

  async createPaymentRequest(data: CreatePaymentRequestData): Promise<PaymentRequest> {
    const response = await this.request<PaymentRequest>('POST', '/', { body: data });
    return response.data!;
  }

  async getPaymentRequest(id: string): Promise<PaymentRequest> {
    const response = await this.request<PaymentRequest>('GET', `/${id}`);
    return response.data!;
  }

  async cancelPaymentRequest(id: string): Promise<PaymentRequest> {
    const response = await this.request<PaymentRequest>('PATCH', `/${id}/cancel`);
    return response.data!;
  }
}
