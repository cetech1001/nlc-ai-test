import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { ReplicaService } from '../../replica/replica.service';

@Injectable()
export class OnboardingHandler {
  private readonly logger = new Logger(OnboardingHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly replica: ReplicaService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'agents.onboarding-completed',
      ['onboarding.coach.completed'],
      this.handleOnboardingCompleted.bind(this)
    );
  }

  private async handleOnboardingCompleted(event: any) {
    try {
      const { coachID, firstName, profile, scenarios } = event.payload;

      this.logger.log(`Processing onboarding completion for coach ${coachID}`);

      const aiConfig = await this.replica.initializeCoachAI(
        coachID,
        `${firstName}'s AI Assistant`
      );

      const instructions = await this.replica.buildAIInstructions(profile, scenarios);
      await this.replica.updateAssistantInstructions(coachID, instructions);
      await this.replica.addFilesToVectorStore(coachID);

      this.logger.log(`AI assistant configured for coach ${coachID}`, {
        assistantID: aiConfig.assistantID,
        vectorStoreID: aiConfig.vectorStoreID,
      });

    } catch (error) {
      this.logger.error('Failed to handle onboarding completion:', error);
    }
  }
}
