import {appConfig} from "@nlc-ai/web-shared";
import { NLCClient } from '@nlc-ai/sdk-main';
import {TokenStorage} from "@nlc-ai/web-auth";


const tokenStorage = new TokenStorage();

export const sdkClient = new NLCClient({
  baseURL: appConfig.api.baseURL,
  apiKey: tokenStorage.getToken() || '',
  getToken: tokenStorage.getToken,
  antiSpamToken: process.env.NEXT_PUBLIC_ANTI_SPAM_TOKEN,
  timeout: appConfig.api.timeout,
  services: appConfig.api.services,
});
