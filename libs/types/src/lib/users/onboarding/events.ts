import {BaseEvent} from "../../base-event";

export const ONBOARDING_EVENTS = {
  COMPLETED: 'onboarding.coach.completed',
  PROGRESS_SAVED: 'onboarding.coach.progress_saved',
  PROFILE_GENERATED: 'onboarding.coach.profile_generated',
} as const;

export interface OnboardingCompletedPayload extends BaseEvent{
  eventType: 'onboarding.coach.completed',
  payload: {
    coachID: string;
    email: string;
    firstName: string;
    lastName: string;
    scenariosCount: number;
    documentsCount: number;
    connectionsCount: number;
    completedAt: string;
  }
}

export interface OnboardingProgressSavedPayload extends BaseEvent{
  eventType: 'onboarding.coach.progress_saved',
  payload: {
    coachID: string;
    scenariosCompleted: number;
  }
}

export type OnboardingEvent = OnboardingCompletedPayload | OnboardingProgressSavedPayload;
