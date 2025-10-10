import {BaseEvent} from "../../base-event";
import {CoachingProfile, ScenarioAnswer} from "./responses";

export const ONBOARDING_EVENTS = {
  COMPLETED: 'onboarding.coach.completed',
  PROGRESS_SAVED: 'onboarding.coach.progress_saved',
  PROFILE_GENERATED: 'onboarding.coach.profile_generated',
} as const;

export interface OnboardingCompletedPayload extends BaseEvent{
  eventType: 'onboarding.coach.completed',
  payload: {
    coachID: string;
    firstName: string;
    profile: CoachingProfile;
    scenarios: ScenarioAnswer[];
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
