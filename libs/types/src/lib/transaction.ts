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

export interface TransactionFilters {
  status: string;
  paymentMethod: string[];
  dateRange: { start: string | null; end: string | null };
  amountRange: { min: string; max: string };
  planNames: string[];
}

export interface DataTableTransaction {
  id: string;
  coachName: string;
  coachEmail: string;
  planName: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionDate: string;
  invoiceNumber?: string;
}
