import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
// import { OutboxService } from '@nlc-ai/api-messaging';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
/*import {
  ContentSuggestionGeneratedEvent,
} from '@nlc-ai/api-types';*/
import { CoachReplicaService } from "../coach-replica/coach-replica.service";
import { UserType } from "@nlc-ai/types";

interface PlatformAnalytics {
  platform: string;
  bestPostingTimes: string[];
  avgEngagement: number;
  topPerformingContentTypes: string[];
}

interface ContentSuggestionResponse {
  title: string;
  script: {
    hook: string;
    mainContent: string;
    callToAction: string;
  };
  estimatedEngagement: {
    min: number;
    max: number;
  };
  recommendedPlatforms: string[];
  bestPostingTimes: string[];
  contentCategory: string;
  confidence: number;
  reasoning: string;
}

@Injectable()
export class ContentSuggestionService {
  private readonly logger = new Logger(ContentSuggestionService.name);
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    // private readonly outbox: OutboxService,
    private readonly configService: ConfigService,
    private readonly coachReplicaService: CoachReplicaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('agents.openai.apiKey'),
    });
  }

  async generateContentSuggestion(
    userID: string,
    userType: UserType,
    idea: string,
    contentType?: string,
    targetPlatforms?: string[],
    customInstructions?: string
  ) {
    this.logger.log(`Generating content suggestion for user ${userID} with idea: ${idea}`);

    if (!idea || idea.trim().length < 10) {
      throw new BadRequestException('Content idea must be at least 10 characters long');
    }

    const interaction = await this.prisma.aiInteraction.create({
      data: {
        userID,
        userType,
        agentID: await this.getOrCreateContentSuggestionAgent(),
        interactionType: 'content_suggestion',
        inputData: {
          idea: idea.trim(),
          contentType,
          targetPlatforms,
          customInstructions,
        },
        outputData: {},
        status: 'processing',
      },
    });

    try {
      // Get coach knowledge profile for context
      const coachProfile = await this.coachReplicaService.getCoachKnowledgeProfile(userID);

      // Get platform analytics
      const platformAnalytics = await this.getPlatformAnalytics(userID);

      // Get top performing content for reference
      const topContent = await this.getTopPerformingContent(userID);

      const context = this.buildSuggestionContext(
        idea,
        coachProfile,
        platformAnalytics,
        topContent,
        contentType,
        targetPlatforms,
        customInstructions
      );

      const aiResponse = await this.generateWithOpenAI(context, coachProfile);

      const contentSuggestion = await this.prisma.contentSuggestion.create({
        data: {
          coachID: userID,
          title: aiResponse.title,
          contentType: contentType || 'post',
          platform: aiResponse.recommendedPlatforms.join(', '),
          description: JSON.stringify({
            originalIdea: idea.trim(),
            hook: aiResponse.script.hook,
            mainContent: aiResponse.script.mainContent,
            callToAction: aiResponse.script.callToAction,
            estimatedEngagement: aiResponse.estimatedEngagement,
            bestPostingTimes: aiResponse.bestPostingTimes,
            recommendedPlatforms: aiResponse.recommendedPlatforms,
          }),
          reasoning: aiResponse.reasoning,
          confidenceScore: aiResponse.confidence || 0.8,
          status: 'pending',
          trendData: JSON.stringify({
            contentType,
            targetPlatforms,
            customInstructions,
            coachStyle: coachProfile.personality.communicationStyle,
          }),
        },
      });

      await this.prisma.aiInteraction.update({
        where: { id: interaction.id },
        data: {
          status: 'completed',
          outputData: JSON.stringify(aiResponse),
          processingTimeMs: Date.now() - (interaction.createdAt?.getTime() || Date.now()),
          confidenceScore: aiResponse.confidence || 0.8,
        },
      });

      /*await this.outbox.saveAndPublishEvent<ContentSuggestionGeneratedEvent>(
        {
          eventType: 'content.suggestion.generated',
          schemaVersion: 1,
          payload: {
            suggestionID: contentSuggestion.id,
            userID,
            userType,
            title: aiResponse.title,
            contentCategory: aiResponse.contentCategory,
            confidence: aiResponse.confidence || 0.8,
            generatedAt: new Date().toISOString(),
          },
        },
        'content.suggestion.generated'
      );*/

      return {
        id: contentSuggestion.id,
        title: contentSuggestion.title,
        originalIdea: idea.trim(),
        script: {
          hook: aiResponse.script.hook,
          mainContent: aiResponse.script.mainContent,
          callToAction: aiResponse.script.callToAction,
        },
        contentCategory: aiResponse.contentCategory,
        recommendedPlatforms: aiResponse.recommendedPlatforms,
        bestPostingTimes: aiResponse.bestPostingTimes,
        estimatedEngagement: {
          min: aiResponse.estimatedEngagement.min,
          max: aiResponse.estimatedEngagement.max,
        },
        confidence: contentSuggestion.confidenceScore,
        status: contentSuggestion.status,
        createdAt: contentSuggestion.createdAt,
      };

    } catch (error: any) {
      await this.prisma.aiInteraction.update({
        where: { id: interaction.id },
        data: {
          status: 'failed',
          outputData: JSON.stringify({ error: error.message }),
        },
      });

      throw new BadRequestException(`Failed to generate content suggestion: ${error.message}`);
    }
  }

  async regenerateContentSuggestion(userID: string, userType: UserType, suggestionID: string, customInstructions?: string) {
    const existingSuggestion = await this.prisma.contentSuggestion.findFirst({
      where: { id: suggestionID, coachID: userID },
    });

    if (!existingSuggestion) {
      throw new NotFoundException('Content suggestion not found');
    }

    const parsedDescription = existingSuggestion.description ? JSON.parse(existingSuggestion.description) : {};
    const originalIdea = parsedDescription.originalIdea || '';

    // Mark existing suggestion as superseded
    await this.prisma.contentSuggestion.update({
      where: { id: suggestionID },
      data: { status: 'cancelled' }
    });

    // Generate new suggestion with original idea
    return this.generateContentSuggestion(
      userID,
      userType,
      originalIdea,
      existingSuggestion.contentType,
      parsedDescription.recommendedPlatforms,
      customInstructions
    );
  }

  async getAllSuggestions(userID: string) {
    return this.prisma.contentSuggestion.findMany({
      where: {
        coachID: userID,
        status: { in: ['pending', 'completed'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getSuggestion(userID: string, suggestionID: string) {
    const suggestion = await this.prisma.contentSuggestion.findFirst({
      where: { id: suggestionID, coachID: userID },
    });

    if (!suggestion) {
      throw new NotFoundException('Content suggestion not found');
    }

    const parsedDescription = suggestion.description ? JSON.parse(suggestion.description) : {};

    return {
      id: suggestion.id,
      title: suggestion.title,
      originalIdea: parsedDescription.originalIdea || '',
      script: {
        hook: parsedDescription.hook || '',
        mainContent: parsedDescription.mainContent || '',
        callToAction: parsedDescription.callToAction || '',
      },
      contentCategory: suggestion.contentType,
      recommendedPlatforms: parsedDescription.recommendedPlatforms || [],
      bestPostingTimes: parsedDescription.bestPostingTimes || [],
      estimatedEngagement: parsedDescription.estimatedEngagement || { min: 0, max: 0 },
      confidence: suggestion.confidenceScore,
      status: suggestion.status,
      createdAt: suggestion.createdAt,
      updatedAt: suggestion.updatedAt,
      // @ts-ignore
      metadata: suggestion.trendData ? JSON.parse(suggestion.trendData) : null,
    };
  }

  async updateSuggestion(userID: string, suggestionID: string, updates: {
    title?: string;
    script?: string;
    hook?: string;
    mainContent?: string;
    callToAction?: string;
  }) {
    const suggestion = await this.prisma.contentSuggestion.findFirst({
      where: { id: suggestionID, coachID: userID }
    });

    if (!suggestion) {
      throw new NotFoundException('Content suggestion not found');
    }

    const currentDescription = suggestion.description ? JSON.parse(suggestion.description) : {};

    // Update the script parts in the description
    const updatedDescription = {
      ...currentDescription,
      hook: updates.hook || currentDescription.hook,
      mainContent: updates.mainContent || currentDescription.mainContent,
      callToAction: updates.callToAction || currentDescription.callToAction,
    };

    return this.prisma.contentSuggestion.update({
      where: { id: suggestionID },
      data: {
        title: updates.title || suggestion.title,
        description: JSON.stringify(updatedDescription),
        status: 'completed',
        updatedAt: new Date(),
      }
    });
  }

  async getTopPerformingContent(userID: string) {
    return this.prisma.contentPiece.findMany({
      where: { coachID: userID },
      orderBy: [
        { engagementRate: 'desc' },
        { views: 'desc' },
      ],
      take: 10,
      select: {
        title: true,
        description: true,
        contentType: true,
        platform: true,
        topicCategories: true,
        engagementRate: true,
        views: true,
        likes: true,
        comments: true,
        publishedAt: true,
      }
    });
  }

  async analyzeContentTrends(userID: string) {
    const recentContent = await this.prisma.contentPiece.findMany({
      where: {
        coachID: userID,
        publishedAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 100,
    });

    // Analyze trends by category, platform, and performance
    const categoryTrends = this.analyzeCategoryTrends(recentContent);
    const platformTrends = this.analyzePlatformTrends(recentContent);
    const timingTrends = this.analyzeTimingTrends(recentContent);

    return {
      categoryTrends,
      platformTrends,
      timingTrends,
      totalContentAnalyzed: recentContent.length,
      analysisDate: new Date(),
    };
  }

  private async getOrCreateContentSuggestionAgent(): Promise<string> {
    let agent = await this.prisma.aiAgent.findFirst({
      where: { name: 'Content Suggestion Agent' },
    });

    if (!agent) {
      agent = await this.prisma.aiAgent.create({
        data: {
          name: 'Content Suggestion Agent',
          type: 'content_suggestion',
          description: 'AI agent for generating content suggestions with scripts and engagement predictions',
          defaultConfig: {
            model: 'gpt-4o-mini',
            temperature: 0.8,
            maxTokens: 2000,
          },
          isActive: true,
        },
      });
    }

    return agent.id;
  }

  private async getPlatformAnalytics(userID: string): Promise<PlatformAnalytics[]> {
    const contentPieces = await this.prisma.contentPiece.findMany({
      where: { coachID: userID },
      orderBy: { publishedAt: 'desc' },
      take: 200,
    });

    const platformMap = new Map<string, any>();

    contentPieces.forEach(piece => {
      // @ts-ignore
      if (!platformMap.has(piece.platform)) {
        // @ts-ignore
        platformMap.set(piece.platform, {
          platform: piece.platform,
          engagements: [],
          contentTypes: [],
          publishTimes: [],
        });
      }

      // @ts-ignore
      const platformData = platformMap.get(piece.platform);
      platformData.engagements.push(piece.engagementRate || 0);
      platformData.contentTypes.push(piece.contentType);

      if (piece.publishedAt) {
        const hour = piece.publishedAt.getHours();
        platformData.publishTimes.push(`${hour}:00`);
      }
    });

    return Array.from(platformMap.values()).map(data => ({
      platform: data.platform,
      bestPostingTimes: this.getTopTimes(data.publishTimes),
      avgEngagement: data.engagements.reduce((sum: number, eng: number) => sum + eng, 0) / data.engagements.length,
      topPerformingContentTypes: this.getTopContentTypes(data.contentTypes),
    }));
  }

  private buildSuggestionContext(
    idea: string,
    coachProfile: any,
    platformAnalytics: PlatformAnalytics[],
    topContent: any[],
    contentType?: string,
    targetPlatforms?: string[],
    customInstructions?: string
  ): string {
    return `
COACH PROFILE CONTEXT:
- Communication Style: ${coachProfile.personality.communicationStyle}
- Industry: ${coachProfile.businessContext.industry}
- Target Audience: ${coachProfile.businessContext.targetAudience.join(', ')}
- Expertise Areas: ${coachProfile.businessContext.expertise.join(', ')}
- Common Phrases: ${coachProfile.personality.commonPhrases.join(', ')}
- Preferred Tone: ${coachProfile.personality.responseLength}

PLATFORM ANALYTICS:
${platformAnalytics.map(platform => `
- ${platform.platform}:
  * Avg Engagement: ${platform.avgEngagement.toFixed(1)}%
  * Best Posting Times: ${platform.bestPostingTimes.join(', ')}
  * Top Content Types: ${platform.topPerformingContentTypes.join(', ')}
`).join('')}

TOP PERFORMING CONTENT REFERENCE:
${topContent.slice(0, 5).map((content, index) => `
${index + 1}. ${content.title}
   - Platform: ${content.platform}
   - Type: ${content.contentType}
   - Engagement: ${content.engagementRate}%
   - Topics: ${content.topicCategories.join(', ')}
`).join('')}

CONTENT IDEA TO DEVELOP:
"${idea}"

${contentType ? `Requested Content Type: ${contentType}` : ''}
${targetPlatforms ? `Target Platforms: ${targetPlatforms.join(', ')}` : ''}
${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Please generate a comprehensive content suggestion that includes:
1. An engaging title that matches the coach's style
2. A complete script with hook, main content, and call-to-action
3. Estimated engagement range based on historical performance
4. Recommended platforms based on analytics
5. Best posting times based on platform data
6. Content category classification
`;
  }

  private async generateWithOpenAI(context: string, coachProfile: any): Promise<ContentSuggestionResponse> {
    const systemPrompt = `You are an AI content strategist specializing in creating engaging content for ${coachProfile?.businessContext?.industry || 'coaching'} professionals.

Your role is to transform content ideas into comprehensive, actionable content suggestions that match the coach's authentic voice and maximize engagement potential.

COACH'S COMMUNICATION STYLE:
- Style: ${coachProfile?.personality?.communicationStyle || 'professional'}
- Industry: ${coachProfile?.businessContext?.industry || 'coaching'}
- Target Audience: ${coachProfile?.businessContext?.targetAudience?.join(', ') || 'professionals'}
- Expertise: ${coachProfile?.businessContext?.expertise?.join(', ') || 'general coaching'}

SCRIPT STRUCTURE REQUIREMENTS:
- Hook: 1-2 sentences that grab attention immediately
- Main Content: 3-5 paragraphs of valuable, actionable content
- Call to Action: Clear, specific next step for the audience

Respond in JSON format with:
{
  "title": "Engaging title that matches coach's style",
  "script": {
    "hook": "Attention-grabbing opening",
    "mainContent": "Main valuable content in paragraph form",
    "callToAction": "Clear call to action"
  },
  "estimatedEngagement": {
    "min": number,
    "max": number
  },
  "recommendedPlatforms": ["platform1", "platform2"],
  "bestPostingTimes": ["time1", "time2"],
  "contentCategory": "category",
  "confidence": 0.0-1.0,
  "reasoning": "Why this approach will work for this coach"
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context },
        ],
        temperature: 0.8,
        max_completion_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      throw new Error('Failed to generate content suggestion with AI');
    }
  }

  private analyzeCategoryTrends(content: any[]) {
    const categoryMap = new Map();

    content.forEach(piece => {
      piece.topicCategories.forEach((category: string) => {
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            count: 0,
            totalEngagement: 0,
            avgViews: 0,
            totalViews: 0
          });
        }
        const data = categoryMap.get(category);
        data.count++;
        data.totalEngagement += piece.engagementRate || 0;
        data.totalViews += piece.views || 0;
      });
    });

    return Array.from(categoryMap.entries()).map(([category, data]: [string, any]) => ({
      category,
      frequency: data.count,
      avgEngagement: data.totalEngagement / data.count,
      avgViews: data.totalViews / data.count,
    })).sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  private analyzePlatformTrends(content: any[]) {
    const platformMap = new Map();

    content.forEach(piece => {
      if (!platformMap.has(piece.platform)) {
        platformMap.set(piece.platform, {
          count: 0,
          totalEngagement: 0,
          totalViews: 0
        });
      }
      const data = platformMap.get(piece.platform);
      data.count++;
      data.totalEngagement += piece.engagementRate || 0;
      data.totalViews += piece.views || 0;
    });

    return Array.from(platformMap.entries()).map(([platform, data]: [string, any]) => ({
      platform,
      frequency: data.count,
      avgEngagement: data.totalEngagement / data.count,
      avgViews: data.totalViews / data.count,
    })).sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  private analyzeTimingTrends(content: any[]) {
    const hourMap = new Map();

    content.forEach(piece => {
      if (piece.publishedAt) {
        const hour = piece.publishedAt.getHours();
        if (!hourMap.has(hour)) {
          hourMap.set(hour, {
            count: 0,
            totalEngagement: 0
          });
        }
        const data = hourMap.get(hour);
        data.count++;
        data.totalEngagement += piece.engagementRate || 0;
      }
    });

    return Array.from(hourMap.entries()).map(([hour, data]: [number, any]) => ({
      hour: `${hour}:00`,
      frequency: data.count,
      avgEngagement: data.totalEngagement / data.count,
    })).sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  private getTopTimes(times: string[]): string[] {
    const timeMap = new Map();
    times.forEach(time => {
      timeMap.set(time, (timeMap.get(time) || 0) + 1);
    });

    return Array.from(timeMap.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([time]) => time);
  }

  private getTopContentTypes(types: string[]): string[] {
    const typeMap = new Map();
    types.forEach(type => {
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    return Array.from(typeMap.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }
}
