'use client';

import {ReactNode, useEffect} from "react";
import { AuthLayout, AuthLayoutProvider, useAuth, AuthSkeleton } from '@nlc-ai/auth';
import {useRouter} from "next/navigation";
import {CookiesProvider} from "react-cookie";

const CoachAuthLayout = ({ children }: {
  children: ReactNode;
}) => {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <AuthSkeleton/>;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
      <AuthLayoutProvider>
        <AuthLayout>
          {children}
        </AuthLayout>
      </AuthLayoutProvider>
    </CookiesProvider>
  );
}

export default CoachAuthLayout;
