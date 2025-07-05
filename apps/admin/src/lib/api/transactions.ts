import {BaseApi} from "@/lib/api/base-api";

export interface Transaction {
  id: string;
  coachId: string;
  coachName: string;
  coachEmail: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled' | 'refunded' | 'partially_refunded';
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'stripe' | 'manual';
  invoiceNumber?: string;
  invoiceDate: string;
  transactionDate: string;
  paidAt?: string;
  description?: string;
}

export interface TransactionDetails extends Transaction {
  coach: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    businessName?: string;
  };
  plan: {
    name: string;
    description?: string;
  };
  subscription?: {
    id: string;
    status: string;
    billingCycle: string;
  };
}

export interface TransactionStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalRevenue: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RevenueData {
  period: string;
  revenue: number;
}

class TransactionsAPI extends BaseApi{
  async getTransactions(
    page = 1,
    limit = 10,
    status?: string,
    search?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PaginatedTransactions> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) params.append('status', status);
    if (search) params.append('search', search);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.makeRequest(`/transactions?${params.toString()}`);
  }

  async getTransaction(id: string): Promise<TransactionDetails> {
    return this.makeRequest(`/transactions/${id}`);
  }

  async getTransactionStats(): Promise<TransactionStats> {
    return this.makeRequest('/transactions/stats');
  }

  async getRevenueData(period: 'week' | 'month' | 'year' = 'month'): Promise<RevenueData[]> {
    return this.makeRequest(`/transactions/revenue?period=${period}`);
  }

  async downloadTransaction(id: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/transactions/${id}/export`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download transaction');
    }

    const data = await response.json();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-${id}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return data;
  }
}

export const transactionsAPI = new TransactionsAPI();
