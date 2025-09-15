import {EMAIL_ACCOUNT_ROUTING_KEYS, EmailAccountEvent, EmailAccountEventPayloads} from "./accounts";
import {SCHEDULED_EMAIL_ROUTING_KEYS, ScheduledEmailEvent, ScheduledEmailEventPayloads} from "./scheduled";
import {EMAIL_SEQUENCE_ROUTING_KEYS, EmailSequenceEvent, EmailSequenceEventPayloads} from "./sequences";
import {EMAIL_TEMPLATE_ROUTING_KEYS, EmailTemplateEvent, EmailTemplateEventPayloads} from "./templates";
import {EMAIL_THREAD_ROUTING_KEYS, EmailThreadEvent, EmailThreadEventPayloads} from "./threads";
import {
  CORE_EMAIL_ROUTING_KEYS,
  EMAIL_PERFORMANCE_ROUTING_KEYS,
  EMAIL_SYSTEM_ROUTING_KEYS,
  BULK_OPERATION_ROUTING_KEYS,
  EmailBulkOperationEvent,
  EmailBulkOperationEventPayloads,
  EmailCoreEvent,
  EmailCoreEventPayloads,
  EmailPerformanceEvent,
  EmailPerformanceEventPayloads,
  EmailSystemEvent,
  EmailSystemEventPayloads
} from "./common";

export type EmailEvent =
  | EmailAccountEvent
  | ScheduledEmailEvent
  | EmailSequenceEvent
  | EmailTemplateEvent
  | EmailThreadEvent
  | EmailCoreEvent
  | EmailSystemEvent
  | EmailBulkOperationEvent
  | EmailPerformanceEvent

export type EmailEventPayloads =
  | EmailAccountEventPayloads
  | ScheduledEmailEventPayloads
  | EmailSequenceEventPayloads
  | EmailTemplateEventPayloads
  | EmailThreadEventPayloads
  | EmailCoreEventPayloads
  | EmailSystemEventPayloads
  | EmailBulkOperationEventPayloads
  | EmailPerformanceEventPayloads;

export type EmailEventType = keyof EmailEventPayloads;

export const EMAIL_ROUTING_KEYS = {
  ...CORE_EMAIL_ROUTING_KEYS,
  ...SCHEDULED_EMAIL_ROUTING_KEYS,
  ...EMAIL_SEQUENCE_ROUTING_KEYS,
  ...EMAIL_TEMPLATE_ROUTING_KEYS,
  ...EMAIL_ACCOUNT_ROUTING_KEYS,
  ...EMAIL_THREAD_ROUTING_KEYS,
  ...EMAIL_SYSTEM_ROUTING_KEYS,
  ...BULK_OPERATION_ROUTING_KEYS,
  ...EMAIL_PERFORMANCE_ROUTING_KEYS,
} as const;
