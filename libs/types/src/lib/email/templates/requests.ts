import { QueryParams } from '../../query-params';
import { EmailTemplateCategory, EmailTemplateStatus } from './enums';
import { EmailTemplateVariable } from './common';

export interface CreateEmailTemplateRequest {
  name: string;
  category: EmailTemplateCategory;
  subjectTemplate: string;
  bodyTemplate: string;
  variables?: EmailTemplateVariable[];
  isAiGenerated?: boolean;
  generationPrompt?: string;
}

export interface UpdateEmailTemplateRequest {
  name?: string;
  category?: EmailTemplateCategory;
  subjectTemplate?: string;
  bodyTemplate?: string;
  variables?: EmailTemplateVariable[];
  status?: EmailTemplateStatus;
}

export interface GetEmailTemplatesRequest extends QueryParams {
  coachID?: string;
  category?: EmailTemplateCategory;
  status?: EmailTemplateStatus;
  isAiGenerated?: boolean;
  name?: string;
}

export interface PreviewEmailTemplateRequest {
  templateID: string;
  variables: Record<string, any>;
  recipientType?: 'lead' | 'client';
}

export interface DuplicateEmailTemplateRequest {
  templateID: string;
  newName: string;
}

export interface GenerateEmailTemplateRequest {
  coachID: string;
  category: EmailTemplateCategory;
  purpose: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  audience?: 'leads' | 'clients' | 'prospects';
  includeVariables?: string[];
  additionalInstructions?: string;
}

export interface BulkUpdateTemplatesRequest {
  templateIDs: string[];
  updates: {
    status?: EmailTemplateStatus;
    category?: EmailTemplateCategory;
  };
}
