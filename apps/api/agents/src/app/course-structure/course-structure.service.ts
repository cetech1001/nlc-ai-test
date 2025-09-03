import {Injectable, InternalServerErrorException, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@nlc-ai/api-database';
import {OutboxService} from '@nlc-ai/api-messaging';
import {OpenAI} from 'openai';
import {
  CourseStructureGeneratedEvent,
  CourseStructureRequest,
  CourseStructureSuggestion,
  SuggestedChapter,
  SuggestedLesson,
} from '@nlc-ai/api-types';

@Injectable()
export class CourseStructureService {
  private readonly logger = new Logger(CourseStructureService.name);
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('agents.openai.apiKey'),
    });
  }

  async generateCourseStructure(
    request: CourseStructureRequest,
    coachID?: string,
  ): Promise<CourseStructureSuggestion> {
    this.logger.log('Generating course structure suggestions', {
      descriptionLength: request.description.length,
      targetAudience: request.targetAudience,
      difficultyLevel: request.difficultyLevel,
      coachID,
    });

    const startTime = Date.now();

    try {
      const interaction = await this.prisma.aiInteraction.create({
        data: {
          coachID: coachID || 'system',
          agentID: await this.getOrCreateCourseStructureAgent(),
          interactionType: 'course_structure_generation',
          inputData: {
            description: request.description,
            targetAudience: request.targetAudience,
            difficultyLevel: request.difficultyLevel,
            estimatedDuration: request.estimatedDuration,
            preferredFormat: request.preferredFormat,
            budget: request.budget,
            specialRequirements: request.specialRequirements,
          },
          outputData: {},
          status: 'processing',
        },
      });

      const courseStructure = await this.generateWithOpenAI(request);
      const processingTime = Date.now() - startTime;

      const confidenceScore = this.calculateConfidenceScore(courseStructure, request);

      await this.prisma.aiInteraction.update({
        where: { id: interaction.id },
        data: {
          outputData: JSON.stringify(courseStructure),
          status: 'completed',
          processingTimeMs: processingTime,
          confidenceScore,
          tokensUsed: this.estimateTokensUsed(request, courseStructure),
        },
      });

      await this.updateAgentStats(await this.getOrCreateCourseStructureAgent());

      await this.outboxService.saveAndPublishEvent<CourseStructureGeneratedEvent>(
        {
          eventType: 'course.structure.generated',
          schemaVersion: 1,
          payload: {
            interactionID: interaction.id,
            userID: coachID || 'system',
            userType: 'coach',
            courseTitle: courseStructure.courseTitle,
            chaptersCount: courseStructure.suggestedChapters.length,
            totalLessons: courseStructure.suggestedChapters.reduce(
              (acc, chapter) => acc + chapter.lessons.length,
              0,
            ),
            estimatedTotalHours: courseStructure.estimatedTotalHours,
            targetAudience: courseStructure.targetAudience,
            generatedAt: new Date().toISOString(),
          },
        },
        'course.structure.generated',
      );

      this.logger.log('Course structure generated successfully', {
        interactionID: interaction.id,
        courseTitle: courseStructure.courseTitle,
        chaptersCount: courseStructure.suggestedChapters.length,
        processingTimeMs: processingTime,
        confidenceScore,
      });

      return courseStructure;
    } catch (error) {
      this.logger.error('Error generating course structure', error);
      throw new InternalServerErrorException('Failed to generate course structure');
    }
  }

  private async getOrCreateCourseStructureAgent(): Promise<string> {
    let agent = await this.prisma.aiAgent.findFirst({
      where: { name: 'Course Structure Generator' },
    });

    if (!agent) {
      agent = await this.prisma.aiAgent.create({
        data: {
          name: 'Course Structure Generator',
          type: 'course_planning',
          description: 'AI agent specialized in generating comprehensive course structures with chapters and lessons',
          defaultConfig: {
            model: 'gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 3000,
            systemPrompt: this.getSystemPrompt(),
          },
          isActive: true,
        },
      });
    }

    return agent.id;
  }

  private async generateWithOpenAI(
    request: CourseStructureRequest,
  ): Promise<CourseStructureSuggestion> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: this.buildUserPrompt(request),
          },
        ],
        temperature: 0.7,
        max_completion_tokens: 3000,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error('Empty response from OpenAI');
      }

      const parsedResponse = JSON.parse(responseContent);
      return this.validateAndFormatResponse(parsedResponse, request);
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      throw new InternalServerErrorException('Failed to generate course structure with AI');
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert course designer and educational consultant with over 15 years of experience creating successful online courses. Your role is to analyze course descriptions and create comprehensive, well-structured course outlines that maximize student learning and engagement.

