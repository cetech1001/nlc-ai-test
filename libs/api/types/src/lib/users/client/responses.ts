export interface ClientWithDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  source?: string;
  tags?: string[];
  lastInteractionAt?: Date;
  totalInteractions?: number;
  engagementScore?: number;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  coursesBought: number;
  coursesCompleted: number;
  emailThreadsCount: number;
  coaches: Array<{
    id: string;
    name: string;
    businessName?: string;
    isPrimary: boolean;
  }>;
  courseEnrollments?: any[];
  emailThreads?: any[];
  clientCoaches?: any[];
}
