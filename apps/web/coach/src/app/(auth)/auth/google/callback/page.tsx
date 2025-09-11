'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@nlc-ai/web-auth';
import {UserType} from "@nlc-ai/types";
import {appConfig} from "@nlc-ai/web-shared";

const GoogleAuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem(appConfig.auth.tokenKey, token);

      checkAuthStatus(UserType.COACH).then(() => {
        router.push('/home');
      }).catch(() => {
        router.push('/login?error=auth_failed');
      });
    } else {
      router.push('/login?error=no_token');
    }
  }, [searchParams, router, checkAuthStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-white mt-4">Completing authentication...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallbackPage;
