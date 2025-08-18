import { NLCClient } from '@nlc-ai/sdk-main';
import config from '@/config/app.config';

const getAuthToken = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem(config.auth.tokenKey) || undefined;
};

export const sdkClient = new NLCClient({
  baseURL: config.api.baseURL,
  apiKey: getAuthToken(),
  timeout: config.api.timeout,
  services: config.api.services,
});

export const updateSDKToken = (token: string | null) => {
  sdkClient.auth = new (require('@nlc-ai/sdk-auth').AuthServiceClient)({
    baseURL: config.api.services.auth,
    apiKey: token || undefined,
    timeout: config.api.timeout,
  });

  sdkClient.users = new (require('@nlc-ai/sdk-users').UsersServiceClient)({
    baseURL: config.api.services.users,
    apiKey: token || undefined,
    timeout: config.api.timeout,
  });

  sdkClient.analytics = new (require('@nlc-ai/sdk-analytics').AnalyticsServiceClient)({
    baseURL: config.api.services.analytics,
    apiKey: token || undefined,
    timeout: config.api.timeout,
  });
};
