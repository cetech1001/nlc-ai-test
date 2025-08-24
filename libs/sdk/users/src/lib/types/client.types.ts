export interface Client {
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
  courseEnrollments?: any[];
  emailThreads?: any[];
  clientCoaches?: any[];
}

export interface ExtendedClient extends Client{
  coursesBought: number;
  coursesCompleted: number;
  emailThreadsCount: number;
  coaches: Array<{
    id: string;
    name: string;
    businessName?: string;
    isPrimary: boolean;
  }>;
}

export interface CreateClient {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  source?: string;
  tags?: string[];
  coachID?: string;
}

export interface UpdateClient {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  source?: string;
  tags?: string[];
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  totalCoursesBought: number;
  coursesCompleted: number;
}

export type ClientFormData = CreateClient | UpdateClient;

export interface DataTableClient {
  id: string;
  name: string;
  email: string;
  firstCourseBoughtOn: string;
  coursesBought: number;
  coursesCompleted: number;
  originalID: string;
}

export interface ClientFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  source?: string;
  tags?: string;
  general?: string;
}
