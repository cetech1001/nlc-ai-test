import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { CoachReplicaService } from '../coach-replica/coach-replica.service';
import {
  AnalyzeEmailRequest,
  DeliverabilityAnalysis,
  DeliverabilityRecommendation, EmailAnalysis,
  EmailImprovement,
  SpamTrigger
} from "@nlc-ai/types";

@Injectable()
export class EmailDeliverabilityService {
  private readonly logger = new Logger(EmailDeliverabilityService.name);
  private openai: OpenAI;

  private readonly spamTriggers = {
    high: [
      'free money', 'make money fast', 'guaranteed income', 'get rich quick',
      'urgent action required', 'act now', 'limited time', 'expires today',
      'no obligation', 'risk free', '100% free', 'call now',
      'dear friend', 'congratulations!', 'you have been selected',
      'click here now', 'order now', 'buy now', 'subscribe now'
    ],
    medium: [
      'free', 'discount', 'save money', 'special offer', 'promotion',
      'urgent', 'important', 'asap', 'immediate', 'priority',
      'amazing', 'incredible', 'unbelievable', 'fantastic',
      'guarantee', 'promise', 'instant', 'immediately'
    ],
    low: [
      'opportunity', 'deal', 'offer', 'bonus', 'gift',
      'winner', 'selected', 'chosen', 'qualified',
      'exclusive', 'limited', 'special', 'unique'
    ]
  };

