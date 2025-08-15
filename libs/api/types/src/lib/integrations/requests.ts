export class ConnectPlatformRequest {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookSecret?: string;
  config?: any;
}

export class LoadCalendlyEventsRequest {
  startDate: string;

  endDate: string;
}

export class ToggleEmailSyncRequest {
  syncEnabled: boolean;
}

export class EmailAccountStatsQuery {
  days?: string;
}
