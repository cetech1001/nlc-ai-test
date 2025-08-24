import { BaseClient } from "@nlc-ai/sdk-core";
import {
  AdminDashboardData,
  TransactionStats,
  CoachPerformance,
  RevenueTrends
} from "../types";

export class AdminAnalyticsClient extends BaseClient {
  async getDashboardData(): Promise<AdminDashboardData> {
    const response = await this.request<AdminDashboardData>('GET', '/dashboard');
    return response.data!;
  }

  async getTransactionStats(): Promise<TransactionStats> {
    const response = await this.request<TransactionStats>('GET', '/transaction-stats');
    return response.data!;
  }

  async getCoachPerformance(): Promise<CoachPerformance> {
    const response = await this.request<CoachPerformance>('GET', '/coach-performance');
    return response.data!;
  }

  async getRevenueTrends(): Promise<RevenueTrends> {
    const response = await this.request<RevenueTrends>('GET', '/revenue-trends');
    return response.data!;
  }
}
