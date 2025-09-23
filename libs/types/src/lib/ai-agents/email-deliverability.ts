export interface DeliverabilityAnalysis {
  overallScore: number; // 0-100
  primaryInboxProbability: number; // 0-100
  recommendations: DeliverabilityRecommendation[];
  spamTriggers: SpamTrigger[];
  improvements: EmailImprovement[];
}

export interface DeliverabilityRecommendation {
  category: 'subject' | 'content' | 'structure' | 'personalization' | 'technical';
  priority: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
  impact: string;
}

export interface SpamTrigger {
  trigger: string;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
  fix: string;
}

export interface EmailImprovement {
  original: string;
  improved: string;
  reason: string;
}

export interface AnalyzeEmailRequest {
  subject: string;
  body: string;
  coachID?: string;
  recipientType?: 'lead' | 'client' | 'general';
}

export interface EmailAnalysis {
  score: number;
  issues: string[];
  strengths: string[];
}
