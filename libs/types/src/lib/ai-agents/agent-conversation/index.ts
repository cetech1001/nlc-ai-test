export enum AgentType {
  CONTENT_CREATION = 'content_creation',
  EMAIL_RESPONSE = 'email_response',
  LEAD_FOLLOWUP = 'lead_followup',
  CLIENT_RETENTION = 'client_retention',
  COACH_REPLICA = 'coach_replica',
}

export interface AgentConversation {
  id: string;
  agentType: string;
  title: string | null;
  totalMessages: number;
  lastMessageAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

export interface AgentConversationMessage {
  id: string;
  senderType: 'coach' | 'agent';
  content: string;
  messageType: string;
  metadata: any;
  createdAt: Date;
  artifacts?: ConversationArtifact[];
}

export interface ConversationArtifact {
  id: string;
  artifactType: string;
  title: string;
  content: any;
  metadata: any;
  version: number;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationHistory {
  id: string;
  agentType: string;
  title: string | null;
  totalMessages: number;
  lastMessageAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  messages: AgentConversationMessage[];
  artifacts: ConversationArtifact[];
}
