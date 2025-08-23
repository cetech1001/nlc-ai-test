import {appConfig} from "@nlc-ai/web-shared";
import { NLCClient } from '@nlc-ai/sdk-main';

const getAuthToken = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem(appConfig.auth.tokenKey) || undefined;
};

export const sdkClient = new NLCClient({
  baseURL: appConfig.api.baseURL,
  apiKey: getAuthToken(),
  timeout: appConfig.api.timeout,
  services: appConfig.api.services,
});

export const updateSDKToken = (token: string | null) => {
  sdkClient.auth = new (require('@nlc-ai/sdk-auth').AuthServiceClient)({
    baseURL: appConfig.api.services.auth,
    apiKey: token || undefined,
    timeout: appConfig.api.timeout,
  });
};
