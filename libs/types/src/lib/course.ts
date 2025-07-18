import {Client} from "./client";
import {Coach} from "./coach";

export interface CourseEnrollment {
  id: string;
  courseID: string;
  clientID: string;
  enrolledAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  progressPercentage?: number | null;
  currentModule?: number | null;
  modulesCompleted?: number | null;
  lastActivityAt?: Date | null;
  totalTimeSpentMinutes?: number | null;
  loginCount?: number | null;
  daysSinceLastLogin?: number | null;
  status?: string | null;
  dropoutRiskScore?: number | null;
  recommendedActions?: any | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  client?: Client;
  course?: Course;
}

export interface Course {
  id: string;
  coachID: string;
  title: string;
  description?: string | null;
  category?: string | null;
  difficultyLevel?: string | null;
  platform?: string | null;
  platformCourseID?: string | null;
  platformUrl?: string | null;
  thumbnailUrl?: string | null;
  totalModules?: number | null;
  estimatedDurationHours?: number | null;
  totalEnrollments?: number | null;
  activeEnrollments?: number | null;
  completionRate?: number | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  courseEnrollments?: CourseEnrollment[];
  coach?: Coach;
}

