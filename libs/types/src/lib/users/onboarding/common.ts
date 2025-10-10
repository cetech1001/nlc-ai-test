import {ScenarioAnswer, UploadedDocument} from "./responses";

export interface OnboardingData {
  scenarios: ScenarioAnswer[];
  documents: UploadedDocument[];
  completedAt?: Date;
}
