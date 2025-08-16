export interface PlatformAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalUsers: {
      coaches: number;
      clients: number;
      admins: number;
      total: number;
    };
    activeUsers: {
      coaches: number;
      clients: number;
      total: number;
    };
    newSignups: {
      coaches: number;
      clients: number;
      total: number;
    };
  };
  retention: {
    coachRetention: number;
    clientRetention: number;
  };
  revenue: {
    totalRevenue: number;
    transactionCount: number;
  };
}

export interface CoachAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalCoaches: number;
    activeCoaches: number;
    coachesByPlan: Array<{
      planName: string;
      count: number;
    }>;
  };
  growth: any[];
  topPerformers: any[];
}

export interface ClientAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalClients: number;
    activeClients: number;
  };
  growth: any[];
  engagement: {
    averageEngagementScore: number;
    activeClientsCount: number;
  };
  topClients: any[];
}

export interface CoachDetailedAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  coach: any;
  clients: {
    total: number;
    active: number;
    newClients: number;
  };
  revenue: {
    totalRevenue: number;
    transactionCount: number;
  };
  engagement: {
    totalInteractions: number;
    totalTokensUsed: number;
  };
  performance: {
    email: {
      totalThreads: number;
    };
    courses: {
      totalEnrollments: number;
    };
  };
}

export interface EngagementTrends {
  period: {
    startDate: Date;
    endDate: Date;
  };
  daily: any[];
  weekly: any[];
}
