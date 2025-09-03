export interface CourseStructureRequest {
  description: string;
  targetAudience?: string;
  difficultyLevel?: string;
  estimatedDuration?: string;
  preferredFormat?: string; // video, text, mixed
  budget?: string;
  specialRequirements?: string[];
}
