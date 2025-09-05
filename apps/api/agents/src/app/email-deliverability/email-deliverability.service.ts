import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import {
  AnalyzeEmailRequest,
  DeliverabilityAnalysis,
  DeliverabilityRecommendation,
  EmailImprovement,
  SpamTrigger
} from '@nlc-ai/api-types';

@Injectable()
export class EmailDeliverabilityService {
  private readonly logger = new Logger(EmailDeliverabilityService.name);
  private openai: OpenAI;

  private readonly spamTriggers = {
    high: [
      'free money', 'make money fast', 'guaranteed income', 'get rich quick',
      'urgent action required', 'act now', 'limited time', 'expires today',
      'no obligation', 'risk free', '100% free', 'call now'
    ],
    medium: [
      'free', 'discount', 'save money', 'special offer', 'promotion',
      'urgent', 'important', 'asap', 'immediate', 'priority'
    ],
    low: [
      'opportunity', 'deal', 'offer', 'bonus', 'gift',
      'exclusive', 'limited', 'special', 'unique'
    ]
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('agents.openai.apiKey'),
    });
  }

  async analyzeEmailDeliverability(request: AnalyzeEmailRequest): Promise<DeliverabilityAnalysis> {
    try {
      // Create analysis record
      const analysis = await this.prisma.deliverabilityAnalysis.create({
        data: {
          coachID: request.coachID,
          subject: request.subject,
          body: request.body,
          recipientType: request.recipientType || 'general',
          status: 'processing',
        },
      });

      const [
        aiAnalysis,
        spamTriggers,
        structuralAnalysis,
        personalizationScore
      ] = await Promise.all([
        this.getAIDeliverabilityAnalysis(request),
        this.detectSpamTriggers(request.subject, request.body),
        this.analyzeEmailStructure(request.subject, request.body),
        this.analyzePersonalization(request.subject, request.body)
      ]);

      const overallScore = this.calculateOverallScore(
        aiAnalysis,
        spamTriggers,
        structuralAnalysis,
        personalizationScore
      );

      const recommendations = this.generateRecommendations(
        aiAnalysis,
        spamTriggers,
        structuralAnalysis,
        personalizationScore
      );

      const improvements = await this.generateImprovements(request);

      // Update analysis record
      await this.prisma.deliverabilityAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: 'completed',
          overallScore,
          primaryInboxProbability: Math.max(0, overallScore - 15),
          spamTriggers: JSON.stringify(spamTriggers),
          recommendations: JSON.stringify(recommendations),
          improvements: JSON.stringify(improvements),
          completedAt: new Date(),
        },
      });

      return {
        overallScore,
        primaryInboxProbability: Math.max(0, overallScore - 15),
        recommendations,
        spamTriggers,
        improvements
      };

    } catch (error) {
      this.logger.error('Error analyzing email deliverability:', error);
      throw new Error('Failed to analyze email deliverability');
    }
  }

  async analyzeGeneratedResponse(coachID: string, responseID: string) {
    const response = await this.prisma.generatedEmailResponse.findFirst({
      where: { id: responseID, coachID }
    });

    if (!response) {
      throw new NotFoundException('Generated response not found');
    }

    const request: AnalyzeEmailRequest = {
      subject: response.subject,
      body: response.body,
      coachID,
      recipientType: 'client',
    };

    const analysis = await this.analyzeEmailDeliverability(request);

    // Store analysis reference in response
    await this.prisma.generatedEmailResponse.update({
      where: { id: responseID },
      data: {
        deliverabilityScore: analysis.overallScore,
        metadata: JSON.stringify({
          ...JSON.parse(response.metadata as any || '{}'),
          deliverabilityAnalysis: analysis,
          analyzedAt: new Date(),
        }),
      },
    });

    return {
      responseID,
      ...analysis,
    };
  }

  async quickDeliverabilityCheck(subject: string, body: string) {
    const spamTriggers = this.detectSpamTriggers(subject, body);
    const structuralAnalysis = this.analyzeEmailStructure(subject, body);

    let score = 85;
    const issues: string[] = [];

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
      issues: issues.slice(0, 5)
    };
  }

  private async getAIDeliverabilityAnalysis(request: AnalyzeEmailRequest) {
    const prompt = `
Analyze this email for Gmail Primary inbox deliverability:

SUBJECT: ${request.subject}
BODY: ${request.body}
RECIPIENT TYPE: ${request.recipientType || 'general'}

Return JSON with deliverability analysis focusing on:
{
  "subjectAnalysis": { "score": 0-100, "issues": [], "strengths": [] },
  "contentAnalysis": { "score": 0-100, "readability": 0-100, "engagement": 0-100 },
  "deliverabilityFactors": { "spamLikelihood": 0-100, "personalization": 0-100 },
  "gmailSpecific": { "primaryInboxLikelihood": 0-100, "categoryPrediction": "primary|promotions" }
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an email deliverability expert specializing in Gmail filtering.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_completion_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('Error in AI deliverability analysis:', error);
      return {};
    }
  }

  private detectSpamTriggers(subject: string, body: string): SpamTrigger[] {
    const fullText = (subject + ' ' + body).toLowerCase();
    const triggers: SpamTrigger[] = [];

    this.spamTriggers.high.forEach(trigger => {
      if (fullText.includes(trigger.toLowerCase())) {
        triggers.push({
          trigger,
          severity: 'high',
          explanation: `"${trigger}" is a high-risk spam phrase`,
          fix: `Remove or replace "${trigger}" with professional language`
        });
      }
    });

    this.spamTriggers.medium.forEach(trigger => {
      if (fullText.includes(trigger.toLowerCase())) {
        triggers.push({
          trigger,
          severity: 'medium',
          explanation: `"${trigger}" can trigger spam filters`,
          fix: `Use "${trigger}" more sparingly or in context`
        });
      }
    });

    return triggers;
  }

  private analyzeEmailStructure(subject: string, body: string) {
    let score = 100;
    const issues: string[] = [];

    if (subject.length < 20) {
      issues.push('Subject line too short');
      score -= 10;
    } else if (subject.length > 60) {
      issues.push('Subject line too long');
      score -= 15;
    }

    const wordCount = body.split(/\s+/).length;
    if (wordCount < 50) {
      issues.push('Email body too short');
      score -= 10;
    } else if (wordCount > 500) {
      issues.push('Email body too long');
      score -= 5;
    }

    const linkCount = (body.match(/https?:\/\/\S+/g) || []).length;
    if (linkCount > 5) {
      issues.push('Too many links');
      score -= 15;
    }

    return { score: Math.max(0, score), issues };
  }

  private analyzePersonalization(subject: string, body: string): number {
    let score = 50;

    if (subject.includes('{{') || body.includes('{{')) score += 20;
    if (body.includes('Dear Sir/Madam')) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  private calculateOverallScore(
    aiAnalysis: any,
    spamTriggers: SpamTrigger[],
    structuralAnalysis: any,
    personalizationScore: number
  ): number {
    let score = 85;

    // AI analysis impact
    if (aiAnalysis.deliverabilityFactors) {
      const spamLikelihood = aiAnalysis.deliverabilityFactors.spamLikelihood || 0;
      score -= spamLikelihood * 0.3;

      const personalization = aiAnalysis.deliverabilityFactors.personalization || 50;
      score += (personalization - 50) * 0.2;
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

    // Personalization impact
    const personalizationImpact = (personalizationScore - 50) * 0.3;
    score += personalizationImpact;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private generateRecommendations(
    aiAnalysis: any,
    spamTriggers: SpamTrigger[],
    structuralAnalysis: any,
    personalizationScore: number
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
    if (personalizationScore < 60) {
      recommendations.push({
        category: 'personalization',
        priority: 'medium',
        issue: 'Email lacks personalization',
        suggestion: 'Add recipient name, reference specific interests, or include personal touches',
        impact: 'Personalized emails are more likely to reach the primary inbox'
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

  private async generateImprovements(request: AnalyzeEmailRequest): Promise<EmailImprovement[]> {
    try {
      const prompt = `
Improve this email for better Gmail Primary inbox delivery:

ORIGINAL SUBJECT: ${request.subject}
ORIGINAL BODY: ${request.body}

Provide 3 improvements in JSON format:
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
          { role: 'user', content: prompt }
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
}
