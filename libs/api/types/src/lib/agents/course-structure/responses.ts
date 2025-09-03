export interface SuggestedLesson {
  title: string;
  description: string;
  lessonType: string;
  estimatedMinutes: number;
  orderIndex: number;
  learningObjectives: string[];
  contentOutline: string[];
  resources?: string[];
  assessmentSuggestions?: string[];
}

export interface SuggestedChapter {
  title: string;
  description: string;
  orderIndex: number;
  estimatedDurationHours: number;
  learningGoals: string[];
  lessons: SuggestedLesson[];
  prerequisites?: string[];
  outcomes?: string[];
}

export interface CourseStructureSuggestion {
  courseTitle: string;
  courseDescription: string;
  recommendedDifficulty: string;
  suggestedCategory: string;
  estimatedTotalHours: number;
  targetAudience: string;
  learningOutcomes: string[];
  prerequisites: string[];
  suggestedChapters: SuggestedChapter[];
  recommendations: string[];
  pricingGuidance?: {
    suggestedPriceRange: string;
    pricingRationale: string;
    monetizationTips: string[];
  };
  marketingTips?: string[];
  deliveryRecommendations?: string[];
}
