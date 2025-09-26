import {appConfig} from "@nlc-ai/web-shared";
import { NLCClient } from '@nlc-ai/sdk-main';
import {TokenStorage} from "@nlc-ai/web-auth";

const getAuthToken = (): string | undefined => {
  const tokenStorage = new TokenStorage();
  const token = tokenStorage.getToken();
  return token || undefined;
};

export const sdkClient = new NLCClient({
  baseURL: appConfig.api.baseURL,
  apiKey: getAuthToken(),
  timeout: appConfig.api.timeout,
  services: appConfig.api.services,
});