  constructor(
    private configService: ConfigService,
    private coachReplicaService: CoachReplicaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Main method to analyze email deliverability
   */
  async analyzeEmailDeliverability(request: AnalyzeEmailRequest): Promise<DeliverabilityAnalysis> {
    try {
      let coachProfile = null;
      if (request.coachID) {
        try {
          coachProfile = await this.coachReplicaService.getCoachKnowledgeProfile(request.coachID);
        } catch (error) {
          this.logger.warn(`Could not get coach profile for ${request.coachID}:`, error);
        }
      }

      const [
        aiAnalysis,
        spamTriggers,
        structuralAnalysis,
        personalizationAnalysis
      ] = await Promise.all([
        this.getAIDeliverabilityAnalysis(request, coachProfile),
        this.detectSpamTriggers(request.subject, request.body),
        this.analyzeEmailStructure(request.subject, request.body),
        this.analyzePersonalization(request.subject, request.body, coachProfile)
      ]);

      const overallScore = this.calculateOverallScore(
        aiAnalysis,
        spamTriggers,
        structuralAnalysis,
        personalizationAnalysis
      );

      const recommendations = this.generateRecommendations(
        aiAnalysis,
        spamTriggers,
        structuralAnalysis,
        personalizationAnalysis,
        coachProfile
      );

      const improvements = await this.generateImprovements(request, coachProfile);

      return {
        overallScore,
        primaryInboxProbability: Math.max(0, overallScore - 15), // Primary inbox is stricter
        recommendations,
        spamTriggers,
        improvements
      };

    } catch (error) {
      this.logger.error('Error analyzing email deliverability:', error);
      throw new Error('Failed to analyze email deliverability');
    }
  }

  /**
   * Use AI to analyze deliverability factors
   */
  private async getAIDeliverabilityAnalysis(request: AnalyzeEmailRequest, coachProfile?: any): Promise<any> {
    const prompt = `
Analyze this email for deliverability to Gmail's Primary inbox:

SUBJECT: ${request.subject}

BODY:
${request.body}

${coachProfile ? `
SENDER CONTEXT:
- Industry: ${coachProfile.businessContext.industry}
- Communication Style: ${coachProfile.personality.communicationStyle}
- Business Type: Professional Coaching
` : ''}

RECIPIENT TYPE: ${request.recipientType || 'general'}

Please analyze and return JSON with:
{
  "subjectAnalysis": {
    "score": 0-100,
    "issues": ["issue1", "issue2"],
    "strengths": ["strength1", "strength2"]
  },
  "contentAnalysis": {
    "score": 0-100,
    "readability": 0-100,
    "engagement": 0-100,
    "professionalTone": 0-100,
    "personalLevel": 0-100
  },
  "deliverabilityFactors": {
    "spamLikelihood": 0-100,
    "promotionalContent": 0-100,
    "personalization": 0-100,
    "valueProposition": 0-100
  },
  "gmailSpecific": {
    "primaryInboxLikelihood": 0-100,
    "categoryPrediction": "primary|social|promotions|updates",
    "reasoning": "explanation"
  }
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email deliverability analyst specializing in Gmail\'s filtering algorithms and primary inbox placement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_completion_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('Error in AI deliverability analysis:', error);
      return {};
    }
  }

  /**
   * Detect spam trigger words and phrases
   */
  private detectSpamTriggers(subject: string, body: string): SpamTrigger[] {
    const fullText = (subject + ' ' + body).toLowerCase();
    const triggers: SpamTrigger[] = [];

    this.spamTriggers.high.forEach(trigger => {
      if (fullText.includes(trigger.toLowerCase())) {
        triggers.push({
          trigger,
          severity: 'high',
          explanation: `"${trigger}" is a high-risk spam phrase that often triggers email filters`,
          fix: `Remove or replace "${trigger}" with more professional language`
        });
      }
    });

    this.spamTriggers.medium.forEach(trigger => {
      if (fullText.includes(trigger.toLowerCase())) {
        triggers.push({
          trigger,
          severity: 'medium',
          explanation: `"${trigger}" can trigger spam filters, especially when combined with other promotional language`,
          fix: `Consider using "${trigger}" more sparingly or in a less promotional context`
        });
      }
    });

    let lowPriorityCount = 0;
    this.spamTriggers.low.forEach(trigger => {
      if (fullText.includes(trigger.toLowerCase())) {
        lowPriorityCount++;
      }
    });

    if (lowPriorityCount > 3) {
      triggers.push({
        trigger: 'Multiple promotional words',
        severity: 'low',
        explanation: `Email contains ${lowPriorityCount} promotional words that together may trigger filters`,
        fix: 'Reduce the number of sales-focused words and use more conversational language'
      });
    }

    return triggers;
  }

  /**
   * Analyze email structure and formatting
   */
  private analyzeEmailStructure(subject: string, body: string): any {
    const analysis: EmailAnalysis = {
      score: 100,
      issues: [],
      strengths: []
    };

    if (subject.length < 20) {
      analysis.issues.push('Subject line too short - may appear unprofessional');
      analysis.score -= 10;
    } else if (subject.length > 60) {
      analysis.issues.push('Subject line too long - may be truncated on mobile');
      analysis.score -= 15;
    } else {
      analysis.strengths.push('Subject line length is optimal');
    }

    const capsPercentage = (subject.match(/[A-Z]/g) || []).length / subject.length;
    if (capsPercentage > 0.3) {
      analysis.issues.push('Too much capitalization in subject line');
      analysis.score -= 20;
    }

    const wordCount = body.split(/\s+/).length;
    if (wordCount < 50) {
      analysis.issues.push('Email body too short - may lack value');
      analysis.score -= 10;
    } else if (wordCount > 500) {
      analysis.issues.push('Email body too long - may reduce engagement');
      analysis.score -= 5;
    } else {
      analysis.strengths.push('Email length is appropriate');
    }

    const linkCount = (body.match(/https?:\/\/\S+/g) || []).length;
    if (linkCount > 5) {
      analysis.issues.push('Too many links - may trigger spam filters');
      analysis.score -= 15;
    } else if (linkCount === 0 && body.includes('click here')) {
      analysis.issues.push('Contains "click here" but no actual links');
      analysis.score -= 5;
    }

    const exclamationCount = (subject + body).split('!').length - 1;
    if (exclamationCount > 3) {
      analysis.issues.push('Too many exclamation marks - appears overly promotional');
      analysis.score -= 10;
    }

    return analysis;
  }

  /**
   * Analyze personalization level
   */
  private analyzePersonalization(subject: string, body: string, coachProfile?: any): any {
    const analysis: EmailAnalysis = {
      score: 50, // Base score
      issues: [],
      strengths: []
    };

    const fullText = subject + ' ' + body;

    // Check for personalization elements
    if (fullText.includes('{{') || fullText.includes('[NAME]')) {
      analysis.strengths.push('Uses personalization tokens');
      analysis.score += 20;
    }

    // Generic greetings
    if (body.includes('Dear Sir/Madam') || body.includes('To Whom It May Concern')) {
      analysis.issues.push('Uses generic greeting - reduces personalization');
      analysis.score -= 15;
    }

    // Coach-specific personalization
    if (coachProfile) {
      const commonPhrases = coachProfile.personality.commonPhrases || [];
      const hasCoachVoice = commonPhrases.some((phrase: string) => fullText.toLowerCase().includes(phrase.toLowerCase()));

      if (hasCoachVoice) {
        analysis.strengths.push('Reflects coach\'s authentic voice');
        analysis.score += 15;
      } else {
        analysis.issues.push('Doesn\'t reflect coach\'s typical communication style');
        analysis.score -= 10;
      }
    }

    // Template-like language
    const templatePhrases = ['this email is being sent', 'you are receiving this', 'unsubscribe'];
    const hasTemplateLanguage = templatePhrases.some(phrase => fullText.toLowerCase().includes(phrase));

    if (hasTemplateLanguage) {
      analysis.issues.push('Contains template-like language that reduces personal feel');
      analysis.score -= 10;
    }

    return analysis;
  }

  /**
   * Calculate overall deliverability score
   */
  private calculateOverallScore(
    aiAnalysis: any,
    spamTriggers: SpamTrigger[],
    structuralAnalysis: any,
    personalizationAnalysis: any
  ): number {
    let score = 85; // Start with a good base score

    // AI analysis impact
    if (aiAnalysis.deliverabilityFactors) {
      const spamLikelihood = aiAnalysis.deliverabilityFactors.spamLikelihood || 0;
      score -= spamLikelihood * 0.3; // Reduce score based on a spam likelihood

      const personalization = aiAnalysis.deliverabilityFactors.personalization || 50;
      score += (personalization - 50) * 0.2; // Bonus for good personalization
    }

    // Spam triggers impact
    spamTriggers.forEach(trigger => {
      switch (trigger.severity) {
        case 'high': score -= 25; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 3; break;
      }
    });

    // Structural issues
    score = score * (structuralAnalysis.score / 100);

    // Personalization bonus/penalty
    const personalizationImpact = (personalizationAnalysis.score - 50) * 0.3;
    score += personalizationImpact;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generate specific recommendations
   */
  private generateRecommendations(
    aiAnalysis: any,
    spamTriggers: SpamTrigger[],
    structuralAnalysis: any,
    personalizationAnalysis: any,
    coachProfile?: any
  ): DeliverabilityRecommendation[] {
    const recommendations: DeliverabilityRecommendation[] = [];

    // High-priority spam triggers
    spamTriggers.filter(t => t.severity === 'high').forEach(trigger => {
      recommendations.push({
        category: 'content',
        priority: 'high',
        issue: `Contains spam trigger: "${trigger.trigger}"`,
        suggestion: trigger.fix,
        impact: 'Removing this could significantly improve inbox placement'
      });
    });

    // Subject line issues
    if (aiAnalysis.subjectAnalysis?.score < 70) {
      recommendations.push({
        category: 'subject',
        priority: 'high',
        issue: 'Subject line needs improvement',
        suggestion: 'Make it more specific, personal, and value-focused',
        impact: 'Better subject lines improve open rates and inbox placement'
      });
    }

    // Structural issues
    structuralAnalysis.issues.forEach((issue: string) => {
      recommendations.push({
        category: 'structure',
        priority: 'medium',
        issue,
        suggestion: 'Review email formatting and length guidelines',
        impact: 'Proper structure improves readability and deliverability'
      });
    });

    // Personalization issues
    if (personalizationAnalysis.score < 60) {
      recommendations.push({
        category: 'personalization',
        priority: 'medium',
        issue: 'Email lacks personalization',
        suggestion: 'Add recipient name, reference their specific interests, or include personal touches',
        impact: 'Personalized emails are more likely to reach the primary inbox'
      });
    }

    // Coach-specific recommendations
    if (coachProfile && !personalizationAnalysis.strengths.includes('Reflects coach\'s authentic voice')) {
      recommendations.push({
        category: 'personalization',
        priority: 'high',
        issue: 'Email doesn\'t reflect your authentic coaching voice',
        suggestion: `Incorporate your typical ${coachProfile.personality.communicationStyle} communication style and common phrases`,
        impact: 'Authentic voice builds trust and improves engagement'
      });
    }

    // Gmail-specific recommendations
    if (aiAnalysis.gmailSpecific?.categoryPrediction === 'promotions') {
      recommendations.push({
        category: 'content',
        priority: 'high',
        issue: 'Email likely to be categorized as promotional',
        suggestion: 'Reduce sales language, add more personal value, and focus on relationship building',
        impact: 'Moving from Promotions to Primary inbox dramatically increases engagement'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate improved versions of the email
   */
  private async generateImprovements(request: AnalyzeEmailRequest, coachProfile?: any): Promise<EmailImprovement[]> {
    try {
      const prompt = `
Improve this email for better Gmail Primary inbox delivery:

ORIGINAL SUBJECT: ${request.subject}
ORIGINAL BODY:
${request.body}

${coachProfile ? `
COACH CONTEXT:
- Style: ${coachProfile.personality.communicationStyle}
- Industry: ${coachProfile.businessContext.industry}
- Typical phrases: ${coachProfile.personality.commonPhrases?.slice(0, 3).join(', ')}
` : ''}

Please provide 3 improvements in JSON format:
{
  "improvements": [
    {
      "type": "subject",
      "original": "original subject",
      "improved": "improved subject",
      "reason": "why this is better"
    },
    {
      "type": "opening",
      "original": "original opening paragraph",
      "improved": "improved opening paragraph",
      "reason": "why this is better"
    },
    {
      "type": "overall",
      "original": "key issue with overall email",
      "improved": "overall improvement suggestion",
      "reason": "why this helps deliverability"
    }
  ]
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email deliverability consultant specializing in coaching industry communications.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_completion_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      return response.improvements || [];

    } catch (error) {
      this.logger.error('Error generating email improvements:', error);
      return [];
    }
  }

  /**
   * Quick deliverability check (lighter version for real-time use)
   */
  async quickDeliverabilityCheck(subject: string, body: string): Promise<{ score: number; issues: string[] }> {
    const spamTriggers = this.detectSpamTriggers(subject, body);
    const structuralAnalysis = this.analyzeEmailStructure(subject, body);

    let score = 85;
    const issues: string[] = [];

    // Apply quick penalties
    spamTriggers.forEach(trigger => {
      switch (trigger.severity) {
        case 'high': score -= 25; issues.push(trigger.explanation); break;
        case 'medium': score -= 10; break;
        case 'low': score -= 3; break;
      }
    });

    score = score * (structuralAnalysis.score / 100);
    issues.push(...structuralAnalysis.issues);

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      issues: issues.slice(0, 5) // Limit to top 5 issues
    };
  }
}
