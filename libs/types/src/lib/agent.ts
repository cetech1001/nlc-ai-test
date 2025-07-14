import {Client} from "./client";
import {Coach} from "./coach";
import {CoachAiAgents} from "@prisma/client";

export interface AiAgents {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  isActive?: boolean | null;
  defaultConfig?: any;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  aiInteractions: AiInteractions[];
  coachAiAgents: CoachAiAgents[];
}

export interface AiInteractions {
  id: string;
  coachId: string;
  agentId: string;
  clientId?: string | null;
  interactionType: string;
  inputData: any;
  outputData: any;
  tokensUsed?: number | null;
  processingTimeMs?: number | null;
  confidenceScore?: number | null;
  status?: string | null;
  errorMessage?: string | null;
  createdAt?: Date | null;
  aiAgents: AiAgents;
  client?: Client;
  coach: Coach;
}
