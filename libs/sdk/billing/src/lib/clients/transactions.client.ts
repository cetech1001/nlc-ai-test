import {BaseClient, FilterValues, Paginated, SearchQuery} from "@nlc-ai/sdk-core";
import {TransactionWithDetails} from "../types";

export class TransactionsClient extends BaseClient{
  async getTransactions(
    searchOptions: SearchQuery = {},
    filters: FilterValues = {},
  ): Promise<Paginated<any>> {
    const params = new URLSearchParams();
    const { page = 1, search, limit = 10 } = searchOptions;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);

    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    const response = await this.request<Paginated<TransactionWithDetails>>('GET', `?${params}`);
    return response.data!;
  }
}
