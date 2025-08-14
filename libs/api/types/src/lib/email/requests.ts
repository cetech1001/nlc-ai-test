export interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  templateID?: string;
  metadata?: Record<string, any>;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface TemplateFilters {
  category?: string;
  search?: string;
  tags?: string[];
  isAiGenerated?: boolean;
  isActive?: boolean;
  sortBy?: 'name' | 'category' | 'usageCount' | 'createdAt' | 'lastUsedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateTemplateRequest {
  name: string;
  category: string;
  subjectTemplate: string;
  bodyTemplate: string;
  description?: string;
  tags?: string[];
  isAiGenerated?: boolean;
  generationPrompt?: string;
}

export interface UpdateTemplateRequest {
  name?: string;
  category?: string;
  subjectTemplate?: string;
  bodyTemplate?: string;
  description?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface MailgunWebhookEvent {
  signature: {
    token: string;
    timestamp: string;
    signature: string;
  };
  'event-data': {
    event: string;
    message: {
      headers: {
        'message-id': string;
      };
    };
    recipient: string;
    timestamp: number;
    'user-variables'?: {
      'email-record-id'?: string;
    };
    'client-info'?: {
      'client-name'?: string;
      'client-os'?: string;
      'device-type'?: string;
      'user-agent'?: string;
    };
    'geolocation'?: {
      city?: string;
      country?: string;
      region?: string;
    };
    ip?: string;
    url?: string;
    reason?: string;
    code?: string;
    description?: string;
    severity?: string;
  };
}
