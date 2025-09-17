import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {OpenAI} from 'openai';
import {
  CoachBusinessContext,
  CoachClientInteractionStyle,
  CoachContentPatterns,
  CoachKnowledgeProfile,
  CoachPersonality,
  CoachReplicaRequest,
  CoachReplicaResponse,
  CoachWritingStyle, ContentPiece, Integration
} from '@nlc-ai/types';
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class CoachReplicaService {
  private readonly logger = new Logger(CoachReplicaService.name);
  private openai: OpenAI;
  private readonly knowledgeCache = new Map<string, CoachKnowledgeProfile>();

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Main method to get coach knowledge profile
   * Uses caching to avoid regenerating frequently
   */
  async getCoachKnowledgeProfile(coachID: string, forceRefresh = false): Promise<CoachKnowledgeProfile> {
    const cacheKey = `coach_${coachID}`;

    if (!forceRefresh && this.knowledgeCache.has(cacheKey)) {
      const cached = this.knowledgeCache.get(cacheKey)!;
      if (Date.now() - cached.lastUpdated.getTime() < 3600000) {
        return cached;
      }
    }

    this.logger.log(`Building knowledge profile for coach ${coachID}`);
    const profile = await this.buildCoachKnowledgeProfile(coachID);

    this.knowledgeCache.set(cacheKey, profile);

    await this.storeKnowledgeProfile(profile);

    return profile;
  }

  /**
   * Generate AI response using coach's knowledge profile
   */
  async generateCoachResponse(request: CoachReplicaRequest): Promise<CoachReplicaResponse> {
    const profile = await this.getCoachKnowledgeProfile(request.coachID);

    const prompt = this.buildResponsePrompt(profile, request);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(profile),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_completion_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');

      return {
        response: response.response || '',
        confidence: response.confidence || 0.8,
        reasoning: response.reasoning || '',
        suggestedTone: response.suggestedTone || profile.personality.communicationStyle,
        alternativeResponses: response.alternatives || [],
      };
    } catch (error) {
      this.logger.error('Error generating coach response:', error);
      return {
        response: 'I apologize, but I\'m having trouble generating a response right now. Please try again.',
        confidence: 0.1,
        reasoning: 'AI service temporarily unavailable',
        suggestedTone: 'professional',
      };
    }
  }

  /**
   * Build comprehensive coach knowledge profile
   */
  private async buildCoachKnowledgeProfile(coachID: string): Promise<CoachKnowledgeProfile> {
    const [
      coach,
      emailMessages,
      contentPieces,
      clients,
      integrations,
    ] = await Promise.all([
      this.fetchCoachBasicInfo(coachID),
      this.fetchEmailPatterns(coachID),
      this.fetchContentPatterns(coachID),
      this.fetchClientInteractions(coachID),
      this.fetchIntegrationData(coachID),
    ]);

    // Analyze patterns using AI
    const analysisPrompt = this.buildAnalysisPrompt(coach, emailMessages, contentPieces, clients);
    const aiAnalysis = await this.analyzeCoachPatterns(analysisPrompt);

    // Build the knowledge profile
    return {
      coachID,
      personality: this.extractPersonality(aiAnalysis, emailMessages),
      businessContext: this.extractBusinessContext(coach, contentPieces, integrations),
      writingStyle: this.extractWritingStyle(aiAnalysis, emailMessages),
      contentPatterns: this.extractContentPatterns(contentPieces, integrations),
      clientInteractionStyle: this.extractClientInteractionStyle(aiAnalysis, emailMessages, clients),
      lastUpdated: new Date(),
      confidenceScore: this.calculateConfidenceScore(coach, emailMessages, contentPieces, clients),
      dataSourcesUsed: this.getDataSources(coach, emailMessages, contentPieces, clients, integrations)
    };
  }

  /**
   * Fetch coach basic information
   */
  private async fetchCoachBasicInfo(coachID: string) {
    return this.prisma.coach.findUnique({
      where: { id: coachID },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        businessName: true,
        bio: true,
        websiteUrl: true,
        timezone: true,
        phone: true,
      }
    });
  }

  /**
   * Fetch email communication patterns
   */
  private async fetchEmailPatterns(coachID: string) {
    return this.prisma.emailMessage.findMany({
      where: {
        emailThread: {
          coachID: coachID
        },
        from: {
          in: await this.getCoachEmails(coachID)
        }
      },
      select: {
        subject: true,
        text: true,
        html: true,
        sentAt: true,
        to: true,
      },
      orderBy: { sentAt: 'desc' },
      take: 50 // Last 50 emails for pattern analysis
    });
  }

  /**
   * Fetch content creation patterns
   */
  private async fetchContentPatterns(coachID: string): Promise<Partial<ContentPiece>[]> {
    return this.prisma.contentPiece.findMany({
      where: { coachID },
      select: {
        title: true,
        description: true,
        contentType: true,
        platform: true,
        tags: true,
        views: true,
        likes: true,
        comments: true,
        engagementRate: true,
        topicCategories: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 100
    });
  }

  /**
   * Fetch client interaction patterns
   */
  private async fetchClientInteractions(coachID: string) {
    return this.prisma.client.findMany({
      where: {
        clientCoaches: {
          some: {
            coachID
          }
        }
      },
      select: {
        // status: true,
        source: true,
        tags: true,
        lastInteractionAt: true,
        totalInteractions: true,
        engagementScore: true,
        createdAt: true,
      },
      take: 200
    });
  }

  /**
   * Fetch integration data for business context
   */
  private async fetchIntegrationData(coachID: string) {
    return this.prisma.integration.findMany({
      where: { userID: coachID, isActive: true },
      select: {
        platformName: true,
        integrationType: true,
        config: true,
        lastSyncAt: true,
      }
    });
  }

  /**
   * Fetch email history for tone analysis
   */
  /*private async fetchEmailHistory(coachID: string) {
    return this.prisma.emailMessage.findMany({
      where: {
        emailThread: {
          userID: coachID,
        }
      },
      select: {
        subject: true,
        text: true,
        from: true,
        status: true,
        sentAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 30
    });
  }*/

  /**
   * Get all email addresses associated with a coach
   */
  private async getCoachEmails(coachID: string): Promise<string[]> {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true }
    });

    const emailAccounts = await this.prisma.emailAccount.findMany({
      where: { userID: coachID },
      select: { emailAddress: true }
    });

    return [coach?.email, ...emailAccounts.map(acc => acc.emailAddress)].filter(Boolean) as string[];
  }

  /**
   * Use AI to analyze coach communication patterns
   */
  private async analyzeCoachPatterns(prompt: string): Promise<any> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert communication analyst. Analyze the provided coach data and return a JSON object with insights about their communication style, personality, and patterns.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_completion_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('Error analyzing coach patterns:', error);
      return {};
    }
  }

  /**
   * Build analysis prompt for AI
   */
  private buildAnalysisPrompt(coach: any, emails: any[], content: any[], clients: any[]): string {
    return `
Analyze this coach's communication and business patterns:

COACH INFO:
- Name: ${coach?.firstName} ${coach?.lastName}
- Business: ${coach?.businessName || 'Not specified'}
- Bio: ${coach?.bio || 'Not provided'}
- Website: ${coach?.websiteUrl || 'Not provided'}

EMAIL SAMPLES (${emails.length} messages):
${emails.slice(0, 10).map(email => `
- Subject: ${email.subject}
- Content snippet: ${(email.text || email.html || '').substring(0, 200)}...
`).join('')}

CONTENT PIECES (${content.length} pieces):
${content.slice(0, 10).map(piece => `
- Title: ${piece.title}
- Type: ${piece.contentType}
- Platform: ${piece.platform}
- Topics: ${piece.topicCategories.join(', ')}
- Engagement: ${piece.engagementRate}%
`).join('')}

CLIENTS (${clients.length} total):
- Average engagement: ${clients.reduce((sum, c) => sum + (c.engagementScore || 0), 0) / clients.length}
- Common sources: ${[...new Set(clients.map(c => c.source))].join(', ')}
- Common tags: ${[...new Set(clients.flatMap(c => c.tags))].slice(0, 10).join(', ')}

Please analyze and return JSON with:
{
  "communicationStyle": "formal|casual|friendly|professional|enthusiastic",
  "toneKeywords": ["keyword1", "keyword2"],
  "commonPhrases": ["phrase1", "phrase2"],
  "responseLength": "brief|moderate|detailed",
  "formalityLevel": 1-10,
  "empathyLevel": 1-10,
  "expertise": ["area1", "area2"],
  "targetAudience": ["audience1", "audience2"],
  "writingPatterns": {
    "avgSentenceLength": number,
    "useOfEmojis": "none|minimal|moderate|frequent",
    "preferredGreetings": ["greeting1"],
    "preferredClosings": ["closing1"]
  }
}
`;
  }

  /**
   * Extract personality traits from AI analysis
   */
  private extractPersonality(aiAnalysis: any, emails: any[]): CoachPersonality {
    return {
      communicationStyle: aiAnalysis.communicationStyle || 'professional',
      responseLength: aiAnalysis.responseLength || 'moderate',
      toneKeywords: aiAnalysis.toneKeywords || [],
      commonPhrases: aiAnalysis.commonPhrases || [],
      preferredGreetings: aiAnalysis.writingPatterns?.preferredGreetings || ['Hi', 'Hello'],
      preferredClosings: aiAnalysis.writingPatterns?.preferredClosings || ['Best regards', 'Thank you'],
      signatureElements: this.extractSignatureElements(emails),
    };
  }

  /**
   * Extract business context
   */
  private extractBusinessContext(coach: any, content: any[], integrations: any[]): CoachBusinessContext {
    const allTopics = content.flatMap(c => c.topicCategories);
    const topicFrequency = allTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      industry: this.inferIndustry(coach, content),
      targetAudience: this.inferTargetAudience(content, integrations),
      services: this.inferServices(coach, content),
      expertise: Object.keys(topicFrequency).sort((a, b) => topicFrequency[b] - topicFrequency[a]).slice(0, 5),
      priceRange: 'mid-range', // This could be inferred from transaction data later
      businessValues: this.inferBusinessValues(coach, content),
      uniqueSellingPoints: this.inferUSPs(coach, content),
    };
  }

  /**
   * Extract writing style patterns
   */
  private extractWritingStyle(aiAnalysis: any, emails: any[]): CoachWritingStyle {
    const textSamples = emails.map(e => e.bodyText || e.bodyHtml || '').filter(Boolean);

    return {
      avgSentenceLength: aiAnalysis.writingPatterns?.avgSentenceLength || this.calculateAvgSentenceLength(textSamples),
      paragraphStyle: this.inferParagraphStyle(textSamples),
      useOfEmojis: aiAnalysis.writingPatterns?.useOfEmojis || 'minimal',
      formalityLevel: aiAnalysis.formalityLevel || 7,
      persuasivenessLevel: aiAnalysis.persuasivenessLevel || 6,
      empathyMarkers: this.extractEmpathyMarkers(textSamples),
    };
  }

  /**
   * Extract content patterns
   */
  private extractContentPatterns(content: Partial<ContentPiece>[], integrations: Partial<Integration>[]): CoachContentPatterns {
    const topicFrequency = content.reduce((acc, piece) => {
      piece.topicCategories?.forEach((topic: string) => {
        if (!acc[topic]) {
          acc[topic] = { count: 0, totalEngagement: 0 };
        }
        acc[topic].count++;
        acc[topic].totalEngagement += Number(piece.engagementRate) || 0;
      });
      return acc;
    }, {} as Record<string, { count: number; totalEngagement: number }>);

    const popularTopics = Object.entries(topicFrequency)
      .map(([topic, data]) => ({
        topic,
        frequency: data.count,
        engagementRate: data.totalEngagement / data.count,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    return {
      popularTopics,
      contentTypes: this.analyzeContentTypes(content),
      postingSchedule: this.analyzePostingSchedule(content),
    };
  }

  /**
   * Extract client interaction style
   */
  private extractClientInteractionStyle(aiAnalysis: any, emails: any[], clients: any[]): CoachClientInteractionStyle {
    return {
      responseTimePatterns: {
        averageResponseHours: 4, // This could be calculated from email timestamps
        preferredResponseTimes: ['9:00 AM', '2:00 PM', '6:00 PM'],
      },
      supportStyle: this.inferSupportStyle(aiAnalysis, emails),
      followUpFrequency: this.inferFollowUpFrequency(emails),
      personalizedApproach: this.detectPersonalizationLevel(emails) > 0.7,
    };
  }

  // Helper methods for data extraction and analysis
  private extractSignatureElements(emails: any[]): string[] {
    // Extract common signature elements from emails
    const signatures = [...emails]
      .map(email => {
        const content = email.bodyText || email.body || '';
        // Look for signature patterns (lines after "Best regards", "Thanks", etc.)
        const signatureMatch = content.match(/(?:best regards|thanks|sincerely|cheers|warmly)[\s\S]*$/i);
        return signatureMatch ? signatureMatch[0] : '';
      })
      .filter(Boolean);

    // Extract common elements
    return Array.from(new Set(signatures)).slice(0, 3);
  }

  private inferIndustry(coach: any, content: any[]): string {
    // Analyze topics and bio to infer industry
    const topics = content.flatMap(c => c.topicCategories).join(' ').toLowerCase();

    if (topics.includes('fitness') || topics.includes('health')) return 'Health & Fitness';
    if (topics.includes('business') || topics.includes('entrepreneur')) return 'Business Coaching';
    if (topics.includes('life') || topics.includes('personal')) return 'Life Coaching';
    if (topics.includes('career')) return 'Career Coaching';

    return 'General Coaching';
  }

  private inferTargetAudience(content: any[], integrations: any[]): string[] {
    // Analyze content and platform data to infer target audience
    const audiences = ['professionals', 'entrepreneurs', 'individuals seeking growth'];
    return audiences;
  }

  private inferServices(coach: any, content: any[]): string[] {
    // Extract api from bio and content
    const services = ['1-on-1 Coaching', 'Group Programs', 'Online Courses'];
    return services;
  }

  private inferBusinessValues(coach: any, content: any[]): string[] {
    return ['Growth', 'Authenticity', 'Results-driven', 'Empowerment'];
  }

  private inferUSPs(coach: any, content: any[]): string[] {
    return ['Personalized approach', 'Proven methodology', 'Long-term results'];
  }

  private calculateAvgSentenceLength(textSamples: string[]): number {
    if (textSamples.length === 0) return 15;

    const sentences = textSamples.join(' ').split(/[.!?]+/).filter(s => s.trim().length > 0);
    const totalWords = sentences.reduce((sum, sentence) => sum + sentence.trim().split(/\s+/).length, 0);

    return Math.round(totalWords / sentences.length);
  }

  private inferParagraphStyle(textSamples: string[]): 'short' | 'medium' | 'long' {
    // Analyze paragraph lengths to determine style
    return 'medium';
  }

  private extractEmpathyMarkers(textSamples: string[]): string[] {
    const empathyWords = ['understand', 'feel', 'empathize', 'relate', 'support', 'here for you'];
    const foundMarkers = new Set<string>();

    textSamples.forEach(text => {
      empathyWords.forEach(word => {
        if (text.toLowerCase().includes(word)) {
          foundMarkers.add(word);
        }
      });
    });

    return Array.from(foundMarkers);
  }

  private analyzeContentTypes(content: Partial<ContentPiece>[]) {
    const typeCount = content.reduce((acc, piece) => {
      if (piece.contentType) {
        acc[piece.contentType] = (acc[piece.contentType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([type, count]) => ({
      type,
      performance: count, // Could be enhanced with engagement metrics
    }));
  }

  private analyzePostingSchedule(content: any[]) {
    return {
      bestTimes: ['9:00 AM', '3:00 PM', '7:00 PM'],
      frequency: 'daily',
    };
  }

  private inferSupportStyle(aiAnalysis: any, emails: any[]): 'direct' | 'nurturing' | 'motivational' | 'analytical' {
    return aiAnalysis.empathyLevel > 7 ? 'nurturing' : 'direct';
  }

  private inferFollowUpFrequency(emails: any[]): 'high' | 'medium' | 'low' {
    return 'medium';
  }

  private detectPersonalizationLevel(emails: any[]): number {
    // Analyze how personalized the emails are (0-1 scale)
    return 0.8;
  }

  private calculateConfidenceScore(coach: any, emails: any[], content: any[], clients: any[]): number {
    let score = 0;

    // Base info available
    if (coach?.bio) score += 20;
    if (coach?.businessName) score += 10;

    // Email data
    if (emails.length > 10) score += 30;
    else if (emails.length > 5) score += 20;
    else if (emails.length > 0) score += 10;

    // Content data
    if (content.length > 20) score += 25;
    else if (content.length > 10) score += 15;
    else if (content.length > 0) score += 5;

    // Client data
    if (clients.length > 50) score += 15;
    else if (clients.length > 20) score += 10;
    else if (clients.length > 0) score += 5;

    return Math.min(score, 100);
  }

  private getDataSources(coach: any, emails: any[], content: any[], clients: any[], integrations: any[]): string[] {
    const sources = [];

    if (coach?.bio || coach?.businessName) sources.push('coach_profile');
    if (emails.length > 0) sources.push('email_history');
    if (content.length > 0) sources.push('content_pieces');
    if (clients.length > 0) sources.push('client_interactions');
    if (integrations.length > 0) sources.push('platform_integrations');

    return sources;
  }

  /**
   * Build system prompt for AI responses
   */
  private buildSystemPrompt(profile: CoachKnowledgeProfile): string {
    return `You are an AI assistant that mimics ${profile.businessContext.industry} coach's communication style and expertise.

PERSONALITY:
- Communication Style: ${profile.personality.communicationStyle}
- Response Length: ${profile.personality.responseLength}
- Common Phrases: ${profile.personality.commonPhrases.join(', ')}
- Preferred Greetings: ${profile.personality.preferredGreetings.join(', ')}
- Preferred Closings: ${profile.personality.preferredClosings.join(', ')}

BUSINESS CONTEXT:
- Industry: ${profile.businessContext.industry}
- Target Audience: ${profile.businessContext.targetAudience.join(', ')}
- Services: ${profile.businessContext.services.join(', ')}
- Expertise: ${profile.businessContext.expertise.join(', ')}

WRITING STYLE:
- Formality Level: ${profile.writingStyle.formalityLevel}/10
- Average Sentence Length: ${profile.writingStyle.avgSentenceLength} words
- Use of Emojis: ${profile.writingStyle.useOfEmojis}
- Empathy Markers: ${profile.writingStyle.empathyMarkers.join(', ')}

Always respond in character, maintaining the coach's authentic voice and expertise. Be helpful, professional, and consistent with their established communication patterns.`;
  }

  /**
   * Build response prompt based on request type
   */
  private buildResponsePrompt(profile: CoachKnowledgeProfile, request: CoachReplicaRequest): string {
    let basePrompt = `Context: ${request.context}\n\nRequest Type: ${request.requestType}\n\n`;

    switch (request.requestType) {
      case 'email_response':
        basePrompt += `Generate an email response that matches the coach's communication style. Consider their typical response length (${profile.personality.responseLength}) and communication style (${profile.personality.communicationStyle}).`;
        break;

      case 'content_creation':
        basePrompt += `Create content suggestions based on the coach's popular topics: ${profile.contentPatterns.popularTopics.slice(0, 5).map(t => t.topic).join(', ')}. Match their typical content style and audience (${profile.businessContext.targetAudience.join(', ')}).`;
        break;

      case 'lead_follow_up':
        basePrompt += `Generate a follow-up message for a lead. Use the coach's typical follow-up approach (${profile.clientInteractionStyle.supportStyle}) and maintain their communication style.`;
        break;

      case 'client_retention':
        basePrompt += `Create a client retention message. Focus on the coach's expertise areas (${profile.businessContext.expertise.join(', ')}) and use their supportive communication style.`;
        break;

      case 'general_query':
        basePrompt += `Answer this query as the coach would, drawing from their expertise and maintaining their authentic voice.`;
        break;
    }

    basePrompt += `\n\nPlease respond in JSON format with:
{
  "response": "The actual response text",
  "confidence": 0.0-1.0,
  "reasoning": "Why this response matches the coach's style",
  "suggestedTone": "The tone used",
  "alternatives": ["alternative response 1", "alternative response 2"]
}`;

    return basePrompt;
  }

  /**
   * Store knowledge profile in database for persistence
   */
  private async storeKnowledgeProfile(profile: CoachKnowledgeProfile): Promise<void> {
    try {
      // Find or create coach AI agent for knowledge storage
      let coachAgent = await this.prisma.coachAiAgent.findFirst({
        where: {
          coachID: profile.coachID,
          aiAgent: {
            type: 'coach_replica'
          }
        },
        include: {
          aiAgent: true
        }
      });

      if (!coachAgent) {
        const aiAgent = await this.prisma.aiAgent.upsert({
          where: {
            name: 'Coach Replica Agent'
          },
          update: {},
          create: {
            name: 'Coach Replica Agent',
            type: 'coach_replica',
            description: 'AI agent that replicates coach\'s communication style and knowledge',
            isActive: true,
            defaultConfig: {}
          }
        });

        await this.prisma.coachAiAgent.create({
          data: {
            coachID: profile.coachID,
            agentID: aiAgent.id,
            isEnabled: true,
            customConfig: JSON.stringify(profile),
            lastUsedAt: new Date()
          },
          include: {
            aiAgent: true
          }
        });
      } else {
        await this.prisma.coachAiAgent.update({
          where: { id: coachAgent.id },
          data: {
            customConfig: JSON.stringify(profile),
            lastUsedAt: new Date()
          }
        });
      }

      this.logger.log(`Stored knowledge profile for coach ${profile.coachID}`);
    } catch (error) {
      this.logger.error('Error storing knowledge profile:', error);
    }
  }

  /**
   * Clear cache for a specific coach (useful after significant data changes)
   */
  clearCoachCache(coachID: string): void {
    const cacheKey = `coach_${coachID}`;
    this.knowledgeCache.delete(cacheKey);
    this.logger.log(`Cleared cache for coach ${coachID}`);
  }

  /**
   * Get knowledge profile stats for debugging
   */
  async getKnowledgeProfileStats(coachID: string): Promise<any> {
    const profile = await this.getCoachKnowledgeProfile(coachID);

    return {
      coachID,
      confidenceScore: profile.confidenceScore,
      dataSourcesUsed: profile.dataSourcesUsed,
      lastUpdated: profile.lastUpdated,
      personalityTraits: {
        communicationStyle: profile.personality.communicationStyle,
        responseLength: profile.personality.responseLength,
        formalityLevel: profile.writingStyle.formalityLevel
      },
      businessContext: {
        industry: profile.businessContext.industry,
        expertiseAreas: profile.businessContext.expertise.length,
        topTopics: profile.contentPatterns.popularTopics.slice(0, 3).map(t => t.topic)
      }
    };
  }

  /**
   * Test the coach replica with a sample query
   */
  async testCoachReplica(coachID: string, testQuery: string): Promise<CoachReplicaResponse> {
    const request: CoachReplicaRequest = {
      coachID,
      context: testQuery,
      requestType: 'general_query'
    };

    return this.generateCoachResponse(request);
  }
}
