export interface CourseLessonWithDetails {
  id: string;
  chapterID: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessonType: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  pdfUrl?: string;
  dripDelay: number;
  isLocked: boolean;
  estimatedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseChapterWithDetails {
  id: string;
  courseID: string;
  title: string;
  description?: string;
  orderIndex: number;
  dripDelay: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  lessons?: CourseLessonWithDetails[];
}

export interface ExtendedCourse {
  id: string;
  coachID: string;
  title: string;
  description?: string;
  category?: string;
  difficultyLevel?: string;
  pricingType: string;
  price?: number;
  currency: string;
  installmentCount?: number;
  installmentAmount?: number;
  installmentInterval?: string;
  monthlyPrice?: number;
  annualPrice?: number;
  thumbnailUrl?: string;
  estimatedDurationHours?: number;
  totalChapters: number;
  totalLessons: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completionRate: number;
  isActive: boolean;
  isPublished: boolean;
  allowInstallments: boolean;
  allowSubscriptions: boolean;
  isDripEnabled: boolean;
  dripInterval?: string;
  dripCount?: number;
  createdAt: Date;
  updatedAt: Date;
  chapters?: CourseChapterWithDetails[];
}

export interface CourseStats {
  courseID: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completionRate: number;
  averageProgress: number;
  totalRevenue: number;
  popularChapter?: {
    id: string;
    title: string;
    completionCount: number;
  };
  dropoffPoints: Array<{
    chapterID: string;
    chapterTitle: string;
    dropoffRate: number;
  }>;
}

export interface CourseBasic {
  id: string;
  coachID: string;
  title: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  pricingType: string;
  price?: number;
  currency: string;
  isPublished: boolean;
  totalEnrollments: number;
  createdAt: Date;
}
