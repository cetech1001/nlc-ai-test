import {CourseEnrollment} from "./course";
import {EmailThread} from "./email";

/*export interface Client {
  id: string;
  coachID: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  source?: string | null;
  tags: string[];
  lastInteractionAt?: Date | null;
  totalInteractions?: number | null;
  engagementScore?: number | null;
  customFields?: any | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  aiInteractions?: AiInteraction[];
  coach?: Coach;
  courseEnrollments?: CourseEnrollment[];
  emailThreads?: EmailThread[];
}*/

export interface Client {
  id: string;
  coachID: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  status: string;
  source?: string;
  tags: string[];
  lastInteractionAt?: Date;
  totalInteractions: number;
  engagementScore: number;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientWithDetails extends Client {
  coursesBought: number;
  coursesCompleted: number;
  emailThreadsCount?: number;
  courseEnrollments?: CourseEnrollment[];
  emailThreads?: EmailThread[];
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  totalCoursesBought: number;
  coursesCompleted: number;
}

export interface ClientQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  coursesBought?: string;
  dateJoinedStart?: string;
  dateJoinedEnd?: string;
  lastInteractionStart?: string;
  lastInteractionEnd?: string;
}

export interface CreateClient {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  source?: string;
  tags?: string[];
}

export interface UpdateClient extends Partial<CreateClient>{
  status?: string;
}

export interface DataTableClient {
  id: string;
  name: string;
  email: string;
  firstCourseBoughtOn: string;
  coursesBought: number;
  coursesCompleted: number;
  originalID: string;
}
