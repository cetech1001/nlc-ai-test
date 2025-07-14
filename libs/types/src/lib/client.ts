import {AiInteraction} from "./agent";
import {Coach} from "./coach";
import {Course, CourseEnrollment} from "./course";
import {EmailThread} from "./email";

export interface Client {
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
}

export type CreateClient = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateClient = Partial<CreateClient>;

export interface ClientWithCourses extends Client {
  courseEnrollments: (CourseEnrollment & {
    course: Course;
  })[];
}
