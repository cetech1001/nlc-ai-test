export interface UserStats {
  totalUsers?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  newUsers?: number;
  growth?: number;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  totalCoursesBought: number;
  coursesCompleted: number;
}

export interface CoachStats {
  totalCoaches: number;
  inactiveCoaches: number;
  totalCoachesGrowth: number;
  inactiveCoachesGrowth: number;
}
