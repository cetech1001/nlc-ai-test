import {Coach} from "./coach";
import {WebhookEvent} from "./webhook";

export interface Integration {
  id: string;
  coachID: string;
  integrationType: string;
  platformName: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  apiKey?: string | null;
  webhookSecret?: string | null;
  config?: any | null;
  syncSettings?: any | null;
  isActive?: boolean | null;
  lastSyncAt?: Date | null;
  syncError?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  coach?: Coach;
  webhookEvents?: WebhookEvent[];
}
