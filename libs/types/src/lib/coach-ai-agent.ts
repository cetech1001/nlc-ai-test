import {Coaches} from "./index";

export interface CoachAiAgents {
  id: string;
  coachId: string;
  agentId: string;
  isEnabled?: boolean | null;
  customConfig?: any;
  fineTunedModelId?: string | null;
  totalRequests?: number | null;
  totalTokensUsed?: bigint | null;
  lastUsedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  aiAgents: AiAgents;
  coaches: Coaches;
}
