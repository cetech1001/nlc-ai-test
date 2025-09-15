import {BaseEvent} from "../../base-event";

export interface EmailBulkOperationStartedEvent extends BaseEvent {
  eventType: 'email.bulk.operation.started';
  payload: {
    operationID: string;
    operationType: 'send' | 'template_update' | 'cleanup' | 'sync' | 'cancel';
    coachID?: string;
    itemCount: number;
    startedAt: string;
  };
}

export interface EmailBulkOperationCompletedEvent extends BaseEvent {
  eventType: 'email.bulk.operation.completed';
  payload: {
    operationID: string;
    operationType: 'send' | 'template_update' | 'cleanup' | 'sync' | 'cancel';
    coachID?: string;
    successCount: number;
    failureCount: number;
    completedAt: string;
    duration: number; // milliseconds
  };
}

export interface EmailBulkOperationFailedEvent extends BaseEvent {
  eventType: 'email.bulk.operation.failed';
  payload: {
    operationID: string;
    operationType: 'send' | 'template_update' | 'cleanup' | 'sync' | 'cancel';
    coachID?: string;
    error: string;
    processedCount: number;
    failedAt: string;
  };
}

export type EmailBulkOperationEvent =
  | EmailBulkOperationStartedEvent
  | EmailBulkOperationCompletedEvent
  | EmailBulkOperationFailedEvent;

export interface EmailBulkOperationEventPayloads {
  'email.bulk.operation.started': EmailBulkOperationStartedEvent['payload'];
  'email.bulk.operation.completed': EmailBulkOperationCompletedEvent['payload'];
  'email.bulk.operation.failed': EmailBulkOperationFailedEvent['payload'];
}

export const BULK_OPERATION_ROUTING_KEYS = {
  BULK_OPERATION_STARTED: 'email.bulk.operation.started',
  BULK_OPERATION_COMPLETED: 'email.bulk.operation.completed',
  BULK_OPERATION_FAILED: 'email.bulk.operation.failed',
};
