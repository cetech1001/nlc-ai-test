import {appConfig} from "@nlc-ai/web-shared";
import { NLCClient } from '@nlc-ai/sdk-main';
import {TokenStorage} from "@nlc-ai/web-auth";

const tokenStorage = new TokenStorage({
  cookieOptions: {
    secure: process.env.NEXT_PUBLIC_ENV === 'production',
    sameSite: 'lax',
  }
});

export const sdkClient = new NLCClient({
  baseURL: appConfig.api.baseURL,
  apiKey: tokenStorage.getToken() || undefined,
  getToken: tokenStorage.getToken,
  timeout: appConfig.api.timeout,
  services: appConfig.api.services,
});

if (typeof window !== 'undefined') {
  import('@nlc-ai/web-auth').then(({ authAPI }) => {
    authAPI.setTokenUpdateCallback((token) => {
      sdkClient.updateApiKey(token);
    });
  });
}
