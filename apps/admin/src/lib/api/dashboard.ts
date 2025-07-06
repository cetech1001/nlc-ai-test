import { BaseAPI } from '@nlc-ai/api-client';
import {DashboardData, DashboardStats, RecentCoach, RevenueGrowthData} from "@nlc-ai/types";

class DashboardAPI extends BaseAPI {
  async getDashboardData(): Promise<DashboardData> {
    return this.makeRequest('/dashboard');
  }

  async getStats(): Promise<DashboardStats> {
    return this.makeRequest('/dashboard/stats');
  }

  async getRevenueData(period: 'week' | 'month' | 'year'): Promise<RevenueGrowthData> {
    return this.makeRequest(`/dashboard/revenue?period=${period}`);
  }

  async getRecentCoaches(limit = 6): Promise<RecentCoach[]> {
    return this.makeRequest(`/dashboard/recent-coaches?limit=${limit}`);
  }
}

export const dashboardAPI = new DashboardAPI();
