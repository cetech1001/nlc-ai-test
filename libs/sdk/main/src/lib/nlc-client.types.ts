export interface NLCClientConfig {
  baseURL: string;
  apiKey?: string;
  leadsPublicToken?: string
  timeout?: number;
  services?: {
    auth?: string;
    users?: string;
    leads?: string;
    email?: string;
    billing?: string;
    analytics?: string;
    community?: string;
    media?: string;
    notifications?: string;
    messaging?: string;
    agents?: string;
    courses?: string;
    integrations?: string;
  };
}
