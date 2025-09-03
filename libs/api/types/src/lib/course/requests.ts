export enum PricingType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
  INSTALLMENT = 'installment'
}

export interface CreateCourseLesson {
  title: string;
  description?: string;
  orderIndex: number;
  lessonType: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  pdfUrl?: string;
  dripDelay?: number;
  isLocked?: boolean;
  estimatedMinutes?: number;
}

export interface CreateCourseChapter {
  title: string;
  description?: string;
  orderIndex: number;
  dripDelay?: number;
  isLocked?: boolean;
  lessons?: CreateCourseLesson[];
}

export interface CreateCourse {
  coachID?: string; // Will be set from auth context if not provided
  title: string;
  description?: string;
  category?: string;
  difficultyLevel?: string;
  pricingType: PricingType;
  price?: number;
  currency?: string;
  installmentCount?: number;
  installmentAmount?: number;
  installmentInterval?: string;
  monthlyPrice?: number;
  annualPrice?: number;
  thumbnailUrl?: string;
  estimatedDurationHours?: number;
  allowInstallments?: boolean;
  allowSubscriptions?: boolean;
  isDripEnabled?: boolean;
  dripInterval?: string;
  dripCount?: number;
  chapters?: CreateCourseChapter[];
}

export interface UpdateCourse {
  title?: string;
  description?: string;
  category?: string;
  difficultyLevel?: string;
  pricingType?: PricingType;
  price?: number;
  currency?: string;
  installmentCount?: number;
  installmentAmount?: number;
  installmentInterval?: string;
  monthlyPrice?: number;
  annualPrice?: number;
  thumbnailUrl?: string;
  estimatedDurationHours?: number;
  isActive?: boolean;
  isPublished?: boolean;
  allowInstallments?: boolean;
  allowSubscriptions?: boolean;
  isDripEnabled?: boolean;
  dripInterval?: string;
  dripCount?: number;
}

export interface UpdateCourseChapter {
  title?: string;
  description?: string;
  orderIndex?: number;
  dripDelay?: number;
  isLocked?: boolean;
}

export interface UpdateCourseLesson {
  title?: string;
  description?: string;
  orderIndex?: number;
  lessonType?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  pdfUrl?: string;
  dripDelay?: number;
  isLocked?: boolean;
  estimatedMinutes?: number;
}

export interface CourseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficultyLevel?: string;
  pricingType?: PricingType;
  isActive?: boolean;
  isPublished?: boolean;
  coachID?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  createdAfter?: string;
  createdBefore?: string;
}
