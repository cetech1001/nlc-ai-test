import {CoachWithStatus} from "./coach";

export interface DashboardStats {
  totalCoaches: number;
  totalCoachesGrowth: number;
  inactiveCoaches: number;
  inactiveCoachesGrowth: number;
  allTimeRevenue: number;
  allTimeRevenueGrowth: number;
  monthlyRevenue: number;
  monthlyRevenueGrowth: number;
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
  recentCoaches: CoachWithStatus[];
}
