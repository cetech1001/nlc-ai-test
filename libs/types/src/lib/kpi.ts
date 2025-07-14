import {Coach} from "./coach";

export interface DailyKPI {
  id: string;
  coachID: string;
  date: Date;
  totalClients?: number | null;
  newClients?: number | null;
  churnedClients?: number | null;
  activeClients?: number | null;
  totalInteractions?: number | null;
  avgEngagementScore?: number | null;
  contentPiecesPublished?: number | null;
  totalContentViews?: number | null;
  avgContentEngagement?: number | null;
  newEnrollments?: number | null;
  courseCompletions?: number | null;
  avgCourseProgress?: number | null;
  aiRequests?: number | null;
  aiTokensUsed?: number | null;
  emailsSent?: number | null;
  emailsOpened?: number | null;
  emailsClicked?: number | null;
  createdAt?: Date | null;
  coach?: Coach;
}
