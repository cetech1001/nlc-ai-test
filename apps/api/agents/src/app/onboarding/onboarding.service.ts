import {Injectable, Logger} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {CoachingProfile, OnboardingData, ScenarioAnswer} from '@nlc-ai/types';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Save onboarding data to database WITHOUT marking as complete
   */
  async saveOnboardingData(coachID: string, data: OnboardingData) {
    this.logger.log(`Saving onboarding data for coach ${coachID}`);

    // Store scenario answers
    for (const scenario of data.scenarios) {
      await this.prisma.coachScenarioAnswer.upsert({
        where: {
          coachID_questionID: {
            coachID,
            questionID: scenario.questionID,
          },
        },
        create: {
          coachID,
          questionID: scenario.questionID,
          category: scenario.category,
          question: scenario.question,
          answer: scenario.answer,
        },
        update: {
          answer: scenario.answer,
          category: scenario.category,
          question: scenario.question,
        },
      });
    }

    // Store document references
    for (const doc of data.documents) {
      if (doc.openaiFileID) {
        await this.prisma.coachKnowledgeFile.updateMany({
          where: {
            coachID,
            openaiFileID: doc.openaiFileID,
          },
          data: {
            category: doc.category,
          },
        });
      }
    }

    // Store connection status
    for (const connection of data.connections) {
      await this.prisma.coachConnection.upsert({
        where: {
          coachID_connectionID: {
            coachID,
            connectionID: connection.id,
          },
        },
        create: {
          coachID,
          connectionID: connection.id,
          connectionName: connection.name,
          connectionType: connection.type,
          status: connection.status,
        },
        update: {
          status: connection.status,
        },
      });
    }

    // Update progress WITHOUT marking as complete (no completedAt)
    await this.prisma.coachOnboarding.upsert({
      where: { coachID },
      create: {
        coachID,
        scenariosCompleted: data.scenarios.length,
        documentsUploaded: data.documents.length,
        connectionsLinked: data.connections.filter(c => c.status === 'connected').length,
      },
      update: {
        scenariosCompleted: data.scenarios.length,
        documentsUploaded: data.documents.length,
        connectionsLinked: data.connections.filter(c => c.status === 'connected').length,
      },
    });

    return { success: true, message: 'Onboarding progress saved successfully' };
  }

  /**
   * Mark onboarding as complete (called only when Launch button is clicked)
   */
  async markOnboardingComplete(coachID: string) {
    await this.prisma.coachOnboarding.update({
      where: { coachID },
      data: {
        completedAt: new Date(),
      },
    });
  }

  /**
   * Get all onboarding data for prefilling
   */
  async getOnboardingData(coachID: string): Promise<OnboardingData> {
    const [scenarios, documents, connections] = await Promise.all([
      this.prisma.coachScenarioAnswer.findMany({
        where: { coachID },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.coachKnowledgeFile.findMany({
        where: { coachID },
        select: {
          id: true,
          openaiFileID: true,
          filename: true,
          category: true,
        },
      }),
      this.prisma.coachConnection.findMany({
        where: { coachID },
      }),
    ]);

    return {
      scenarios: scenarios.map(s => ({
        questionID: s.questionID,
        category: s.category,
        question: s.question,
        answer: s.answer,
      })),
      documents: documents.map(d => ({
        id: d.id,
        name: d.filename,
        openaiFileID: d.openaiFileID,
        category: d.category || 'general',
      })),
      connections: connections.map(c => ({
        id: c.connectionID,
        name: c.connectionName,
        type: c.connectionType as 'essential' | 'social',
        status: c.status as 'connected' | 'disconnected',
      })),
    };
  }

  // ... rest of the methods remain unchanged ...
  async generateCoachingProfile(coachID: string): Promise<CoachingProfile> {
    const scenarios = await this.prisma.coachScenarioAnswer.findMany({
      where: { coachID },
    });

    return {
      communicationStyle: {
        tone: this.extractTone(scenarios),
        commonPhrases: this.extractPhrases(scenarios),
        preferredGreetings: this.extractGreetings(scenarios),
        preferredClosings: this.extractClosings(scenarios),
      },
      methodology: {
        framework: this.extractFramework(scenarios),
        approach: this.extractApproach(scenarios),
        uniqueValueProposition: this.extractUVP(scenarios),
      },
      targetAudience: {
        idealClient: this.extractIdealClient(scenarios),
        worksBestWith: this.extractBestFit(scenarios),
      },
      businessContext: {
        services: this.extractServices(scenarios),
        pricingApproach: this.extractPricing(scenarios),
      },
      behavioralPatterns: {
        problemSolving: this.extractPattern(scenarios, 'Problem Solving'),
        accountability: this.extractPattern(scenarios, 'Accountability'),
        celebration: this.extractPattern(scenarios, 'Client Success'),
        boundaries: this.extractPattern(scenarios, 'Professional Boundaries'),
        difficultConversations: this.extractPattern(scenarios, 'Difficult Conversations'),
      },
    };
  }

  async buildAIInstructions(coachID: string): Promise<string> {
    const scenarios = await this.prisma.coachScenarioAnswer.findMany({
      where: { coachID },
      orderBy: { createdAt: 'asc' },
    });

    const profile = await this.generateCoachingProfile(coachID);

    return `You are an AI assistant representing a professional coach. Your responses must authentically mirror this coach's unique style, approach, and personality.

## COMMUNICATION STYLE
- Tone: ${profile.communicationStyle.tone}
- Common phrases: ${profile.communicationStyle.commonPhrases.join(', ')}
- Typical greetings: ${profile.communicationStyle.preferredGreetings.join(', ')}
- Typical closings: ${profile.communicationStyle.preferredClosings.join(', ')}

## COACHING METHODOLOGY
${profile.methodology.framework}

Approach: ${profile.methodology.approach}

What makes this coach unique: ${profile.methodology.uniqueValueProposition}

## TARGET AUDIENCE
Ideal client: ${profile.targetAudience.idealClient}
Works best with: ${profile.targetAudience.worksBestWith.join(', ')}

## BUSINESS CONTEXT
Services offered: ${profile.businessContext.services.join(', ')}
Pricing approach: ${profile.businessContext.pricingApproach}

## BEHAVIORAL PATTERNS

**Problem Solving:**
${profile.behavioralPatterns.problemSolving}

**Accountability:**
${profile.behavioralPatterns.accountability}

**Celebrating Success:**
${profile.behavioralPatterns.celebration}

**Setting Boundaries:**
${profile.behavioralPatterns.boundaries}

**Difficult Conversations:**
${profile.behavioralPatterns.difficultConversations}

## SPECIFIC SCENARIO EXAMPLES

${scenarios.map((s) => `**${s.category}: ${s.question}**\n${s.answer}`).join('\n\n')}

## RESPONSE GUIDELINES
1. Always respond as if YOU ARE this coach - use first person ("I", "my approach")
2. Match the coach's tone, language patterns, and communication style exactly
3. Reference the uploaded documents for specific methodologies and frameworks
4. When answering questions, think: "How would this coach specifically handle this?"
5. Use the coach's typical phrases and expressions naturally in conversation
6. Maintain consistency with the examples provided above
7. If asked about something not covered in your training, acknowledge it honestly while staying in character

## IMPORTANT
- Never break character or mention that you're an AI
- Don't make up information not provided in your training
- Stay true to the coach's documented values and approach
- When uncertain, ask clarifying questions the way this coach would`;
  }

  // Helper methods remain unchanged
  private extractTone(scenarios: ScenarioAnswer[]): string {
    const commStyle = scenarios.find((s) => s.questionID === 'communication_preferences');
    if (commStyle?.answer) {
      if (commStyle.answer.toLowerCase().includes('casual')) return 'casual yet professional';
      if (commStyle.answer.toLowerCase().includes('formal')) return 'formal and professional';
      return 'professional and supportive';
    }
    return 'professional and supportive';
  }

  private extractPhrases(scenarios: ScenarioAnswer[]): string[] {
    const commStyle = scenarios.find((s) => s.questionID === 'communication_preferences');
    if (commStyle?.answer) {
      const phrases = commStyle.answer.match(/"([^"]+)"/g);
      return phrases ? phrases.map((p) => p.replace(/"/g, '')) : [];
    }
    return [];
  }

  private extractGreetings(scenarios: ScenarioAnswer[]): string[] {
    const intro = scenarios.find((s) => s.questionID === 'client_introduction');
    if (intro?.answer) {
      const greetings = intro.answer.match(/^(Hi|Hello|Hey|Greetings)[^,.\n]*/i);
      return greetings ? [greetings[0]] : ['Hi'];
    }
    return ['Hi'];
  }

  private extractClosings(scenarios: ScenarioAnswer[]): string[] {
    const intro = scenarios.find((s) => s.questionID === 'client_introduction');
    if (intro?.answer) {
      const closings = intro.answer.match(/(Best|Cheers|Looking forward|Talk soon)[^,.\n]*/gi);
      return closings || ['Best regards'];
    }
    return ['Best regards'];
  }

  private extractFramework(scenarios: ScenarioAnswer[]): string {
    const methodology = scenarios.find((s) => s.questionID === 'program_structure');
    return methodology?.answer || 'A comprehensive coaching framework';
  }

  private extractApproach(scenarios: ScenarioAnswer[]): string {
    const methodology = scenarios.find((s) => s.questionID === 'program_structure');
    return methodology?.answer || '';
  }

  private extractUVP(scenarios: ScenarioAnswer[]): string {
    const unique = scenarios.find((s) => s.questionID === 'unique_approach');
    return unique?.answer || '';
  }

  private extractIdealClient(scenarios: ScenarioAnswer[]): string {
    const target = scenarios.find((s) => s.questionID === 'ideal_client');
    return target?.answer || '';
  }

  private extractBestFit(scenarios: ScenarioAnswer[]): string[] {
    const target = scenarios.find((s) => s.questionID === 'ideal_client');
    if (target?.answer) {
      return [target.answer];
    }
    return [];
  }

  private extractServices(scenarios: ScenarioAnswer[]): string[] {
    const methodology = scenarios.find((s) => s.questionID === 'program_structure');
    if (methodology?.answer) {
      return [methodology.answer];
    }
    return ['1-on-1 coaching', 'group programs'];
  }

  private extractPricing(scenarios: ScenarioAnswer[]): string {
    const pricing = scenarios.find((s) => s.questionID === 'pricing_inquiry');
    return pricing?.answer || '';
  }

  private extractPattern(scenarios: ScenarioAnswer[], category: string): string {
    const pattern = scenarios.find((s) => s.category === category);
    return pattern?.answer || '';
  }

  async getOnboardingStatus(coachID: string) {
    const onboarding = await this.prisma.coachOnboarding.findUnique({
      where: { coachID },
    });

    const scenarios = await this.prisma.coachScenarioAnswer.count({
      where: { coachID },
    });

    const documents = await this.prisma.coachKnowledgeFile.count({
      where: { coachID },
    });

    const connections = await this.prisma.coachConnection.count({
      where: { coachID, status: 'connected' },
    });

    return {
      isComplete: !!onboarding?.completedAt,
      completedAt: onboarding?.completedAt,
      scenariosCompleted: scenarios,
      documentsUploaded: documents,
      connectionsLinked: connections,
      completionScore: this.calculateCompletionScore(scenarios, documents, connections),
    };
  }

  private calculateCompletionScore(scenarios: number, documents: number, connections: number): number {
    const scenarioScore = Math.min(scenarios / 12, 1) * 40;
    const documentScore = Math.min(documents / 10, 1) * 30;
    const connectionScore = connections >= 1 ? 20 : 0;
    const socialScore = connections > 1 ? 10 : 0;

    return Math.round(scenarioScore + documentScore + connectionScore + socialScore);
  }
}
