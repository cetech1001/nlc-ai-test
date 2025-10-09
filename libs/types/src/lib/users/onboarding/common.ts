import {ScenarioAnswer, UploadedDocument} from "./responses";
import {Integration} from "../../integrations";

export interface OnboardingData {
  scenarios: ScenarioAnswer[];
  documents: UploadedDocument[];
  connections: Integration[];
  completedAt?: Date;
}
