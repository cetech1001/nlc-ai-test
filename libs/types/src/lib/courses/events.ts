import { BaseEvent } from '../base-event';

export interface CourseCreatedEvent extends BaseEvent {
  eventType: 'course.created';
  payload: {
    courseID: string;
    coachID: string;
    title: string;
    pricingType: string;
    price?: number | null;
    category?: string | null;
    createdAt: string;
  };
}

export interface CourseUpdatedEvent extends BaseEvent {
  eventType: 'course.updated';
  payload: {
    courseID: string;
    coachID: string;
    title: string;
    changes: Record<string, any>;
    updatedAt: string;
  };
}

export interface CourseDeletedEvent extends BaseEvent {
  eventType: 'course.deleted';
  payload: {
    courseID: string;
    coachID: string;
    title: string;
    deletedAt: string;
  };
}

export interface CoursePublishedEvent extends BaseEvent {
  eventType: 'course.published';
  payload: {
    courseID: string;
    coachID: string;
    title: string;
    publishedAt: string;
  };
}

export interface CourseUnpublishedEvent extends BaseEvent {
  eventType: 'course.unpublished';
  payload: {
    courseID: string;
    coachID: string;
    title: string;
    unpublishedAt: string;
  };
}

// =============================================================================
// COURSE CONTENT EVENTS
// =============================================================================

export interface ChapterCreatedEvent extends BaseEvent {
  eventType: 'course.chapter.created';
  payload: {
    chapterID: string;
    courseID: string;
    coachID: string;
    title: string;
    orderIndex: number;
    createdAt: string;
  };
}

export interface ChapterUpdatedEvent extends BaseEvent {
  eventType: 'course.chapter.updated';
  payload: {
    chapterID: string;
    courseID: string;
    coachID: string;
    changes: Record<string, any>;
    updatedAt: string;
  };
}

export interface ChapterDeletedEvent extends BaseEvent {
  eventType: 'course.chapter.deleted';
  payload: {
    chapterID: string;
    courseID: string;
    coachID: string;
    title: string;
    deletedAt: string;
  };
}

export interface LessonCreatedEvent extends BaseEvent {
  eventType: 'course.lesson.created';
  payload: {
    lessonID: string;
    chapterID: string;
    courseID: string;
    coachID: string;
    title: string;
    lessonType: string;
    orderIndex: number;
    createdAt: string;
  };
}

export interface LessonUpdatedEvent extends BaseEvent {
  eventType: 'course.lesson.updated';
  payload: {
    lessonID: string;
    chapterID: string;
    courseID: string;
    coachID: string;
    changes: Record<string, any>;
    updatedAt: string;
  };
}

export interface LessonDeletedEvent extends BaseEvent {
  eventType: 'course.lesson.deleted';
  payload: {
    lessonID: string;
    chapterID: string;
    courseID: string;
    coachID: string;
    title: string;
    deletedAt: string;
  };
}

// =============================================================================
// COURSE ENROLLMENT EVENTS
// =============================================================================

export interface CourseEnrolledEvent extends BaseEvent {
  eventType: 'course.enrolled';
  payload: {
    enrollmentID: string;
    courseID: string;
    clientID: string;
    coachID: string;
    paymentType: string;
    totalPaid: number;
    enrolledAt: string;
  };
}

export interface CourseProgressUpdatedEvent extends BaseEvent {
  eventType: 'course.progress.updated';
  payload: {
    enrollmentID: string;
    courseID: string;
    clientID: string;
    coachID: string;
    previousProgress: number;
    newProgress: number;
    completedLessons: number;
    updatedAt: string;
  };
}

export interface CourseCompletedEvent extends BaseEvent {
  eventType: 'course.completed';
  payload: {
    enrollmentID: string;
    courseID: string;
    clientID: string;
    coachID: string;
    completedAt: string;
    finalProgress: number;
    timeToComplete: number; // in days
  };
}

export interface LessonCompletedEvent extends BaseEvent {
  eventType: 'course.lesson.completed';
  payload: {
    enrollmentID: string;
    lessonID: string;
    chapterID: string;
    courseID: string;
    clientID: string;
    coachID: string;
    timeSpentMinutes: number;
    completedAt: string;
  };
}

// =============================================================================
// COURSE ANALYTICS EVENTS
// =============================================================================

export interface CourseAnalyticsUpdatedEvent extends BaseEvent {
  eventType: 'course.analytics.updated';
  payload: {
    courseID: string;
    coachID: string;
    metrics: {
      totalEnrollments: number;
      activeEnrollments: number;
      completionRate: number;
      averageProgress: number;
      totalRevenue: number;
    };
    period: {
      startDate: string;
      endDate: string;
    };
    updatedAt: string;
  };
}

