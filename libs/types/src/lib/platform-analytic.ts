export interface PlatformAnalytic {
  id: string;
  date: Date;
  totalCoaches?: number | null;
  activeCoaches?: number | null;
  newCoaches?: number | null;
  churnedCoaches?: number | null;
  totalRevenue?: number | null;
  monthlyRecurringRevenue?: number | null;
  churnRate?: number | null;
  totalAiRequests?: number | null;
  totalAiTokens?: number | null;
  totalEmailsProcessed?: number | null;
  avgResponseTimeMs?: number | null;
  uptimePercentage?: number | null;
  createdAt?: Date | null;
}
