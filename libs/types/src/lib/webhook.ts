import {Integration} from "./integration";

export interface WebhookEvent {
  id: string;
  integrationID?: string | null;
  eventType: string;
  eventData: any;
  sourcePlatform: string;
  status?: string | null;
  processedAt?: Date | null;
  errorMessage?: string | null;
  retryCount?: number | null;
  createdAt?: Date | null;
  integration?: Integration | null;
}
