import {PricingType} from "../types";

export const transformSuggestionToCourse = (suggestion: any, additionalData?: any) => {
  return {
    title: suggestion.courseTitle,
    description: suggestion.courseDescription,
    category: suggestion.suggestedCategory,
    difficultyLevel: suggestion.recommendedDifficulty,
    estimatedDurationHours: suggestion.estimatedTotalHours,
    pricingType: PricingType.ONE_TIME,
    price: additionalData?.price,
    currency: 'USD',
    isDripEnabled: false,
    isActive: true,
    chapters: suggestion.suggestedChapters?.map((chapter: any, chapterIndex: number) => ({
      title: chapter.title,
      description: chapter.description,
      orderIndex: chapterIndex,
      dripDelay: 0,
      isLocked: false,
      lessons: chapter.lessons?.map((lesson: any, lessonIndex: number) => ({
        title: lesson.title,
        description: lesson.description,
        orderIndex: lessonIndex,
        lessonType: lesson.lessonType || 'video',
        estimatedMinutes: lesson.estimatedMinutes || 30,
        dripDelay: 0,
        isLocked: false,
      })) || []
    })) || []
  };
};
