import {appConfig} from "@nlc-ai/web-shared";
import { NLCClient } from '@nlc-ai/sdk-main';

const getAuthToken = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem(appConfig.auth.tokenKey) || undefined;
};

export const sdkClient = new NLCClient({
  baseURL: appConfig.api.baseURL,
  apiKey: getAuthToken(),
  leadsPublicToken: process.env.NEXT_PUBLIC_LEADS_PUBLIC_TOKEN,
  timeout: appConfig.api.timeout,
  services: appConfig.api.services,
});
