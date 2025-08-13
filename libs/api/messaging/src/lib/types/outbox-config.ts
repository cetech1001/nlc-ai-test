export interface OutboxConfig {
  batchSize?: number;
  maxRetries?: number;
  retentionDays?: number;
}