export interface CourseDropOffDetectedEvent extends BaseEvent {
  eventType: 'course.drop-off.detected';
  payload: {
    courseID: string;
    coachID: string;
    chapterID: string;
    chapterTitle: string;
    dropOffRate: number;
    affectedStudents: number;
    detectedAt: string;
  };
}

// =============================================================================
// COURSE REVENUE EVENTS
// =============================================================================

export interface CourseRevenueGeneratedEvent extends BaseEvent {
  eventType: 'course.revenue.generated';
  payload: {
    courseID: string;
    coachID: string;
    enrollmentID: string;
    clientID: string;
    transactionID: string;
    amount: number;
    currency: string;
    paymentType: string;
    generatedAt: string;
  };
}

// =============================================================================
// UNION TYPES AND EXPORTS
// =============================================================================

export type CourseEvent =
// Lifecycle events
  | CourseCreatedEvent
  | CourseUpdatedEvent
  | CourseDeletedEvent
  | CoursePublishedEvent
  | CourseUnpublishedEvent
  // Content events
  | ChapterCreatedEvent
  | ChapterUpdatedEvent
  | ChapterDeletedEvent
  | LessonCreatedEvent
  | LessonUpdatedEvent
  | LessonDeletedEvent
  // Enrollment events
  | CourseEnrolledEvent
  | CourseProgressUpdatedEvent
  | CourseCompletedEvent
  | LessonCompletedEvent
  // Analytics events
  | CourseAnalyticsUpdatedEvent
  | CourseDropOffDetectedEvent
  // Revenue events
  | CourseRevenueGeneratedEvent;

// Event payload interfaces for easier typing
export interface CoursesServiceEventPayloads {
  // Lifecycle events
  'course.created': CourseCreatedEvent['payload'];
  'course.updated': CourseUpdatedEvent['payload'];
  'course.deleted': CourseDeletedEvent['payload'];
  'course.published': CoursePublishedEvent['payload'];
  'course.unpublished': CourseUnpublishedEvent['payload'];
  // Content events
  'course.chapter.created': ChapterCreatedEvent['payload'];
  'course.chapter.updated': ChapterUpdatedEvent['payload'];
  'course.chapter.deleted': ChapterDeletedEvent['payload'];
  'course.lesson.created': LessonCreatedEvent['payload'];
  'course.lesson.updated': LessonUpdatedEvent['payload'];
  'course.lesson.deleted': LessonDeletedEvent['payload'];
  // Enrollment events
  'course.enrolled': CourseEnrolledEvent['payload'];
  'course.progress.updated': CourseProgressUpdatedEvent['payload'];
  'course.completed': CourseCompletedEvent['payload'];
  'course.lesson.completed': LessonCompletedEvent['payload'];
  // Analytics events
  'course.analytics.updated': CourseAnalyticsUpdatedEvent['payload'];
  'course.drop-off.detected': CourseDropOffDetectedEvent['payload'];
  // Revenue events
  'course.revenue.generated': CourseRevenueGeneratedEvent['payload'];
}

// Helper type for event emission
export type CoursesServiceEventType = keyof CoursesServiceEventPayloads;

// Constants for routing keys used in the courses service
export const COURSES_SERVICE_ROUTING_KEYS = {
  // Lifecycle events
  COURSE_CREATED: 'course.created',
  COURSE_UPDATED: 'course.updated',
  COURSE_DELETED: 'course.deleted',
  COURSE_PUBLISHED: 'course.published',
  COURSE_UNPUBLISHED: 'course.unpublished',

  // Content events
  CHAPTER_CREATED: 'course.chapter.created',
  CHAPTER_UPDATED: 'course.chapter.updated',
  CHAPTER_DELETED: 'course.chapter.deleted',
  LESSON_CREATED: 'course.lesson.created',
  LESSON_UPDATED: 'course.lesson.updated',
  LESSON_DELETED: 'course.lesson.deleted',

  // Enrollment events
  COURSE_ENROLLED: 'course.enrolled',
  COURSE_PROGRESS_UPDATED: 'course.progress.updated',
  COURSE_COMPLETED: 'course.completed',
  LESSON_COMPLETED: 'course.lesson.completed',

  // Analytics events
  COURSE_ANALYTICS_UPDATED: 'course.analytics.updated',
  COURSE_DROP_OFF_DETECTED: 'course.drop-off.detected',

  // Revenue events
  COURSE_REVENUE_GENERATED: 'course.revenue.generated',
} as const;

// Event subscription patterns for other services listening to course events
export const COURSES_SERVICE_EVENT_PATTERNS = [
  // Core course events
  'course.*',
  // Specific patterns for different services
  'course.created',
  'course.published',
  'course.enrolled',
  'course.completed',
  'course.revenue.generated',
] as const;
