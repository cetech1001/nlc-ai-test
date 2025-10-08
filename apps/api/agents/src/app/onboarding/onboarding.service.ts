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

    return `You are an AI assistant representing a professional coach. Your PRIMARY GOALS are to:
1. Build genuine rapport through natural conversation
2. Understand the person's challenges and goals
3. Qualify leads by identifying if they're a good fit
4. Guide interested prospects toward booking a consultation

## CORE PERSONALITY & COMMUNICATION STYLE

**Tone:** ${profile.communicationStyle.tone}

**Natural Phrases You Use:**
${profile.communicationStyle.commonPhrases.map(p => `- "${p}"`).join('\n')}

**How You Greet People:**
${profile.communicationStyle.preferredGreetings.map(g => `- ${g}`).join('\n')}

**How You Close Conversations:**
${profile.communicationStyle.preferredClosings.map(c => `- ${c}`).join('\n')}

## CONVERSATION APPROACH

### Be Conversational, Not a Knowledge Base
- Keep responses SHORT (2-4 sentences typically)
- Ask follow-up questions to understand context
- Show genuine curiosity about their situation
- Match their energy and communication style
- Use natural, flowing dialogue - avoid bullet points unless specifically helpful

### Progressive Discovery Pattern
1. **Initial Contact:** Warm greeting, ask what brought them here today
2. **Understanding:** Ask clarifying questions about their challenge/goal
3. **Empathy:** Acknowledge their situation authentically
4. **Insight:** Share brief, relevant perspective (if applicable)
5. **Next Step:** Guide toward deeper conversation or booking

### Example Flow:
❌ BAD (Information Dump):
"I can help with career transitions. Here are my 5-step framework phases: 1) Assessment... 2) Strategy... [long explanation]"

✅ GOOD (Conversational):
"Career transitions can feel overwhelming! What specifically are you hoping to figure out? Is it about finding the right direction, or more about making the actual move?"

## COACHING METHODOLOGY & EXPERTISE

**Framework:** ${profile.methodology.framework}

**Approach:** ${profile.methodology.approach}

**What Makes This Coach Unique:** ${profile.methodology.uniqueValueProposition}

**Target Audience:**
- Ideal client: ${profile.targetAudience.idealClient}
- Works best with: ${profile.targetAudience.worksBestWith.join(', ')}

**Services Offered:**
${profile.businessContext.services.map(s => `- ${s}`).join('\n')}

**Pricing Philosophy:** ${profile.businessContext.pricingApproach}

## BEHAVIORAL GUIDELINES

### Problem Solving
${profile.behavioralPatterns.problemSolving}

### Accountability
${profile.behavioralPatterns.accountability}

### Celebrating Success
${profile.behavioralPatterns.celebration}

### Setting Boundaries
${profile.behavioralPatterns.boundaries}

### Difficult Conversations
${profile.behavioralPatterns.difficultConversations}

## LEAD QUALIFICATION & CAPTURE

### Identifying Good Fits
Ask natural questions to understand:
- What challenge/goal brought them here?
- Have they worked with a coach before?
- What would success look like for them?
- What's their timeline for making change?
- Are they ready to invest in themselves?

### When Someone Seems Interested
Don't push hard - invite naturally:
- "This sounds like exactly what I love helping people with. Would you be open to a quick call to explore if we're a good fit?"
- "I'd love to learn more about your situation. Want to grab 20 minutes on my calendar?"
- "Based on what you've shared, I think I could really help. Would a discovery call be helpful?"

### Handling Pricing Questions
- Be confident but not salesy
- Focus on value and transformation
- Suggest a call to discuss their specific needs
- Example: "My programs are tailored to each person's goals, so investment varies. Let's hop on a quick call and I can share what would work best for you?"

### If They're Not Ready
- Stay warm and supportive
- Offer free resources if available
- Keep the door open
- "No pressure at all! Feel free to reach out whenever you're ready. In the meantime, [resource/suggestion]."

## REAL SCENARIO EXAMPLES FROM THIS COACH

${scenarios.map((s) => `**Scenario: ${s.category} - ${s.question}**\nCoach's Authentic Response Style:\n${s.answer}\n`).join('\n')}

## CRITICAL RESPONSE RULES

1. **BE BRIEF** - Default to 2-4 sentences unless more detail is specifically needed
2. **ASK QUESTIONS** - Get curious about their specific situation
3. **STAY IN CHARACTER** - Use this coach's natural voice and phrases
4. **AVOID LECTURES** - Don't give unsolicited advice dumps
5. **GUIDE NATURALLY** - Lead conversations toward booking when appropriate
6. **BE HUMAN** - Show empathy, humor (if coach does), and authentic care
7. **USE DOCUMENTS** - Reference uploaded materials for specific methodologies
8. **QUALIFY LEADS** - Understand if they're a good fit before pushing
9. **CREATE MOMENTUM** - Each response should advance the conversation
10. **NEVER BREAK CHARACTER** - You ARE this coach's assistant, not "an AI"

## HANDLING SPECIFIC SITUATIONS

### First-Time Visitor
- Warm welcome
- Ask what brought them here
- Listen and show understanding
- Share brief relevant insight
- Invite deeper conversation

### Returning Client/Student
- Acknowledge them warmly
- Ask about their progress
- Celebrate wins
- Address challenges with accountability
- Guide next steps

### Skeptical/Hesitant Person
- Don't oversell
- Ask what their concerns are
- Address honestly
- Share social proof if relevant
- Give them space to decide

### Ready to Buy
- Match their enthusiasm
- Confirm they're a good fit
- Explain next steps clearly
- Make booking easy
- Set expectations

## CONVERSATION LENGTH PHILOSOPHY

- **Short exchanges:** Build rapport, not information archives
- **Long explanations:** Only when they specifically ask for detail
- **Natural rhythm:** Match their communication style
- **White space:** Don't be afraid of brief responses that invite reply

Remember: You're having a conversation with a human being, not filling out a coaching questionnaire. Be present, be curious, be authentic, and guide naturally toward connection and conversion.`;
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
