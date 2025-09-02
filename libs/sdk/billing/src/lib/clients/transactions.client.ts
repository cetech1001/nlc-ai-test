import {BaseClient, FilterValues, Paginated, SearchQuery} from "@nlc-ai/sdk-core";
import {ExtendedTransaction, Transaction, TransactionStats, RevenueGrowthData, RevenueStats} from "../types";
import {Coach} from "@nlc-ai/sdk-users";

export interface TransactionSearchQuery extends SearchQuery {
  payerID?: string;
  payerType?: string;
  payeeID?: string;
  payeeType?: string;
}

export class TransactionsClient extends BaseClient{
  async getTransactions(
    searchOptions: TransactionSearchQuery = {},
    filters: FilterValues = {},
  ): Promise<Paginated<ExtendedTransaction>> {
    const { page = 1, limit = 10, search, payerID, payerType, payeeID, payeeType } = searchOptions;

    const params = new URLSearchParams();

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);
    if (payerID) params.append('payerID', payerID);
    if (payerType) params.append('payerType', payerType);
    if (payeeID) params.append('payeeID', payeeID);
    if (payeeType) params.append('payeeType', payeeType);

    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    if (filters.paymentMethod && Array.isArray(filters.paymentMethod) && filters.paymentMethod.length > 0) {
      params.append('paymentMethod', filters.paymentMethod.join(','));
    }

    if (filters.dateRange) {
      if (filters.dateRange.start) {
        params.append('startDate', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        params.append('endDate', filters.dateRange.end);
      }
    }

    if (filters.amountRange) {
      if (filters.amountRange.min) {
        params.append('minAmount', filters.amountRange.min);
      }
      if (filters.amountRange.max) {
        params.append('maxAmount', filters.amountRange.max);
      }
    }

    if (filters.planNames && Array.isArray(filters.planNames) && filters.planNames.length > 0) {
      params.append('planNames', filters.planNames.join(','));
    }

    const response = await this.request<Paginated<ExtendedTransaction>>('GET', `?${params.toString()}`);
    return response.data!
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await this.request<Transaction>('GET', `/${id}`);
    return response.data!
  }

  async getTransactionStats(): Promise<TransactionStats> {
    const response = await this.request<TransactionStats>('GET', '/stats');
    return response.data!
  }

  async getRevenueByPeriod(period: 'week' | 'month' | 'year' = 'month'): Promise<RevenueGrowthData> {
    const response = await this.request<RevenueGrowthData>('GET', `/revenue?period=${period}`);
    return response.data!
  }

  async getRevenueStats(): Promise<RevenueStats> {
    const response = await this.request<RevenueStats>('GET', '/revenue/stats');
    return response.data!
  }

  async bulkExportTransactions(filters: Record<string, any> = {}): Promise<void> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.payerID) params.append('payerID', filters.payerID);
    if (filters.payerType) params.append('payerType', filters.payerType);

    const response = await fetch(`${this.baseURL}/export/bulk?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to bulk export transactions');
    }

    const data = await response.json();
    const today = new Date().toISOString().split('T')[0];

    // Create and download file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-export-${today}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async getTopPayingCoaches(limit = 10): Promise<Coach[]> {
    const response = await this.request<Coach[]>('GET', `/analytics/top-coaches?limit=${limit}`);
    return response.data!
  }

  async getMonthlyRevenueComparison(): Promise<any> {
    const response = await this.request('GET', '/analytics/monthly-comparison');
    return response.data!
  }

  async refundTransaction(id: string, amount?: number, reason?: string): Promise<Transaction> {
    const response = await this.request<Transaction>('POST', `/${id}/refund`, {
      body: { amount, reason }
    });
    return response.data!;
  }
}