Key Responsibilities:
1. Break down complex topics into logical, progressive chapters
2. Create detailed lessons within each chapter with clear learning objectives
3. Suggest appropriate content types and delivery formats
4. Provide realistic time estimates based on content complexity
5. Consider the target audience and adjust difficulty accordingly
6. Recommend pricing strategies based on value and market standards
7. Suggest marketing and delivery strategies for course success

Educational Principles:
- Follow adult learning principles (andragogy)
- Ensure clear learning progression from basic to advanced concepts
- Include practical applications and real-world examples
- Balance theoretical knowledge with hands-on practice
- Consider different learning styles (visual, auditory, kinesthetic)
- Build in assessment and feedback mechanisms

Course Structure Standards:
- Chapters should have 3-8 lessons each (optimal: 4-6)
- Lessons should be 15-45 minutes each (optimal: 20-30 minutes)
- Include variety in lesson types (video, text, interactive, practical)
- Ensure each chapter builds upon previous knowledge
- End chapters with practical applications or assessments

Always respond in valid JSON format with the complete course structure including chapters, lessons, learning objectives, and business recommendations.`;
  }

  private buildUserPrompt(request: CourseStructureRequest): string {
    return `Please create a comprehensive course structure for the following course:

COURSE DESCRIPTION:
${request.description}

ADDITIONAL REQUIREMENTS:
- Target Audience: ${request.targetAudience || 'General audience seeking to learn this topic'}
- Difficulty Level: ${request.difficultyLevel || 'Beginner to Intermediate'}
- Estimated Duration: ${request.estimatedDuration || 'Flexible, optimize for learning outcomes'}
- Preferred Format: ${request.preferredFormat || 'Mixed (video, text, interactive)'}
- Budget Considerations: ${request.budget || 'Standard pricing'}
- Special Requirements: ${request.specialRequirements?.join(', ') || 'None specified'}

Please respond with a JSON object containing:

{
  "courseTitle": "Compelling, benefit-driven course title",
  "courseDescription": "2-3 sentence description highlighting value proposition",
  "recommendedDifficulty": "beginner|intermediate|advanced",
  "suggestedCategory": "Most appropriate category",
  "estimatedTotalHours": "Total course duration in hours (number)",
  "targetAudience": "Refined description of ideal students",
  "learningOutcomes": ["What students will achieve after completing the course"],
  "prerequisites": ["Required knowledge or skills before starting"],
  "suggestedChapters": [
    {
      "title": "Chapter title that clearly indicates the focus",
      "description": "What this chapter covers and why it's important",
      "orderIndex": "0-based index (number)",
      "estimatedDurationHours": "Chapter duration in hours (number)",
      "learningGoals": ["What students will learn in this chapter"],
      "lessons": [
        {
          "title": "Specific, action-oriented lesson title",
          "description": "What this lesson covers",
          "lessonType": "video|text|interactive|practical|assessment",
          "estimatedMinutes": "Lesson duration in minutes (number)",
          "orderIndex": "0-based index within chapter (number)",
          "learningObjectives": ["Specific skills or knowledge gained"],
          "contentOutline": ["Key points to cover in this lesson"],
          "resources": ["Additional resources or materials needed"],
          "assessmentSuggestions": ["How to test understanding"]
        }
      ],
      "prerequisites": ["What students need to know before this chapter"],
      "outcomes": ["What students will be able to do after this chapter"]
    }
  ],
  "recommendations": ["Course development and delivery recommendations"],
  "pricingGuidance": {
    "suggestedPriceRange": "Price range based on value and market",
    "pricingRationale": "Why this price range is appropriate",
    "monetizationTips": ["Additional ways to monetize the course"]
  },
  "marketingTips": ["How to effectively market this course"],
  "deliveryRecommendations": ["Best practices for course delivery and student engagement"]
}

