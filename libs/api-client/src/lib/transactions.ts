import { BaseAPI } from './base';
import {Paginated, RevenueGrowthData, Transaction, TransactionStats, TransactionWithDetails} from '@nlc-ai/types';

export class TransactionsAPI extends BaseAPI {
  async getTransactions(
    page = 1,
    limit = 10,
    filters: Record<string, any> = {},
    search?: string
  ): Promise<Paginated<TransactionWithDetails>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);

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

    return this.makeRequest(`/transactions?${params.toString()}`);
  }

  async getTransaction(id: string): Promise<Transaction> {
    return this.makeRequest(`/transactions/${id}`);
  }

  async getTransactionStats(): Promise<TransactionStats> {
    return this.makeRequest('/transactions/stats');
  }

  async getRevenueByPeriod(period: 'week' | 'month' | 'year' = 'month'): Promise<RevenueGrowthData> {
    return this.makeRequest(`/transactions/revenue?period=${period}`);
  }

  async getRevenueStats(): Promise<any> {
    return this.makeRequest('/transactions/revenue/stats');
  }

  async downloadTransaction(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/transactions/${id}/invoice`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice PDF');
      }

      // Get the blob data from the response
      const blob = await response.blob();

      // Create download URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${id}.pdf`;

      // Append to body, click, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Download error:', error);
      throw new Error(error.message || "Failed to download invoice PDF");
    }
  }

  async bulkExportTransactions(filters: Record<string, any> = {}): Promise<void> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(`${this.baseURL}/transactions/export/bulk?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
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

  async getTopPayingCoaches(limit = 10): Promise<any[]> {
    return this.makeRequest(`/transactions/analytics/top-coaches?limit=${limit}`);
  }

  async getMonthlyRevenueComparison(): Promise<any> {
    return this.makeRequest('/transactions/analytics/monthly-comparison');
  }

  async getTransactionsByStatus(status: string): Promise<any[]> {
    return this.makeRequest(`/transactions/by-status/${status}`);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<any[]> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return this.makeRequest(`/transactions/by-date-range?${params.toString()}`);
  }
}

export const transactionsAPI = new TransactionsAPI();
