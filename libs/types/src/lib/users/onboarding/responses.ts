export interface ScenarioAnswer {
  questionID: string;
  category: string;
  question: string;
  answer: string;
}

export interface CoachMetadata {
  onboarding?: {
    scenarios?: ScenarioAnswer[];
    completedAt?: string;
    scenariosCompleted?: number;
  };
  [key: string]: any;
}

export interface UploadedDocument {
  id: string;
  name: string;
  category: string;
  fileSize: number;
  openaiFileID?: string;
}

export interface CoachingProfile {
  communicationStyle: {
    tone: string;
    commonPhrases: string[];
    preferredGreetings: string[];
    preferredClosings: string[];
  };
  methodology: {
    framework: string;
    approach: string;
    uniqueValueProposition: string;
  };
  targetAudience: {
    idealClient: string;
    worksBestWith: string[];
  };
  businessContext: {
    services: string[];
    pricingApproach: string;
  };
  behavioralPatterns: {
    problemSolving: string;
    accountability: string;
    celebration: string;
    boundaries: string;
    difficultConversations: string;
  };
}
