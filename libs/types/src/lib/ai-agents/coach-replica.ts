export interface CoachPersonality {
  communicationStyle: 'formal' | 'casual' | 'friendly' | 'professional' | 'enthusiastic';
  responseLength: 'brief' | 'moderate' | 'detailed';
  toneKeywords: string[];
  commonPhrases: string[];
  preferredGreetings: string[];
  preferredClosings: string[];
  signatureElements: string[];
}

export interface CoachBusinessContext {
  industry: string;
  targetAudience: string[];
  services: string[];
  expertise: string[];
  priceRange: string;
  businessValues: string[];
  uniqueSellingPoints: string[];
}

export interface CoachWritingStyle {
  avgSentenceLength: number;
  paragraphStyle: 'short' | 'medium' | 'long';
  useOfEmojis: 'none' | 'minimal' | 'moderate' | 'frequent';
  formalityLevel: number; // 1-10 scale
  persuasivenessLevel: number; // 1-10 scale
  empathyMarkers: string[];
}

export interface CoachContentPatterns {
  popularTopics: Array<{
    topic: string;
    frequency: number;
    engagementRate: number;
  }>;
  contentTypes: Array<{
    type: string;
    performance: number;
  }>;
  postingSchedule: {
    bestTimes: string[];
    frequency: string;
  };
}

export interface CoachClientInteractionStyle {
  responseTimePatterns: {
    averageResponseHours: number;
    preferredResponseTimes: string[];
  };
  supportStyle: 'direct' | 'nurturing' | 'motivational' | 'analytical';
  followUpFrequency: 'high' | 'medium' | 'low';
  personalizedApproach: boolean;
}

export interface CoachKnowledgeProfile {
  coachID: string;
  personality: CoachPersonality;
  businessContext: CoachBusinessContext;
  writingStyle: CoachWritingStyle;
  contentPatterns: CoachContentPatterns;
  clientInteractionStyle: CoachClientInteractionStyle;
  lastUpdated: Date;
  confidenceScore: number; // How complete/accurate the profile is (0-100)
  dataSourcesUsed: string[]; // Which data sources contributed to this profile
}

export interface CoachReplicaRequest {
  coachID: string;
  context: string;
  requestType: 'email_response' | 'content_creation' | 'lead_follow_up' | 'client_retention' | 'general_query';
  additionalData?: any;
}

export interface CoachReplicaResponse {
  response: string;
  confidence: number;
  reasoning: string;
  suggestedTone: string;
  alternativeResponses?: string[];
}
