'use client';

import { useEffect, useState } from 'react';
import {useCookies} from "react-cookie";


declare global {
  interface Window {
    google: any;
  }
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface UseGoogleOAuthProps {
  onSuccess: (credentialResponse: GoogleCredentialResponse) => void;
  onError?: () => void;
}

export const useGoogleOAuth = ({ onSuccess, onError }: UseGoogleOAuthProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  // const [_, __, removeCookie] = useCookies<string>(['cookie-name']);

  let removeCookie: (name: string) => void;
  try {
    const [, , removeCookieHook] = useCookies<string>(['g_state']);
    removeCookie = removeCookieHook;
  } catch (e) {
    removeCookie = () => {}; // No-op fallback
  }

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: onSuccess,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
          ux_mode: 'popup',
        });
        setIsLoaded(true);
      }
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [onSuccess]);

  const signIn = () => {
    removeCookie('g_state')
    if (window.google && isLoaded) {
      window.google.accounts.id.prompt();
    }
  };

  return {
    isLoaded,
    signIn,
  };
};
