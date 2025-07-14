import {Client} from "./client";
import {Coach} from "./coach";

export interface AiAgent {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  isActive?: boolean | null;
  defaultConfig?: any | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  aiInteractions?: AiInteraction[];
  coachAiAgents?: CoachAiAgent[];
}

export interface AiInteraction {
  id: string;
  coachID: string;
  agentID: string;
  clientID?: string | null;
  interactionType: string;
  inputData: any;
  outputData: any;
  tokensUsed?: number | null;
  processingTimeMs?: number | null;
  confidenceScore?: number | null;
  status?: string | null;
  errorMessage?: string | null;
  createdAt?: Date | null;
  aiAgent?: AiAgent;
  client?: Client | null;
  coach?: Coach;
}

export interface CoachAiAgent {
  id: string;
  coachID: string;
  agentID: string;
  isEnabled?: boolean | null;
  customConfig?: any | null;
  fineTunedModelID?: string | null;
  totalRequests?: number | null;
  totalTokensUsed?: bigint | null;
  lastUsedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  aiAgent?: AiAgent;
  coach?: Coach;
}
