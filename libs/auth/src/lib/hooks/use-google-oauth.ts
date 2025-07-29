'use client';

import { useEffect, useState } from 'react';


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

export const useGoogleOAuth = ({ onSuccess }: UseGoogleOAuthProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

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
    document.cookie = 'g_state=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname;

    if (window.google && isLoaded) {
      window.google.accounts.id.prompt();
    }
  };

  return {
    isLoaded,
    signIn,
  };
};