Ensure the course structure is pedagogically sound, engaging, and provides clear value to students.`;
  }

  private validateAndFormatResponse(
    response: any,
    request: CourseStructureRequest,
  ): CourseStructureSuggestion {
    return {
      courseTitle: response.courseTitle || this.generateDefaultTitle(request.description),
      courseDescription: response.courseDescription || 'A comprehensive course to master this topic.',
      recommendedDifficulty: response.recommendedDifficulty || 'intermediate',
      suggestedCategory: response.suggestedCategory || 'General',
      estimatedTotalHours: Number(response.estimatedTotalHours) || 10,
      targetAudience: response.targetAudience || request.targetAudience || 'Individuals looking to learn this topic',
      learningOutcomes: Array.isArray(response.learningOutcomes) ? response.learningOutcomes : [
        'Understand fundamental concepts',
        'Apply knowledge practically',
        'Build confidence in the subject'
      ],
      prerequisites: Array.isArray(response.prerequisites) ? response.prerequisites : [
        'Basic computer literacy',
        'Willingness to learn'
      ],
      suggestedChapters: this.validateChapters(response.suggestedChapters || []),
      recommendations: Array.isArray(response.recommendations) ? response.recommendations : [
        'Include interactive elements',
        'Provide practical exercises',
        'Create a supportive community'
      ],
      pricingGuidance: response.pricingGuidance || {
        suggestedPriceRange: '$97 - $297',
        pricingRationale: 'Based on content depth and value provided',
        monetizationTips: ['Consider tiered pricing', 'Offer payment plans']
      },
      marketingTips: response.marketingTips || [
        'Focus on transformation and outcomes',
        'Use social proof and testimonials',
        'Create valuable free content to attract leads'
      ],
      deliveryRecommendations: response.deliveryRecommendations || [
        'Drip content to improve completion rates',
        'Provide regular feedback and support',
        'Create milestone celebrations'
      ],
    };
  }

  private validateChapters(chapters: any[]): SuggestedChapter[] {
    return chapters.map((chapter, index) => ({
      title: chapter.title || `Chapter ${index + 1}`,
      description: chapter.description || 'Chapter content and learning materials',
      orderIndex: Number(chapter.orderIndex) || index,
      estimatedDurationHours: Number(chapter.estimatedDurationHours) || 2,
      learningGoals: Array.isArray(chapter.learningGoals) ? chapter.learningGoals : ['Learn key concepts'],
      lessons: this.validateLessons(chapter.lessons || []),
      prerequisites: chapter.prerequisites || [],
      outcomes: chapter.outcomes || [],
    }));
  }

  private validateLessons(lessons: any[]): SuggestedLesson[] {
    return lessons.map((lesson, index) => ({
      title: lesson.title || `Lesson ${index + 1}`,
      description: lesson.description || 'Lesson content and materials',
      lessonType: lesson.lessonType || 'video',
      estimatedMinutes: Number(lesson.estimatedMinutes) || 30,
      orderIndex: Number(lesson.orderIndex) || index,
      learningObjectives: Array.isArray(lesson.learningObjectives) ? lesson.learningObjectives : ['Complete lesson objectives'],
      contentOutline: Array.isArray(lesson.contentOutline) ? lesson.contentOutline : ['Key concepts', 'Examples', 'Practice'],
      resources: lesson.resources || [],
      assessmentSuggestions: lesson.assessmentSuggestions || [],
    }));
  }

  private generateDefaultTitle(description: string): string {
    const firstSentence = description.split('.')[0];
    const keywords = firstSentence.toLowerCase().match(/\b(learn|master|complete|ultimate|comprehensive)\b/g);

    if (keywords) {
      return `Complete Guide to ${this.extractMainTopic(description)}`;
    }

    return `Master ${this.extractMainTopic(description)}`;
  }

  private extractMainTopic(description: string): string {
    const commonTopics = [
      'digital marketing', 'marketing', 'programming', 'web development',
      'business', 'entrepreneurship', 'design', 'photography', 'fitness',
      'cooking', 'music', 'art', 'writing', 'finance', 'investing'
    ];

    const lowerDesc = description.toLowerCase();

    for (const topic of commonTopics) {
      if (lowerDesc.includes(topic)) {
        return topic.split(' ').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
    }

    const words = description.split(' ').slice(0, 10);
    const meaningfulWords = words.filter(word =>
      word.length > 3 && !/^(the|and|for|with|this|that|will|can|how|you|your)$/i.test(word)
    );

    return meaningfulWords.slice(0, 2).join(' ') || 'Your Subject';
  }

  private calculateConfidenceScore(
    courseStructure: CourseStructureSuggestion,
    request: CourseStructureRequest,
  ): number {
    let score = 0.5;

    if (courseStructure.suggestedChapters.length >= 3) score += 0.1;
    if (courseStructure.suggestedChapters.length <= 8) score += 0.1;

    const totalLessons = courseStructure.suggestedChapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
    if (totalLessons >= 10 && totalLessons <= 50) score += 0.1;

    if (courseStructure.learningOutcomes.length >= 3) score += 0.05;
    if (courseStructure.prerequisites.length > 0) score += 0.05;
    if (courseStructure.pricingGuidance) score += 0.05;

    if (request.targetAudience && courseStructure.targetAudience.toLowerCase().includes(request.targetAudience.toLowerCase())) {
      score += 0.1;
    }
    if (request.difficultyLevel && courseStructure.recommendedDifficulty === request.difficultyLevel.toLowerCase()) {
      score += 0.05;
    }

    return Math.min(score, 1.0);
  }

  private estimateTokensUsed(request: CourseStructureRequest, response: CourseStructureSuggestion): number {
    const inputText = JSON.stringify(request);
    const outputText = JSON.stringify(response);

    return Math.ceil((inputText.length + outputText.length) / 4);
  }

  private async updateAgentStats(agentID: string): Promise<void> {
    try {
      await this.prisma.aiAgent.update({
        where: { id: agentID },
        data: {
          totalRequests: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn('Failed to update agent stats:', error);
    }
  }
}
