import {RecentCoach} from "./coach";

export interface DashboardStats {
  totalCoaches: number;
  totalCoachesGrowth: number; // Growth from previous month
  activeCoaches: number;
  activeCoachesGrowth: number; // Growth from previous month
  inactiveCoaches: number;
  inactiveCoachesGrowth: number; // Growth from previous month
  allTimeRevenue: number;
  allTimeRevenueGrowth: number; // Growth from previous year
  monthlyRevenue: number;
  monthlyRevenueGrowth: number; // Growth from previous month
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

export interface DashboardData {
  stats: DashboardStats;
  revenueData: {
    weekly?: RevenueGrowthData;
    monthly?: RevenueGrowthData;
    yearly: RevenueGrowthData;
  };
  recentCoaches: RecentCoach[];
}
