import { EmailTemplate, EmailTemplatePreview, EmailTemplateUsageStats } from './common';

export interface CreateEmailTemplateResponse {
  template: EmailTemplate;
  success: boolean;
  message: string;
}

export interface GetEmailTemplateResponse {
  template: EmailTemplate;
  usageStats: EmailTemplateUsageStats;
}

export interface GetEmailTemplatesResponse {
  templates: EmailTemplate[];
  total: number;
  hasMore: boolean;
}

export interface UpdateEmailTemplateResponse {
  template: EmailTemplate;
  success: boolean;
  message: string;
}

export interface PreviewEmailTemplateResponse {
  preview: EmailTemplatePreview;
  missingVariables: string[];
  success: boolean;
}

export interface DuplicateEmailTemplateResponse {
  template: EmailTemplate;
  success: boolean;
  message: string;
}

export interface GenerateEmailTemplateResponse {
  template: EmailTemplate;
  generationDetails: {
    prompt: string;
    model: string;
    tokensUsed: number;
    generatedAt: string;
  };
  success: boolean;
  message: string;
}

export interface DeleteEmailTemplateResponse {
  success: boolean;
  message: string;
}

export interface GetTemplateUsageStatsResponse {
  stats: EmailTemplateUsageStats;
  recentUsage: Array<{
    date: string;
    count: number;
    openRate?: number;
    clickRate?: number;
  }>;
}

export interface BulkUpdateTemplatesResponse {
  updatedCount: number;
  failedCount: number;
  errors: Array<{
    templateID: string;
    error: string;
  }>;
  success: boolean;
  message: string;
}
