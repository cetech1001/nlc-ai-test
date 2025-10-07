export interface ScenarioAnswer {
  questionID: string;
  category: string;
  question: string;
  answer: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  category: string;
  openaiFileID?: string;
}

export interface ConnectedAccount {
  id: string;
  name: string;
  type: 'essential' | 'social';
  status: 'connected' | 'disconnected';
}

export interface OnboardingData {
  scenarios: ScenarioAnswer[];
  documents: UploadedDocument[];
  connections: ConnectedAccount[];
  completedAt?: Date;
}

export interface CoachingProfile {
  communicationStyle: {
    tone: string; // formal, casual, professional
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
