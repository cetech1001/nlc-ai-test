import { BaseAPI } from "@nlc-ai/api-client";

export interface DashboardStats {
  totalCoaches: number;
  activeCoaches: number;
  inactiveCoaches: number;
  allTimeRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  coachGrowth: number;
}

export interface RevenueData {
  period: string;
  revenue: number;
  date?: string;
}

export interface RecentCoach {
  id: string;
  name: string;
  email: string;
  dateJoined: string;
  plan: string;
  status: 'active' | 'inactive' | 'blocked';
}

export interface DashboardData {
  stats: DashboardStats;
  revenueData: {
    weekly: RevenueData[];
    monthly: RevenueData[];
    yearly: RevenueData[];
  };
  recentCoaches: RecentCoach[];
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

class DashboardAPI extends BaseAPI{

  async getDashboardData(): Promise<DashboardData> {
    return this.makeRequest('/dashboard');
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.makeRequest('/dashboard/stats');
  }

  async getRevenueData(period: 'week' | 'month' | 'year' = 'year'): Promise<RevenueData[]> {
    return this.makeRequest(`/dashboard/revenue?period=${period}`);
  }

  async getRecentCoaches(limit: number = 6): Promise<RecentCoach[]> {
    return this.makeRequest(`/dashboard/recent-coaches?limit=${limit}`);
  }
}

export const dashboardAPI = new DashboardAPI();
