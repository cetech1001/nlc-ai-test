export interface BaseEvent {
  eventID: string;
  occurredAt: string;
  producer: string;
  schemaVersion: number;
  traceID?: string;
  source: string;
  eventType: string;
}
