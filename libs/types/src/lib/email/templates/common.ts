import {EmailTemplateCategory, EmailTemplateStatus} from "./enums";

export interface EmailTemplateVariable {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface EmailTemplatePreview {
  subject: string;
  body: string;
  variables: Record<string, any>;
}

export interface EmailTemplateUsageStats {
  totalUsage: number;
  lastUsedAt?: string;
  openRate?: number;
  clickRate?: number;
  responseRate?: number;
}

export interface EmailTemplate {
  id: string;
  coachID: string;
  name: string;
  category: EmailTemplateCategory;
  subjectTemplate: string;
  bodyTemplate: string;
  isAiGenerated: boolean;
  generationPrompt?: string;
  variables: EmailTemplateVariable[];
  usageCount: number;
  lastUsedAt?: string;
  status: EmailTemplateStatus;
  createdAt: string;
  updatedAt: string;
}
