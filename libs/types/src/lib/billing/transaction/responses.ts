export interface ExtendedTransaction {
  payer?: {
    id: string;
    type: string;
    name: string;
    email: string;
  };
  payee?: {
    id: string;
    type: string;
    name: string;
    email: string;
  };
  plan?: {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
  };
  course?: {
    title: string;
    price: number;
  };
  community?: {
    name: string;
    pricingType: string;
  };
  invoice?: {
    invoiceNumber: string;
    status: string;
  } | null;
}

export interface RevenueData {
  period: string;
  revenue: number;
  date?: string;
}

export interface RevenueGrowthData {
  data: RevenueData[];
  growthDescription: string;
  growthPercentage: number;
}

export interface TimePeriodRevenueData {
  weekly?: RevenueGrowthData;
  monthly?: RevenueGrowthData;
  yearly: RevenueGrowthData;
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}
