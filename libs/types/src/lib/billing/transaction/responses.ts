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
