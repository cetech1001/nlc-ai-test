import {AiInteractions, Coaches, CourseEnrollments, EmailThreads} from "./index";

export interface Client {
  id: string;
  coachId: string;
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
  customFields?: any;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  aiInteractions: AiInteractions[];
  coaches: Coaches;
  courseEnrollments: CourseEnrollments[];
  emailThreads: EmailThreads[];
}
