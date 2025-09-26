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
    communities?: string;
    media?: string;
    notifications?: string;
    messages?: string;
    agents?: string;
    courses?: string;
    integrations?: string;
    content?: string;
  };
}
