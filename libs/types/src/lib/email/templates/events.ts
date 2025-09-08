import {BaseEvent} from "@nlc-ai/api-messaging";

export interface EmailTemplateCreatedEvent extends BaseEvent {
  eventType: 'email.template.created';
  payload: {
    templateID: string;
    coachID: string;
    templateName: string;
    category: string;
    isAiGenerated: boolean;
    createdAt: string;
  };
}

export interface EmailTemplateUsedEvent extends BaseEvent {
  eventType: 'email.template.used';
  payload: {
    templateID: string;
    coachID: string;
    templateName: string;
    usageCount: number;
    usedAt: string;
    emailID?: string;
    recipientType: 'lead' | 'client';
  };
}

export interface EmailTemplateUpdatedEvent extends BaseEvent {
  eventType: 'email.template.updated';
  payload: {
    templateID: string;
    coachID: string;
    templateName: string;
    changes: Record<string, any>;
    updatedAt: string;
  };
}

export interface EmailTemplateDeletedEvent extends BaseEvent {
  eventType: 'email.template.deleted';
  payload: {
    templateID: string;
    coachID: string;
    templateName: string;
    deletedAt: string;
    usageCount: number;
  };
}

export interface EmailTemplateEventPayloads {
  'email.template.created': EmailTemplateCreatedEvent['payload'];
  'email.template.used': EmailTemplateUsedEvent['payload'];
  'email.template.updated': EmailTemplateUpdatedEvent['payload'];
  'email.template.deleted': EmailTemplateDeletedEvent['payload'];
}

export type EmailTemplateEvent =
  | EmailTemplateCreatedEvent
  | EmailTemplateUsedEvent
  | EmailTemplateUpdatedEvent
  | EmailTemplateDeletedEvent;

export const EMAIL_TEMPLATE_ROUTING_KEYS = {
  TEMPLATE_CREATED: 'email.template.created',
  TEMPLATE_USED: 'email.template.used',
  TEMPLATE_UPDATED: 'email.template.updated',
  TEMPLATE_DELETED: 'email.template.deleted',
};
