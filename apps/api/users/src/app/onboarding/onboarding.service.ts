import { Injectable, Logger } from '@nestjs/common';
import { OutboxService } from '@nlc-ai/api-messaging';
import {CoachingProfile, OnboardingRequest, OnboardingEvent, ScenarioAnswer} from '@nlc-ai/types';
import { OnboardingRepository } from './repositories/onboarding.repository';
import { ONBOARDING_EVENTS } from '@nlc-ai/types';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly repository: OnboardingRepository,
    private readonly outbox: OutboxService,
  ) {}

  async saveOnboardingData(coachID: string, data: OnboardingRequest) {
    this.logger.log(`Saving onboarding data for coach ${coachID}`);

    await this.repository.saveOnboardingData(coachID, data);

    await this.outbox.saveAndPublishEvent<OnboardingEvent>({
      eventType: ONBOARDING_EVENTS.PROGRESS_SAVED,
      schemaVersion: 1,
      payload: {
        coachID,
        scenariosCompleted: data.scenarios.length,
      },
    }, ONBOARDING_EVENTS.PROGRESS_SAVED);

    return { success: true, message: 'Onboarding progress saved successfully' };
  }

  async markOnboardingComplete(coachID: string) {
    await this.repository.markComplete(coachID);

    const coach = await this.repository.getCoach(coachID);
    const status = await this.repository.getStatus(coachID);

    await this.outbox.saveAndPublishEvent<OnboardingEvent>({
      eventType: ONBOARDING_EVENTS.COMPLETED,
      schemaVersion: 1,
      payload: {
        coachID,
        email: coach?.email || '',
        firstName: coach?.firstName || '',
        lastName: coach?.lastName || '',
        scenariosCount: status.scenariosCompleted,
        documentsCount: status.documentsUploaded,
        connectionsCount: status.connectionsLinked,
        completedAt: new Date().toISOString(),
      },
    }, ONBOARDING_EVENTS.COMPLETED);
  }

  async getOnboardingData(coachID: string): Promise<OnboardingRequest> {
    return this.repository.getOnboardingData(coachID);
  }

  async getOnboardingStatus(coachID: string) {
    const status = await this.repository.getStatus(coachID);
    const completionScore = await this.repository.calculateCompletionScore(coachID);

    return {
      ...status,
      completionScore,
    };
  }

  async generateCoachingProfile(coachID: string): Promise<CoachingProfile> {
    const scenarios = await this.repository.getScenarios(coachID);

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
}
