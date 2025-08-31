import {BaseClient, FilterValues, Paginated, SearchQuery} from "@nlc-ai/sdk-core";
import {CoachPaymentRequest, CoachPaymentRequestStats} from "@nlc-ai/types";

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

    const response = await this.request<Paginated<CoachPaymentRequest>>('GET', `/requests/${coachID}?${params}`);
    return response.data!;
  }

  async getPaymentRequestStats(coachID: string) {
    const response = await this.request<CoachPaymentRequestStats>('GET', `/requests/${coachID}/stats`);
    return response.data!;
  }
}
