import {ScenarioAnswer, UploadedDocument} from "./responses";

export interface OnboardingRequest {
  scenarios: ScenarioAnswer[];
  documents: UploadedDocument[];
  completedAt?: Date;
}
