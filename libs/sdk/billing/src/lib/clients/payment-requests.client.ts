import {BaseClient, FilterValues, Paginated, SearchQuery} from "@nlc-ai/sdk-core";
import {PaymentRequest} from "../types";

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
}
